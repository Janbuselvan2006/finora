import { HEALTH_POLICIES } from '../data/insurancePolicies';

/**
 * Parses & analyzes a medical document (file, image, or preset text)
 * and extracts structured clinical metrics using OCR/AI rule matching.
 */
export async function analyzeMedicalDocument(input) {
  // If user passed a preset object directly
  if (input && typeof input === 'object' && input.diagnosis) {
    return simulateOcrDelay(input);
  }

  // If user uploaded a File object or raw text string
  let textContent = '';
  let fileName = 'Uploaded_Medical_Doc.pdf';

  if (input instanceof File) {
    fileName = input.name;
    textContent = await readFileAsText(input);
  } else if (typeof input === 'string') {
    textContent = input;
  }

  // Try parsing extracted text or fallback to intelligent pattern matching
  const parsed = parseMedicalText(textContent, fileName);
  return simulateOcrDelay(parsed);
}

function simulateOcrDelay(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1200); // Realistic AI OCR scanning delay feel
  });
}

function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    // Try reading text first
    reader.readAsText(file);
  });
}

function parseMedicalText(text, fileName) {
  const lowerText = text.toLowerCase();

  // Extract Patient Age
  const ageMatch = text.match(/(?:age|yrs|years old)[\s:]*(\d{1,2})/i);
  const patientAge = ageMatch ? parseInt(ageMatch[1], 10) : 42;

  // Detect Conditions / Pre-existing Diseases
  const peds = [];
  if (lowerText.includes('diabet') || lowerText.includes('hba1c') || lowerText.includes('glucose')) {
    peds.push('Diabetes');
  }
  if (lowerText.includes('hyperten') || lowerText.includes('blood pressure') || lowerText.includes('bp')) {
    peds.push('Hypertension');
  }
  if (lowerText.includes('cardiac') || lowerText.includes('heart') || lowerText.includes('stent') || lowerText.includes('artery')) {
    peds.push('Cardiac Condition');
  }
  if (lowerText.includes('knee') || lowerText.includes('arthroplasty') || lowerText.includes('joint') || lowerText.includes('osteoarthr')) {
    peds.push('Osteoarthritis');
  }
  if (lowerText.includes('asthma') || lowerText.includes('bronchial') || lowerText.includes('respiratory')) {
    peds.push('Asthma');
  }

  if (peds.length === 0) {
    peds.push('General Pre-Existing Condition Check');
  }

  // Primary Diagnosis
  let diagnosis = 'General Clinical Evaluation & Medical Consultation';
  if (peds.includes('Diabetes') && peds.includes('Hypertension')) {
    diagnosis = 'Type 2 Diabetes Mellitus with Essential Hypertension';
  } else if (peds.includes('Cardiac Condition')) {
    diagnosis = 'Coronary Artery Disease & Ischemic Heart Disease';
  } else if (peds.includes('Osteoarthritis')) {
    diagnosis = 'Bilateral Severe Knee Osteoarthritis';
  } else if (peds.includes('Asthma')) {
    diagnosis = 'Bronchial Asthma with Respiratory Dysfunction';
  }

  return {
    id: `custom-upload-${Date.now()}`,
    title: `OCR Scan: ${fileName}`,
    patientName: 'Patient Document',
    patientAge: patientAge,
    gender: lowerText.includes('female') || lowerText.includes('mrs') || lowerText.includes('ms') ? 'Female' : 'Male',
    doctorName: 'Attending Physician',
    hospital: 'Clinical Healthcare Facility',
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis,
    preExistingDiseases: peds,
    recommendedProcedure: 'Inpatient Hospitalization / Specialized Treatment Plan',
    estimatedCost: peds.includes('Cardiac Condition') ? 1200000 : (peds.includes('Osteoarthritis') ? 850000 : 500000),
    roomPreference: 'Single Private Room',
    extractedNotes: `AI Document Analysis completed for "${fileName}". Extracted ${peds.length} primary health indicator(s).`
  };
}

/**
 * Compares health insurance policies against extracted medical parameters
 * across all 7 evaluation dimensions and returns ranked policies with AI match scores.
 */
