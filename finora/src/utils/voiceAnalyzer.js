import { extractHospitalOrClinic } from './medicalOcr';

/**
 * Text-to-Speech Engine using Web Speech API (Google Assistant voice style)
 */
export function speakAssistantText(text, onStart = null, onEnd = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return null;
  }

  // Cancel any active utterance
  window.speechSynthesis.cancel();

  // Clean text of markdown asterisks/emojis for clean speech pronunciation
  const cleanSpeechText = text
    .replace(/[#*`_~]/g, '')
    .replace(/₹/g, 'Rupees ')
    .replace(/Lakhs?/gi, 'Lakhs')
    .replace(/[^\w\s.,?!'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
  utterance.rate = 1.02; // Pleasant assistant speaking rate
  utterance.pitch = 1.0;

  // Pick high-quality English voice if available
  const voices = window.speechSynthesis.getVoices();
  const googleVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Zira'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (googleVoice) {
    utterance.voice = googleVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.warn('TTS error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopAssistantSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Parses user's spoken voice query to extract problem context, clinical or loan parameters,
 * detects hospital presence, and generates explainable Google Assistant-style recommendations.
 */
export function analyzeVoiceProblem(rawTranscript) {
  if (!rawTranscript || typeof rawTranscript !== 'string') {
    return {
      isValid: false,
      aiSpeechResponse: "I didn't quite catch that. Could you please tell me your medical or financial problem again?",
      category: 'unknown'
    };
  }

  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // 1. Extract Patient Age if mentioned
  const ageMatch = text.match(/(?:age|years old|yrs old|am|is)[\s:=]*(\d{1,2})/i) || text.match(/(\d{1,2})\s*(?:years|yrs|yo)/i);
  const patientAge = ageMatch ? parseInt(ageMatch[1], 10) : 45;

  // 2. Detect Hospital or Clinic Name
  const detectedHospital = extractHospitalOrClinic(text);

  // 3. Detect Medical Conditions & Procedures
  const conditions = [];
  if (lower.includes('knee') || lower.includes('joint') || lower.includes('arthr') || lower.includes('tkr') || lower.includes('ortho')) {
    conditions.push('Osteoarthritis (Knee Joint)');
  }
  if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('hba1c') || lower.includes('glucose')) {
    conditions.push('Type-2 Diabetes');
  }
  if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('hypertens')) {
    conditions.push('Hypertension');
  }
  if (lower.includes('heart') || lower.includes('cardiac') || lower.includes('stent') || lower.includes('angio') || lower.includes('chest pain') || lower.includes('artery')) {
    conditions.push('Cardiac Condition (CAD)');
  }
  if (lower.includes('asthma') || lower.includes('breath') || lower.includes('lung') || lower.includes('respirat') || lower.includes('copd')) {
    conditions.push('Bronchial Asthma');
  }
  if (lower.includes('cataract') || lower.includes('eye') || lower.includes('lens')) {
    conditions.push('Cataract');
  }
  if (lower.includes('kidney') || lower.includes('renal') || lower.includes('dialysis') || lower.includes('stone')) {
    conditions.push('Renal / Kidney Condition');
  }
  if (lower.includes('thyroid') || lower.includes('tsh')) {
    conditions.push('Thyroid Disorder');
  }

  // 4. Detect Loan & Financial Intent
  const isLoanQuery = lower.includes('loan') || lower.includes('emi') || lower.includes('interest rate') || lower.includes('cibil') || lower.includes('credit score') || lower.includes('balance transfer') || lower.includes('mortgage');

  // =========================================================================
  // SCENARIO 1: LOAN / BANKING QUERY
  // =========================================================================
  if (isLoanQuery) {
    // ---- STEP A: Detect Loan Type ----
    let loanType = 'Personal Loan';
    if (lower.includes('home') || lower.includes('house') || lower.includes('flat') || lower.includes('property') || lower.includes('apartment')) {
      loanType = 'Home Loan';
    } else if (lower.includes('car') || lower.includes('auto') || lower.includes('vehicle') || lower.includes('bike')) {
      loanType = 'Vehicle Loan';
    } else if (lower.includes('business') || lower.includes('msme') || lower.includes('working capital') || lower.includes('startup')) {
      loanType = 'Business Loan';
    } else if (lower.includes('education') || lower.includes('study') || lower.includes('college') || lower.includes('university')) {
      loanType = 'Education Loan';
    }

    // ---- STEP B: Extract SALARY from voice query ----
    // Handles: "my salary is 1 lakh", "earning 80000", "income 50k", "I earn 1.5 lakh"
    let salary = null;
    const salaryPatterns = [
      /(?:my\s+)?(?:salary|income|earning|earn|take\s+home|net\s+pay|in.?hand)[^\d]*([\d,.]+)\s*(lakh|lac|k|thousand)?/i,
      /(?:earn|earning|making|getting)[^\d]*([\d,.]+)\s*(lakh|lac|k|thousand)?/i,
      /(?:₹|rs\.?|inr)\s*([\d,.]+)\s*(lakh|lac|k|thousand)?(?:[^\d]*salary|income|earning)?/i,
    ];
    for (const pattern of salaryPatterns) {
      const m = text.match(pattern);
      if (m) {
        const num = parseFloat(m[1].replace(/,/g, ''));
        if (!isNaN(num)) {
          const unit = (m[2] || '').toLowerCase();
          if (unit === 'lakh' || unit === 'lac') salary = num * 100000;
          else if (unit === 'k' || unit === 'thousand') salary = num * 1000;
          else if (num <= 200) salary = num * 1000; // "80" likely means ₹80,000
          else salary = num;
          break;
        }
      }
    }

    // ---- STEP C: Extract LOAN AMOUNT from voice query ----
    // Handles: "10 lakh loan", "want 15 lakhs", "need 50 lakh home loan", "₹2500000"
    let loanAmount = null;
    const loanPatterns = [
      /(?:need|want|require|get|borrow|take|looking for)[^\d]*([\d,.]+)\s*(lakh|lac|crore|cr|k|thousand)?/i,
      /(?:loan|borrow)[^\d\w](?:of\s+)?([\d,.]+)\s*(lakh|lac|crore|cr|k|thousand)?/i,
      /([\d,.]+)\s*(lakh|lac|crore|cr)[^\w]/i,
    ];
    for (const pattern of loanPatterns) {
      const m = text.match(pattern);
      if (m) {
        const num = parseFloat(m[1].replace(/,/g, ''));
        if (!isNaN(num)) {
          const unit = (m[2] || '').toLowerCase();
          if (unit === 'crore' || unit === 'cr') loanAmount = num * 10000000;
          else if (unit === 'lakh' || unit === 'lac') loanAmount = num * 100000;
          else if (unit === 'k' || unit === 'thousand') loanAmount = num * 1000;
          else if (num <= 200) loanAmount = num * 100000; // bare "10" likely means 10 lakh
          else loanAmount = num;
          break;
        }
      }
    }

    // ---- STEP D: Interest Rate and Tenure by Loan Type ----
    const estRate = loanType === 'Home Loan' ? 8.4 : loanType === 'Vehicle Loan' ? 8.8 : loanType === 'Education Loan' ? 8.0 : 10.75;
    const estTenureYears = loanType === 'Home Loan' ? 20 : loanType === 'Education Loan' ? 7 : 5;
    const monthlyRate = estRate / (12 * 100);
    const months = estTenureYears * 12;

    // ---- STEP E: Use sensible defaults if not extracted ----
    if (!loanAmount) loanAmount = 1000000; // Default ₹10L if not specified

    // ---- STEP F: Calculate EMI for requested amount ----
    const requestedEmi = Math.round(
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );

    // ---- STEP G: FOIR-based eligibility check (if salary provided) ----
    let isAffordable = true;
    let maxEligibleLoan = null;
    let foirWarning = null;
    let salaryBasedEmiLimit = null;

    if (salary && salary > 0) {
      // 60% FOIR: max affordable EMI = 60% of salary
      salaryBasedEmiLimit = Math.round(salary * 0.60);
      // Max loan they can get based on salary
      maxEligibleLoan = Math.round(
        (salaryBasedEmiLimit * (Math.pow(1 + monthlyRate, months) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, months)) / 10000
      ) * 10000;

      isAffordable = requestedEmi <= salaryBasedEmiLimit;

      if (!isAffordable) {
        foirWarning = `Based on your ₹${(salary / 1000).toFixed(0)}K salary, your maximum affordable EMI is ₹${salaryBasedEmiLimit.toLocaleString('en-IN')}/mo (60% FOIR limit). The ₹${(loanAmount / 100000).toFixed(1)}L loan would cost ₹${requestedEmi.toLocaleString('en-IN')}/mo which exceeds your limit. You are eligible for up to ₹${(maxEligibleLoan / 100000).toFixed(1)} Lakhs.`;
      }
    }

    // ---- STEP H: Build response speech ----
    let speechText;
    if (salary && !isAffordable) {
      speechText = `Based on your monthly salary of ₹${(salary / 1000).toFixed(0)} thousand, your maximum EMI capacity is ₹${salaryBasedEmiLimit.toLocaleString('en-IN')} per month under the 60% FOIR rule. A ₹${(loanAmount / 100000).toFixed(1)} Lakh ${loanType} would cost ₹${requestedEmi.toLocaleString('en-IN')} per month, which is beyond your current income limit. Based on your salary, you are eligible for up to ₹${(maxEligibleLoan / 100000).toFixed(1)} Lakhs. I recommend applying for a lower amount or a longer tenure to reduce your EMI.`;
    } else if (salary && isAffordable) {
      speechText = `Great news! Based on your monthly salary of ₹${(salary / 1000).toFixed(0)} thousand, you are fully eligible for the ₹${(loanAmount / 100000).toFixed(1)} Lakh ${loanType} you asked for. Your estimated EMI is ₹${requestedEmi.toLocaleString('en-IN')} per month at ${estRate}% interest over ${estTenureYears} years, which is within your 60% income limit. I am opening your pre-approved lender offers now. Watch out for hidden processing charges and prepayment penalties.`;
    } else {
      // No salary mentioned – give EMI info and ask for salary to confirm eligibility
      speechText = `For a ₹${(loanAmount / 100000).toFixed(1)} Lakh ${loanType} at ${estRate}% interest over ${estTenureYears} years, your estimated monthly EMI would be ₹${requestedEmi.toLocaleString('en-IN')}. To check if you are eligible, please tell me your monthly salary and I will calculate your exact borrowing power.`;
    }

    // ---- STEP I: Build analysis card ----
    const agentTraps = [
      {
        trap: 'Hidden Processing Fee (1%–2.5%)',
        warning: `On a ₹${(loanAmount / 100000).toFixed(1)}L loan that's ₹${Math.round(loanAmount * 0.015).toLocaleString('en-IN')} charged upfront.`,
        safeguard: 'Finora negotiates institutional zero-processing-fee waivers.'
      },
      {
        trap: 'Prepayment & Foreclosure Lock-in',
        warning: 'Some lenders charge 3–5% penalty for early repayment, costing you lakhs.',
        safeguard: 'We only route to RBI floating-rate lenders with 0% foreclosure charges.'
      }
    ];

    if (!isAffordable && salary) {
      agentTraps.unshift({
        trap: '⚠️ Loan Amount Exceeds Your FOIR Limit',
        warning: `₹${(loanAmount / 100000).toFixed(1)}L EMI (₹${requestedEmi.toLocaleString('en-IN')}/mo) exceeds 60% of your ₹${(salary / 1000).toFixed(0)}K salary.`,
        safeguard: `You qualify for up to ₹${(maxEligibleLoan / 100000).toFixed(1)} Lakhs. Consider reducing loan amount or increasing tenure.`
      });
    }

    return {
      category: 'loan_banking',
      isValid: true,
      userProblemSummary: salary
        ? `₹${(loanAmount / 100000).toFixed(1)}L ${loanType} | Salary: ₹${(salary / 1000).toFixed(0)}K/mo | ${isAffordable ? '✅ Eligible' : '⚠️ Exceeds Limit'}`
        : `₹${(loanAmount / 100000).toFixed(1)}L ${loanType} Inquiry`,
      keyEntities: {
        loanType,
        amount: loanAmount,
        salary: salary,
        estRate,
        tenureYears: estTenureYears,
        estEmi: requestedEmi,
        maxEligibleLoan,
        isAffordable,
        foirWarning
      },
      aiSpeechResponse: speechText,
      analysisBreakdown: {
        heading: `Finora AI ${loanType} Eligibility Assessment`,
        salaryInfo: salary ? `Monthly Salary: ₹${(salary / 1000).toFixed(0)}K | Max EMI Capacity: ₹${(salaryBasedEmiLimit || 0).toLocaleString('en-IN')}/mo` : 'Salary not provided — eligibility cannot be fully verified.',
        costEstimate: `Loan: ₹${(loanAmount / 100000).toFixed(1)} Lakhs @ ${estRate}%`,
        subheading: `Monthly EMI: ₹${requestedEmi.toLocaleString('en-IN')}/mo over ${estTenureYears} years`,
        eligibilityStatus: salary ? (isAffordable ? '✅ Eligible — EMI within FOIR limit' : `⚠️ Max Eligible Loan: ₹${(maxEligibleLoan / 100000).toFixed(1)} Lakhs`) : '❓ Share your salary to confirm eligibility',
        criticalAgentTraps: agentTraps,
        recommendedAction: isAffordable || !salary ? 'View pre-approved lender offers.' : `Apply for ₹${(maxEligibleLoan / 100000).toFixed(1)}L or reduce EMI with longer tenure.`
      },
      navigationTarget: 'loans',
      autoFillPayload: {
        amount: isAffordable ? loanAmount : (maxEligibleLoan || loanAmount),
        rate: estRate,
        tenure: estTenureYears
      }
    };
  }

  // =========================================================================
  // SCENARIO 2: MEDICAL QUERY WITH MISSING HOSPITAL/CLINIC (INVALID CHECK)
  // =========================================================================
  const isMedicalQuery = conditions.length > 0 || lower.includes('doctor') || lower.includes('medic') || lower.includes('surgery') || lower.includes('treatment') || lower.includes('hospital') || lower.includes('fever') || lower.includes('insurance');

  if (isMedicalQuery && !detectedHospital) {
    const speechText = `I heard your health query regarding ${conditions.join(' and ') || 'your medical condition'}. However, under IRDAI regulations, insurance eligibility requires an accredited hospital or clinic name. Which hospital or clinic are you visiting, such as Apollo, Fortis, or Max?`;

    return {
      category: 'medical_insurance',
      isValid: false,
      error: 'NO_HOSPITAL_DETECTED',
      userProblemSummary: `Unverified Health Query: ${conditions.join(', ') || 'General Symptoms'}`,
      keyEntities: {
        conditions,
        hospital: null,
        patientAge
      },
      aiSpeechResponse: speechText,
      analysisBreakdown: {
        heading: '⚠️ Hospital / Clinic Verification Required',
        hospitalStatus: 'Missing Accredited Facility Header',
        statusWarning: 'IRDAI Underwriting Rule §45 requires an accredited healthcare institution (e.g. Apollo, Fortis, Max, or your local clinic) to calculate authentic inpatient claim coverage and protect against agent mis-selling.',
        criticalAgentTraps: [
          {
            trap: 'Non-Network / Unaccredited Clinic Repudiation',
            warning: 'Insurers deny cashless hospitalization if treated at non-registered local centers.',
            safeguard: 'Always state your accredited hospital or network clinic to verify coverage.'
          }
        ],
        recommendedAction: 'Please mention your hospital or clinic name (e.g. "treated at Apollo Hospital") to proceed.'
      },
      navigationTarget: 'insurance'
    };
  }

  // =========================================================================
  // SCENARIO 3: VERIFIED MEDICAL PROBLEM WITH HOSPITAL / CLINIC (FULL SHIELD)
  // =========================================================================
  if (isMedicalQuery && detectedHospital) {
    let procedureName = 'Medical Inpatient Management & Clinical Evaluation';
    let estimatedCost = 550000;

    if (conditions.includes('Cardiac Condition (CAD)')) {
      procedureName = 'Coronary Angioplasty / Cardiac Stent Placement';
      estimatedCost = 1100000;
    } else if (conditions.includes('Osteoarthritis (Knee Joint)')) {
      procedureName = 'Bilateral Total Knee Arthroplasty (TKR Surgery)';
      estimatedCost = 750000;
    } else if (conditions.includes('Cataract')) {
      procedureName = 'Phacoemulsification with Foldable Monofocal IOL';
      estimatedCost = 140000;
    } else if (conditions.includes('Renal / Kidney Condition')) {
      procedureName = 'Renal Lithotripsy / Specialized Nephrology Inpatient Care';
      estimatedCost = 600000;
    } else if (conditions.includes('Type-2 Diabetes') && conditions.includes('Hypertension')) {
      procedureName = 'Endocrine & Cardiovascular Inpatient Stabilisation';
      estimatedCost = 450000;
    }

    const surgeonCost = Math.round(estimatedCost * 0.40);
    const roomCost = Math.round(estimatedCost * 0.25);
    const consumablesCost = Math.round(estimatedCost * 0.20);
    const diagnosticsCost = Math.round(estimatedCost * 0.15);

    const speechText = `I've analyzed your consultation from ${detectedHospital} for ${conditions.join(' and ')}. Estimated hospital treatment cost is ₹${(estimatedCost / 100000).toFixed(1)} Lakhs. Finora has activated your Agent Trap Shield to safeguard you against room-rent proportionate deductions and 20% co-payment clauses. I'm loading your verified policy matches now.`;

    return {
      category: 'medical_insurance',
      isValid: true,
      userProblemSummary: `${conditions.join(' & ')} at ${detectedHospital}`,
      keyEntities: {
        patientAge,
        hospital: detectedHospital,
        conditions,
        procedure: procedureName,
        estimatedCost,
        costBreakdown: {
          surgeonCost,
          roomCost,
          consumablesCost,
          diagnosticsCost
        }
      },
      aiSpeechResponse: speechText,
      analysisBreakdown: {
        heading: `Clinical Analysis: ${procedureName}`,
        hospitalStatus: `Verified Facility: ${detectedHospital}`,
        costEstimate: `₹${(estimatedCost / 100000).toFixed(1)} Lakhs Total Inpatient Cost`,
        costBreakdownList: [
          { item: 'Surgeon & OT Charges (40%)', amount: `₹${surgeonCost.toLocaleString('en-IN')}` },
          { item: 'Room & ICU Stay (25%)', amount: `₹${roomCost.toLocaleString('en-IN')}` },
          { item: 'Medical Implants & Consumables (20%)', amount: `₹${consumablesCost.toLocaleString('en-IN')}` },
          { item: 'Diagnostics & Pre-Op Workup (15%)', amount: `₹${diagnosticsCost.toLocaleString('en-IN')}` }
        ],
        criticalAgentTraps: [
          {
            trap: 'Room-Rent Proportionate Deduction Trap',
            warning: 'Agents often sell 1% room caps, leading to a 50% deduction across surgeon and OT fees.',
            safeguard: 'Finora selects zero room-rent cap policies (Single Private AC room with zero ceiling).'
          },
          {
            trap: 'Hidden 10%–20% Co-Payment Clause',
            warning: 'Silently added to make quotes look cheap, forcing ₹1.5L out-of-pocket on surgery.',
            safeguard: 'Finora strictly filters for 0% Co-Payment policies.'
          },
          {
            trap: 'Pre-Existing Disease (PED) Waiting Period',
            warning: `Agents hide the 24–36 month waiting period for ${conditions[0] || 'your condition'}.`,
            safeguard: 'We prioritize 12-month PED reduction riders for immediate coverage.'
          }
        ],
        recommendedAction: 'View Top 4 Agent-Proof Policy Recommendations below.'
      },
      navigationTarget: 'insurance',
      autoFillPayload: {
        patientAge,
        hospital: detectedHospital,
        diagnosis: `${procedureName} (${conditions.join(', ')})`,
        preExistingDiseases: conditions,
        estimatedCost
      }
    };
  }

  // =========================================================================
  // SCENARIO 4: GENERAL / MISCELLANEOUS INQUIRY
  // =========================================================================
  const speechText = `I am Finora AI, your voice financial and health insurance assistant. You can tell me your health condition and hospital name, or ask about loans and interest rates, and I'll analyze costs while protecting you from agent traps. What would you like to explore?`;

  return {
    category: 'general',
    isValid: true,
    userProblemSummary: 'General Financial & Insurance Inquiry',
    aiSpeechResponse: speechText,
    analysisBreakdown: {
      heading: '🎙️ How Finora Voice Assistant Protects You',
      costEstimate: 'Interactive AI Assistant',
      criticalAgentTraps: [
        {
          trap: 'Insurance Fine-Print Traps',
          warning: 'Room rent sub-limits, disease caps, and PED non-disclosure causing 90% of claim repudiations.',
          safeguard: 'Speak your doctor prescription or hospital name to get protected comparisons.'
        },
        {
          trap: 'Predatory Loan Origination Traps',
          warning: 'Hidden compounding charges, processing fees, and foreclosing lock-ins.',
          safeguard: 'State your loan amount to see true APR and EMI breakdowns.'
        }
      ],
      recommendedAction: 'Try saying: "I have diabetes and knee pain at Apollo Hospital" or "I need a 25 Lakh home loan".'
    }
  };
}
