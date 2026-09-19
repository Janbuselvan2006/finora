/**
 * n8n Webhook Integration Service for Finora
 * Connects document OCR, lead generation, and voice queries to automated n8n workflows.
 */

// Load webhook URL from environment or localStorage override (configured via UI)
export function getN8nWebhookUrl() {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('finora_n8n_webhook_url');
    if (customUrl) return customUrl.trim();
  }
  return import.meta.env.VITE_N8N_WEBHOOK_URL || '';
}

export function setN8nWebhookUrl(url) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('finora_n8n_webhook_url', url.trim());
    } else {
      localStorage.removeItem('finora_n8n_webhook_url');
    }
  }
}

/**
 * Triggers an n8n workflow for Medical Document OCR & Clinical Analysis
 * @param {Object} data - { textContent, fileName, isPdf, base64File, timestamp }
 */
export async function triggerN8nMedicalOcr(data) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finora-Source': 'medical-doc-ocr'
      },
      body: JSON.stringify({
        event: 'MEDICAL_DOC_OCR_REQUEST',
        source: 'Finora AI Insurance Finder',
        timestamp: new Date().toISOString(),
        payload: {
          fileName: data.fileName,
          textContent: data.textContent,
          base64Data: data.base64Data || null
        }
      })
    });

    if (!response.ok) {
      console.warn(`n8n webhook returned status: ${response.status}`);
      return null;
    }

    const json = await response.json();
    return json;
  } catch (err) {
    console.warn('Could not reach n8n webhook:', err);
    return null;
  }
}

/**
 * Triggers an n8n workflow for Lead / Sanction Letter Generation
 * @param {Object} leadData - { type: 'insurance' | 'loan', customerName, amount, lenderOrPolicy, contact }
 */
export async function triggerN8nLeadSubmission(leadData) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finora-Source': 'lead-generation'
      },
      body: JSON.stringify({
        event: 'FINORA_APPLICATION_SUBMITTED',
        source: 'Finora FinTech Web App',
        timestamp: new Date().toISOString(),
        lead: leadData
      })
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('n8n lead submission notice:', err);
    return null;
  }
}