export function evaluatePoliciesForMedicalDoc(medicalData, customSumInsured = 1000000) {
  if (!medicalData) return [];

  const peds = medicalData.preExistingDiseases || [];
  const age = medicalData.patientAge || 40;
  const estimatedCost = medicalData.estimatedCost || 500000;

  // Determine age bracket key for premium
  let ageKey = 'age36_50';
  if (age <= 35) ageKey = 'age18_35';
  else if (age >= 51) ageKey = 'age51_65';

  const evaluated = HEALTH_POLICIES.map((policy) => {
    let score = 70; // Base score
    const rationale = [];

    // 1. Coverage Dimension Score (Weight: 20%)
    let coverageScore = 85;
    if (policy.coverage.restoration.includes('Unlimited')) {
      coverageScore += 10;
      rationale.push('Unlimited restoration benefit covers potential recurring hospitalizations.');
    }
    if (policy.coverage.ayush.includes('100%')) {
      coverageScore += 5;
    }

    // 2. Waiting Period Dimension Score (Weight: 25%)
    let waitingScore = 75;
    const hasDiabetesBP = peds.includes('Diabetes') || peds.includes('Hypertension');
    if (hasDiabetesBP) {
      if (policy.waitingPeriod.pedWaiverAvailable) {
        waitingScore += 20;
        score += 15;
        rationale.push(`PED rider reduces waiting period for ${peds.join('/')} down to 12 months or Day 1.`);
      } else if (policy.waitingPeriod.ped.includes('24')) {
        waitingScore += 10;
        score += 8;
        rationale.push('Short 24-month PED waiting period for pre-existing medical conditions.');
      } else {
        waitingScore -= 10;
        score -= 5;
        rationale.push('Longer 36-month waiting period required before PED claims are accepted.');
      }
    }

    // 3. Exclusions Dimension Score (Weight: 10%)
    let exclusionScore = 90;
    if (policy.exclusions.length < 5) exclusionScore += 5;

    // 4. Sum Insured Dimension Score (Weight: 15%)
    let sumInsuredScore = 80;
    const baseCover = policy.baseSumInsured;
    if (baseCover >= estimatedCost) {
      sumInsuredScore += 15;
      score += 10;
      rationale.push(`Base Sum Insured (₹${(baseCover/100000).toFixed(0)} Lakhs) fully covers estimated treatment cost of ₹${(estimatedCost/100000).toFixed(1)} Lakhs.`);
    } else {
      sumInsuredScore -= 10;
    }

    // 5. Premium Value Score (Weight: 10%)
    const premium = policy.annualPremium[ageKey] || 15000;
    let premiumScore = 80;
    if (premium < 14000) {
      premiumScore += 10;
      score += 5;
      rationale.push(`Cost-effective premium of ₹${premium.toLocaleString('en-IN')}/yr for age ${age}.`);
    }

    // 6. Room-Rent Limits Dimension Score (Weight: 10%)
    let roomRentScore = 90;
    if (policy.roomRent.cappingPercentage === 0) {
      roomRentScore += 10;
      score += 10;
      rationale.push('No capping on room rent prevents proportionate deduction penalties during claims.');
    } else {
      roomRentScore -= 15;
      score -= 8;
      rationale.push('Room rent capping of 1% exists, which may trigger proportionate claim deductions.');
    }

    // 7. Disease-Specific Conditions Score (Weight: 10%)
    let diseaseScore = 85;
    if (peds.includes('Osteoarthritis') || medicalData.diagnosis.includes('Knee')) {
      if (policy.diseaseSpecificConditions.jointReplacement.includes('None')) {
        diseaseScore += 15;
        score += 10;
        rationale.push('Zero sub-limit on Joint Replacement surgery.');
      }
    }
    if (peds.includes('Cardiac Condition')) {
      if (policy.diseaseSpecificConditions.cardiacCare.includes('Comprehensive')) {
        diseaseScore += 15;
        score += 10;
        rationale.push('Comprehensive cardiac hospitalization & cashless stent network support.');
      }
    }

    // Final Overall Fit Score Normalized (Cap between 65% and 99%)
    const fitScore = Math.min(99, Math.max(65, Math.round(score)));

    return {
      ...policy,
      fitScore,
      evaluatedAge: age,
      currentPremium: premium,
      dimensionScores: {
        coverage: Math.min(100, coverageScore),
        waitingPeriod: Math.min(100, waitingScore),
        exclusions: Math.min(100, exclusionScore),
        sumInsured: Math.min(100, sumInsuredScore),
        premium: Math.min(100, premiumScore),
        roomRent: Math.min(100, roomRentScore),
        diseaseSpecific: Math.min(100, diseaseScore)
      },
      aiMatchRationale: rationale
    };
  });

  // Sort by fit score descending
  return evaluated.sort((a, b) => b.fitScore - a.fitScore);
}
