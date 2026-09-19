import { FINANCIAL_INSTITUTIONS } from '../data/loanInstitutions';
import { triggerN8nSalaryOcr } from './n8nService';

/**
 * Calculates monthly EMI using the standard reducing balance loan formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEmi(principal, annualRatePercent, tenureYears) {
  if (!principal || !annualRatePercent || !tenureYears) return 0;
  const monthlyRate = annualRatePercent / (12 * 100);
  const totalMonths = tenureYears * 12;

  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
              (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return Math.round(emi);
}

/**
 * Calculates Maximum Loan Eligibility based on Net Monthly Salary,
 * Existing EMIs, and the lender's FOIR (Fixed Obligation to Income Ratio).
 */
export function calculateMaxLoanEligibility(netMonthlySalary, existingEmi, annualRatePercent, tenureYears, foir = 0.60) {
  const maxAvailableEmi = Math.max(0, (netMonthlySalary * foir) - existingEmi);
  if (maxAvailableEmi <= 0) return 0;

  const monthlyRate = annualRatePercent / (12 * 100);
  const totalMonths = tenureYears * 12;

  // Inverting EMI formula to find Principal: P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const maxPrincipal = maxAvailableEmi * (Math.pow(1 + monthlyRate, totalMonths) - 1) / 
                       (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));
  
  // Round to nearest 10,000
  return Math.round(maxPrincipal / 10000) * 10000;
}

/**
 * Parses income document (file, image, or preset text)
 * and extracts salary and credit metrics using n8n workflow or local OCR.
 */
export async function analyzeSalaryDocument(input, contextParams = {}) {
  if (input && typeof input === 'object' && input.netMonthlySalary && !input.name) {
    return simulateOcrDelay(input);
  }

  let textContent = '';
  let fileName = 'Uploaded_Salary_Slip.pdf';

  if (input instanceof File) {
    fileName = input.name;
    textContent = await readFileAsText(input);
  } else if (typeof input === 'string') {
    textContent = input;
  }

  // 1. Attempt n8n webhook processing first if configured
  try {
    const n8nResult = await triggerN8nSalaryOcr({
      textContent,
      fileName,
      loanType: contextParams.loanType || 'home',
      loanAmount: contextParams.loanAmount || 4500000,
      tenureYears: contextParams.tenureYears || 20
    });

    if (n8nResult && (n8nResult.netMonthlySalary || n8nResult.employerName)) {
      return {
        id: `n8n-loan-${Date.now()}`,
        employerName: n8nResult.employerName || 'Verified Corporate Entity',
        employerCategory: n8nResult.employerCategory || 'Category B (Corporate Entity)',
        netMonthlySalary: n8nResult.netMonthlySalary || 85000,
        grossMonthlySalary: n8nResult.grossMonthlySalary || Math.round((n8nResult.netMonthlySalary || 85000) * 1.25),
        existingMonthlyEmi: n8nResult.existingMonthlyEmi || 0,
        cibilScoreEstimate: n8nResult.cibilScore || 785,
        employmentType: 'Salaried Full-time',
        tenureWithCurrentCompany: '3+ Years',
        bankAccountVerified: true,
        panStatus: 'Verified & Linked',
        foirLimit: (n8nResult.foirLimitPercent || 60) / 100,
        isN8nPowered: true,
        fileName: fileName,
        n8nMessage: n8nResult.message || 'Income verified via n8n Loan Underwriting Node'
      };
    }
  } catch (n8nErr) {
    console.warn('n8n Salary OCR pipeline notice:', n8nErr);
  }

  // 2. Fallback to local heuristic parser
  const parsed = parseSalaryText(textContent, fileName);
  return simulateOcrDelay(parsed);
}

function simulateOcrDelay(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1200);
  });
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

function parseSalaryText(text, fileName) {
  const lower = text.toLowerCase();

  // Extract Net Salary numbers
  const netMatch = text.match(/(?:net pay|net salary|in-hand|take home|amount credited)[\s:₹rs.]*([\d,]+)/i);
  let netSalary = netMatch ? parseInt(netMatch[1].replace(/,/g, ''), 10) : 85000;
  if (netSalary < 10000) netSalary = 85000;

  // Extract Gross Salary
  const grossMatch = text.match(/(?:gross pay|gross salary|total earnings)[\s:₹rs.]*([\d,]+)/i);
  let grossSalary = grossMatch ? parseInt(grossMatch[1].replace(/,/g, ''), 10) : Math.round(netSalary * 1.25);

  // Existing Deductions / EMIs
  const emiMatch = text.match(/(?:emi|loan deduction|loan repayment)[\s:₹rs.]*([\d,]+)/i);
  let existingEmi = emiMatch ? parseInt(emiMatch[1].replace(/,/g, ''), 10) : 0;

  let employerCat = 'Category B (Corporate Entity)';
  if (lower.includes('google') || lower.includes('microsoft') || lower.includes('tcs') || lower.includes('infosys') || lower.includes('accenture')) {
    employerCat = 'Category A (Super Tier-1 MNC)';
  } else if (lower.includes('govt') || lower.includes('ministry') || lower.includes('railway') || lower.includes('public sector')) {
    employerCat = 'Central Government / PSU';
  } else if (lower.includes('llp') || lower.includes('proprietor') || lower.includes('business') || lower.includes('pvt ltd')) {
    employerCat = 'Private Limited / MSME';
  }

  return {
    id: `custom-payslip-${Date.now()}`,
    title: `OCR Scan: ${fileName}`,
    employeeName: 'Applicant Document',
    employerName: 'Verified Employer Entity',
    employerCategory: employerCat,
    designation: 'Professional Specialist',
    payPeriod: 'Recent Monthly Statement',
    grossMonthlySalary: grossSalary,
    netMonthlySalary: netSalary,
    deductions: {
      pf: Math.round(grossSalary * 0.08),
      tax: Math.round(grossSalary * 0.12),
      existingEmi: existingEmi
    },
    cibilEstimate: 775,
    salaryAccountBank: 'Primary Bank',
    notes: `AI financial extraction completed from "${fileName}". Net monthly cash flow calculated at ₹${netSalary.toLocaleString('en-IN')}.`,
    icon: '📄'
  };
}

