import * as pdfjsLib from 'pdfjs-dist';

// Configure standard public CDN worker for Vite/browser execution
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Extracts plain text from an uploaded PDF file (File, Blob, or ArrayBuffer)
 * Uses pdfjs-dist page-by-page extraction with a native raw binary stream parser fallback.
 */
export async function extractTextFromPdf(fileOrBuffer) {
  let arrayBuffer;

  if (fileOrBuffer instanceof ArrayBuffer) {
    arrayBuffer = fileOrBuffer;
  } else if (fileOrBuffer && typeof fileOrBuffer.arrayBuffer === 'function') {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    return '';
  }

  // ATTEMPT 1: PDF.js full document text layer extraction
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      stopAtErrors: false
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (item.str ? item.str.trim() : ''))
          .filter(Boolean)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageErr) {
        console.warn(`Error extracting text from PDF page ${pageNum}:`, pageErr);
      }
    }

    if (fullText.trim().length > 10) {
      return fullText.trim();
    }
  } catch (pdfJsErr) {
    console.warn('PDF.js extraction failed, falling back to raw stream parsing:', pdfJsErr);
  }

  // ATTEMPT 2: Fallback to Native Raw PDF Stream & Literal String Parser
  return parseRawPdfBuffer(arrayBuffer);
}

/**
 * Fallback binary parser that scans raw PDF byte buffers for:
 * 1. Literal strings: (Text Here)
 * 2. Hex strings: <41706f6c6c6f...>
 * 3. Decompresses FlateDecode streams using browser-native DecompressionStream
 */
async function parseRawPdfBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(bytes);

  const extractedChunks = [];

  // Extract literal text strings inside parentheses: (Text) Tj or (Text)
  const literalMatches = rawString.match(/\(([^()\\]|\\.)*\)/g);
  if (literalMatches) {
    for (const match of literalMatches) {
      const clean = match
        .slice(1, -1)
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\r/g, ' ')
        .replace(/\\n/g, ' ')
        .trim();
      if (clean.length > 2 && /[A-Za-z0-9]/.test(clean)) {
        extractedChunks.push(clean);
      }
    }
  }

  // Extract PDF object metadata like /Title, /Author, /Subject
  const metaMatches = rawString.match(/\/(?:Title|Subject|Author|Keywords)\s*\(([^()]+)\)/gi);
  if (metaMatches) {
    for (const m of metaMatches) {
      const parts = m.split('(');
      if (parts[1]) {
        extractedChunks.push(parts[1].replace(/\)/g, '').trim());
      }
    }
  }

  // Try decompressing flate streams if native DecompressionStream is available
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let streamMatch;
      let count = 0;
      while ((streamMatch = streamRegex.exec(rawString)) !== null && count < 10) {
        count++;
        const streamStart = streamMatch.index + streamMatch[0].indexOf('\n') + 1;
        const streamEnd = streamMatch.index + streamMatch[0].lastIndexOf('endstream');
        if (streamEnd > streamStart) {
          const streamBytes = bytes.slice(streamStart, streamEnd);
          try {
            const decompressed = await decompressFlate(streamBytes);
            if (decompressed) {
              const subMatches = decompressed.match(/\(([^()\\]|\\.)*\)/g);
              if (subMatches) {
                for (const sm of subMatches) {
                  const sClean = sm.slice(1, -1).trim();
                  if (sClean.length > 2 && /[A-Za-z0-9]/.test(sClean)) {
                    extractedChunks.push(sClean);
                  }
                }
              }
            }
          } catch (_) {
            // ignore stream decompression failures on non-flate streams
          }
        }
      }
    } catch (e) {
      console.warn('Flate stream parsing notice:', e);
    }
  }

  return extractedChunks.join(' ').trim();
}

/**
 * Decompresses a raw flate stream using the browser's native DecompressionStream API
 */
async function decompressFlate(bytes) {
  try {
    // Try standard deflate stream
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const response = new Response(ds.readable);
    return await response.text();
  } catch (_) {
    try {
      // Try raw deflate (without zlib header)
      const dsRaw = new DecompressionStream('deflate-raw');
      const writer = dsRaw.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const response = new Response(dsRaw.readable);
      return await response.text();
    } catch (e2) {
      return null;
    }
  }
}
