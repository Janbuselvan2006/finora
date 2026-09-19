/**
 * n8n Webhook Integration Service for Finora
 * Connects Medical OCR, Salary/Income OCR, Lead generation, and Loan applications to automated n8n workflows.
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
 * Tests connection to an n8n webhook URL
 */
export async function testN8nWebhookConnection(url) {
  if (!url || !url.trim()) return { success: false, message: 'Please enter a valid webhook URL.' };
  try {
    const res = await fetch(url.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'PING_TEST', source: 'Finora App', timestamp: new Date().toISOString() })
    });
    if (res.ok) {
      return { success: true, message: '✓ Connection successful! n8n webhook is active and responding.' };
    } else {
      return { success: false, message: `Webhook reached but responded with HTTP ${res.status}.` };
    }
  } catch (err) {
    return { success: false, message: `Could not reach URL: ${err.message}` };
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

    return await response.json();
  } catch (err) {
    console.warn('Could not reach n8n webhook:', err);
    return null;
  }
}

/**
 * Triggers an n8n workflow for Salary Slip OCR, Employer Tiering & FOIR Calculation
 * @param {Object} data - { textContent, fileName, loanType, loanAmount, tenureYears }
 */
export async function triggerN8nSalaryOcr(data) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finora-Source': 'loan-salary-ocr'
      },
      body: JSON.stringify({
        event: 'LOAN_DOC_OCR_REQUEST',
        source: 'Finora AI Loan Finder',
        timestamp: new Date().toISOString(),
        payload: {
          fileName: data.fileName,
          textContent: data.textContent,
          loanType: data.loanType,
          loanAmount: data.loanAmount,
          tenureYears: data.tenureYears
        }
      })
    });

    if (!response.ok) {
      console.warn(`n8n salary OCR returned status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('Could not reach n8n salary OCR webhook:', err);
    return null;
  }
}

/**
 * Triggers an n8n workflow for Insurance Lead / Policy Selection
 * @param {Object} leadData - { type: 'insurance', customerName, amount, lenderOrPolicy, contact }
 */
export async function triggerN8nLeadSubmission(leadData) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finora-Source': 'insurance-lead-generation'
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

/**
 * Triggers an n8n workflow for Loan Application & Sanction Dispatch
 * @param {Object} applicationData - { applicantName, employerName, loanType, loanAmount, tenureYears, selectedLender, emi }
 */
export async function triggerN8nLoanApplication(applicationData) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finora-Source': 'loan-application-dispatch'
      },
      body: JSON.stringify({
        event: 'LOAN_APPLICATION_SUBMITTED',
        source: 'Finora Loan Underwriting Engine',
        timestamp: new Date().toISOString(),
        application: applicationData
      })
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('n8n loan application dispatch notice:', err);
    return null;
  }
}