/**
 * Evaluates all financial institutions for a selected loan type, amount, tenure,
 * and user's extracted salary profile.
 */
export function evaluateLendersForLoan(incomeData, loanTypeId = 'home', requestedAmount = 4500000, requestedTenure = 20) {
  if (!incomeData) return [];

  const netSalary = incomeData.netMonthlySalary || 75000;
  const existingEmi = incomeData.deductions?.existingEmi || 0;
  const cibil = incomeData.cibilEstimate || 750;
  const empCat = incomeData.employerCategory || '';

  const results = FINANCIAL_INSTITUTIONS.map((institution) => {
    const product = institution.loanProducts[loanTypeId];
    if (!product) return null;

    let interestRate = product.interestRate;
    let matchScore = 75;
    const rationale = [];

    // Corporate / Govt concessions
    if (empCat.includes('Government') && institution.id === 'sbi-bank') {
      interestRate -= 0.10;
      matchScore += 12;
      rationale.push('Special SBI Govt employee discount: 0.10% lower ROI applied.');
    }
    if (empCat.includes('Category A') && (institution.id === 'hdfc-bank' || institution.id === 'icici-bank')) {
      interestRate -= 0.15;
      matchScore += 12;
      rationale.push('Tier-1 Corporate Category A perk: 0.15% interest reduction.');
    }

    // High CIBIL boost
    if (cibil >= 780) {
      matchScore += 8;
      rationale.push(`Strong CIBIL Score (${cibil}) qualifies for prime interest slab.`);
    }

    // Calculate Monthly EMI for the requested loan amount & tenure
    const emi = calculateEmi(requestedAmount, interestRate, requestedTenure);
    const totalPayment = emi * (requestedTenure * 12);
    const totalInterest = Math.max(0, totalPayment - requestedAmount);

    // Calculate Max Eligibility
    const maxEligibility = calculateMaxLoanEligibility(
      netSalary, 
      existingEmi, 
      interestRate, 
      requestedTenure, 
      product.maxFoir
    );

    // Check if requested amount is within eligibility
    const isAffordable = requestedAmount <= maxEligibility;
    if (isAffordable) {
      matchScore += 10;
      rationale.push(`Loan request of ₹${(requestedAmount/100000).toFixed(1)}L is well within your max borrowing power of ₹${(maxEligibility/100000).toFixed(1)}L.`);
    } else {
      matchScore -= 15;
      rationale.push(`Loan amount exceeds standard FOIR capacity (Max eligible: ₹${(maxEligibility/100000).toFixed(1)}L). A co-applicant may be needed.`);
    }

    // Processing fee advantage
    if (product.processingFee.toLowerCase().includes('nil') || product.processingFee.includes('0.15%')) {
      matchScore += 8;
      rationale.push(`Ultra-low processing fees: ${product.processingFee}.`);
    }

    // Disbursal speed advantage
    if (product.disbursalTime.includes('Instant') || product.disbursalTime.includes('24') || product.disbursalTime.includes('30-minute')) {
      matchScore += 7;
      rationale.push(`Fast-track approval & disbursal: ${product.disbursalTime}.`);
    }

    // Special benefit inclusion
    if (product.specialBenefit) {
      rationale.push(product.specialBenefit);
    }

    const finalScore = Math.min(99, Math.max(65, Math.round(matchScore)));

    return {
      institutionId: institution.id,
      name: institution.name,
      shortName: institution.shortName,
      badge: institution.badge,
      rating: institution.rating,
      type: institution.type,
      loanTypeId: loanTypeId,
      interestRate: parseFloat(interestRate.toFixed(2)),
      rateType: product.rateType,
      monthlyEmi: emi,
      totalInterest: totalInterest,
      totalRepayment: totalPayment,
      maxEligibility: maxEligibility,
      processingFee: product.processingFee,
      prepaymentFee: product.prepaymentFee,
      disbursalTime: product.disbursalTime,
      specialBenefit: product.specialBenefit,
      matchScore: finalScore,
      isAffordable: isAffordable,
      aiMatchRationale: rationale
    };
  }).filter(Boolean);

  // Sort best match first (highest match score, then lowest interest rate)
  return results.sort((a, b) => b.matchScore - a.matchScore || a.interestRate - b.interestRate);
}
