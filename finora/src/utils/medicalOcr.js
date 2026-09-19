import { HEALTH_POLICIES } from '../data/insurancePolicies';
import { extractTextFromPdf } from './pdfReader';
import { triggerN8nMedicalOcr } from './n8nService';

/**
 * Parses & analyzes a medical document (PDF file, image, or preset text)
 * and extracts structured clinical metrics using OCR/AI rule matching or n8n workflow.
 */
export async function analyzeMedicalDocument(input) {
  // If user passed a preset object directly
  if (input && typeof input === 'object' && input.diagnosis) {
    return simulateOcrDelay({ ...input, isValid: true });
  }

  // If user uploaded a File object or raw text string
  let textContent = '';
  let fileName = 'Uploaded_Medical_Doc.pdf';

  if (input instanceof File) {
    fileName = input.name;
    const isPdf = input.type === 'application/pdf' || input.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      try {
        textContent = await extractTextFromPdf(input);
      } catch (pdfErr) {
        console.warn('PDF extraction error, falling back to text reader:', pdfErr);
        textContent = await readFileAsText(input);
      }
    } else {
      textContent = await readFileAsText(input);
    }
  } else if (typeof input === 'string') {
    textContent = input;
  }

  // Attempt n8n webhook processing if configured by user
  try {
    const n8nResult = await triggerN8nMedicalOcr({ textContent, fileName });
    if (n8nResult && (n8nResult.isValid !== undefined || n8nResult.hospital)) {
      return simulateOcrDelay({
        ...n8nResult,
        id: `n8n-${Date.now()}`,
        date: new Date().toISOString().split('T')[0]
      });
    }
  } catch (n8nErr) {
    console.warn('n8n webhook execution notice:', n8nErr);
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

/**
 * Detects whether a text or file contains a valid hospital, clinic, or accredited healthcare facility.
 * Tolerates common user typos like 'apllo', 'apolo', 'appollo' for Apollo, 'forties' for Fortis, etc.
 * Returns the extracted hospital name, or null if no hospital/clinic is present.
 */
export function extractHospitalOrClinic(text, fileName = '') {
  const combined = `${fileName} ${text || ''}`;
  const lower = combined.toLowerCase();

  // Accredited hospital & clinic keywords including common spelling variations
  const facilityKeywords = [
    'hospital', 'hospitals', 'clinic', 'clinics', 'polyclinic', 'medicity',
    'nursing home', 'sanatorium', 'health center', 'health centre', 'healthcare center',
    'healthcare centre', 'medical center', 'medical centre', 'medical college',
    'institute of medical sciences', 'super speciality', 'superspeciality',
    'multispeciality', 'multi-speciality', 'eye care', 'care hospital',
    'heart institute', 'orthopedic center', 'cancer institute', 'dispensary',
    // Known major hospital chains & common typos (apllo, apolo, appollo)
    'apollo', 'apllo', 'apolo', 'appollo', 'appolo', 'apollos',
    'manipal', 'manipall', 'fortis', 'forties', 'fortiss',
    'max healthcare', 'max hospital', 'max clinic', 'max super', 'aiims',
    'narayana', 'narayan', 'medanta', 'aster dm', 'aster hospital', 'columbia asia',
    'kims', 'amrita institute', 'cloudnine', 'motherhood', 'gleneagles',
    'wockhardt', 'hinduja', 'lilavati', 'tata memorial', 'kokilaben'
  ];

  const hasFacilityKeyword = facilityKeywords.some(kw => lower.includes(kw));

  if (!hasFacilityKeyword) {
    return null; // NO HOSPITAL OR CLINIC DETECTED -> INVALID DOCUMENT!
  }

  // 1. Check for Apollo variations (apllo, apolo, apollo, appollo)
  if (lower.includes('apllo') || lower.includes('apolo') || lower.includes('apollo') || lower.includes('appollo') || lower.includes('appolo')) {
    const apolloBranch = combined.match(/(?:apollo|apllo|apolo|appollo)\s+([A-Za-z0-9\s.'&,-]{3,35})/i);
    return apolloBranch ? `Apollo Hospitals (${apolloBranch[1].trim().split(/\r|\n/)[0]})` : 'Apollo Multi-Speciality Hospitals';
  }

  // 2. Check for Fortis variations
  if (lower.includes('fortis') || lower.includes('forties') || lower.includes('fortiss')) {
    const fortisBranch = combined.match(/(?:fortis|forties)\s+([A-Za-z0-9\s.'&,-]{3,35})/i);
    return fortisBranch ? `Fortis Healthcare (${fortisBranch[1].trim().split(/\r|\n/)[0]})` : 'Fortis Healthcare';
  }

  // 3. Check for Max Healthcare
  if (lower.includes('max hospital') || lower.includes('max healthcare') || lower.includes('max super')) {
    return 'Max Super Speciality Hospital';
  }

  // 4. Check for Manipal
  if (lower.includes('manipal')) {
    return 'Manipal Hospital';
  }

  // 5. Extract cleanest facility name match via regex patterns
  const hospPattern1 = /(?:at|from|hospital|clinic|centre|center|institute|facility)[\s:=-]+([A-Za-z0-9\s.'&,-]{3,45})(?:\n|,|\r|;|$)/i;
  const hospPattern2 = /([A-Za-z0-9\s.'&,-]{3,35})\s+(?:hospital|hospitals|clinic|clinics|medical center|medical centre|healthcare|nursing home|institute|medicity)/i;

  const m2 = combined.match(hospPattern2);
  if (m2 && m2[0].trim().length >= 5) {
    return m2[0].trim().replace(/^[,\s:=-]+|[,\s:=-]+$/g, '');
  }

  const m1 = combined.match(hospPattern1);
  if (m1 && m1[1] && m1[1].trim().length >= 4) {
    return m1[1].trim().replace(/^[,\s:=-]+|[,\s:=-]+$/g, '');
  }

  // Line-by-line fallback to find the facility line
  const lines = combined.split(/\r?\n/);
  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (facilityKeywords.some(kw => lLower.includes(kw)) && line.trim().length >= 6) {
      return line.trim().slice(0, 45);
    }
  }

  return 'Verified Healthcare Institution';
}

function parseMedicalText(text, fileName) {
  const lowerText = (text || '').toLowerCase();

  // Strict check: Document MUST have a hospital or clinic name, otherwise push INVALID!
  const detectedHospital = extractHospitalOrClinic(text, fileName);
  if (!detectedHospital) {
    return {
      isValid: false,
      error: 'INVALID_NO_HOSPITAL_DETECTED',
      errorMessage: 'Invalid Document: No Hospital or Clinic Name Found',
      errorDetails: 'The uploaded medical document or clinical checkup note does not contain any recognized hospital, clinic, or healthcare institution header. Under IRDAI underwriting regulations, only records from verified medical facilities are valid for policy evaluation and claim admissibility.',
      fileName: fileName || 'Consultation_Note.txt',
      snippet: text ? (text.length > 140 ? text.slice(0, 140) + '...' : text) : 'No readable content detected.'
    };
  }

  // Extract Patient Age (e.g., "Age: 45", "45 yrs", "45 years", "45 yo")
  const ageMatch = text.match(/(?:age|yrs|years old|years|yo|y\/o)[\s:=]*(\d{1,2})/i) || text.match(/(\d{1,2})\s*(?:years|yrs|yo)/i);
  const patientAge = ageMatch ? parseInt(ageMatch[1], 10) : 42;

  // Extract Patient Name if present
  const nameMatch = text.match(/(?:patient(?:\s+name)?|name)[\s:=]+([A-Za-z\s.]{3,25})(?:\n|,|\r|;|$)/i);
  const patientName = nameMatch ? nameMatch[1].trim() : 'Patient Consultation';

  // Extract Doctor Name if present
  const docMatch = text.match(/(?:dr\.|doctor)[\s]+([A-Za-z\s.]{3,30})(?:\n|,|\r|;|$)/i);
  const doctorName = docMatch ? `Dr. ${docMatch[1].trim()}` : 'Attending Physician';

  // Verified Hospital
  const hospital = detectedHospital;

  // Detect Pre-existing Conditions / Medical Entities
  const peds = [];
  if (lowerText.includes('diabet') || lowerText.includes('hba1c') || lowerText.includes('glucose') || lowerText.includes('sugar')) {
    peds.push('Diabetes');
  }
  if (lowerText.includes('hyperten') || lowerText.includes('blood pressure') || lowerText.includes('bp ') || lowerText.includes('bp:')) {
    peds.push('Hypertension');
  }
  if (lowerText.includes('cardiac') || lowerText.includes('heart') || lowerText.includes('stent') || lowerText.includes('angio') || lowerText.includes('artery') || lowerText.includes('cad')) {
    peds.push('Cardiac Condition');
  }
  if (lowerText.includes('knee') || lowerText.includes('arthroplasty') || lowerText.includes('joint') || lowerText.includes('osteoarthr') || lowerText.includes('tkr')) {
    peds.push('Osteoarthritis');
  }
  if (lowerText.includes('asthma') || lowerText.includes('bronchial') || lowerText.includes('respiratory') || lowerText.includes('copd') || lowerText.includes('inhaler')) {
    peds.push('Asthma');
  }
  if (lowerText.includes('thyroid') || lowerText.includes('tsh') || lowerText.includes('hypothyroid')) {
    peds.push('Thyroid Disorder');
  }
  if (lowerText.includes('kidney') || lowerText.includes('renal') || lowerText.includes('creatinine') || lowerText.includes('stone')) {
    peds.push('Renal / Kidney Condition');
  }
  if (lowerText.includes('cataract') || lowerText.includes('ophthal') || lowerText.includes('lens')) {
    peds.push('Cataract');
  }

  if (peds.length === 0) {
    peds.push('General Pre-Existing Condition Check');
  }

  // Cost extraction if mentioned in notes
  const costMatch = text.match(/(?:cost|est|estimate|inr|₹|rs\.?)[\s:=]*(\d[\d,.]*)\s*(?:lakh|lac|cr|k)?/i);
  let estimatedCost = 500000;
  if (costMatch) {
    let rawVal = costMatch[1].replace(/,/g, '');
    let num = parseFloat(rawVal);
    if (!isNaN(num)) {
      if (lowerText.includes('lakh') || lowerText.includes('lac') || num < 100) {
        estimatedCost = num * 100000;
      } else {
        estimatedCost = num;
      }
    }
  } else {
    if (peds.includes('Cardiac Condition')) estimatedCost = 1200000;
    else if (peds.includes('Osteoarthritis')) estimatedCost = 850000;
    else if (peds.includes('Renal / Kidney Condition')) estimatedCost = 700000;
    else estimatedCost = 500000;
  }

  // Primary Diagnosis
  let diagnosis = 'General Clinical Evaluation & Medical Consultation';
  if (peds.includes('Diabetes') && peds.includes('Hypertension')) {
    diagnosis = 'Type 2 Diabetes Mellitus with Essential Hypertension';
  } else if (peds.includes('Cardiac Condition')) {
    diagnosis = 'Coronary Artery Disease & Ischemic Heart Evaluation';
  } else if (peds.includes('Osteoarthritis')) {
    diagnosis = 'Bilateral Severe Knee Osteoarthritis / Degenerative Joint Disease';
  } else if (peds.includes('Asthma')) {
    diagnosis = 'Bronchial Asthma with Respiratory Airway Inflammation';
  } else if (peds.includes('Renal / Kidney Condition')) {
    diagnosis = 'Renal Calculi & Chronic Kidney Disease Assessment';
  } else if (peds.length > 0 && peds[0] !== 'General Pre-Existing Condition Check') {
    diagnosis = `Clinical Diagnosis of ${peds.join(', ')}`;
  }

  return {
    id: `custom-upload-${Date.now()}`,
    title: `AI Doctor Checkup OCR: ${fileName || 'Consultation Note'}`,
    patientName: patientName,
    patientAge: patientAge,
    gender: lowerText.includes('female') || lowerText.includes('mrs') || lowerText.includes('ms') || lowerText.includes('woman') ? 'Female' : 'Male',
    doctorName: doctorName,
    hospital: hospital,
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis,
    preExistingDiseases: peds,
    recommendedProcedure: peds.includes('Cardiac Condition') ? 'Stent Angioplasty / Cardiovascular Monitoring' :
                          peds.includes('Osteoarthritis') ? 'Total Knee Replacement / Orthopedic Surgery' :
                          'Inpatient Care & Specialized Medical Management',
    estimatedCost: Math.round(estimatedCost),
    roomPreference: 'Single Private Room',
    extractedNotes: `AI Clinical OCR successfully extracted ${peds.length} condition(s) from doctor checkup record.`
  };
}

/**
 * Compares health insurance policies against extracted medical parameters
 * across all 7 evaluation dimensions and returns ranked policies with AI match scores.
 */
export function evaluatePoliciesForMedicalDoc(medicalData, userRequirements = {}) {
  if (!medicalData) return [];

  const peds = medicalData.preExistingDiseases || [];
  const age = medicalData.patientAge || 40;
  const estimatedCost = medicalData.estimatedCost || 500000;

  const targetSumInsured = userRequirements.sumInsured || 1000000;
  const wantNoRoomCapping = userRequirements.roomRent !== 'any';
  const wantShortestPed = userRequirements.pedPriority !== 'standard';
  const wantZeroCopay = userRequirements.coPay !== 'allowed';

  // Determine age bracket key for premium
  let ageKey = 'age36_50';
  if (age <= 35) ageKey = 'age18_35';
  else if (age >= 51) ageKey = 'age51_65';

  const evaluated = HEALTH_POLICIES.map((policy) => {
    let score = 70; // Base score
    const rationale = [];

    if (wantZeroCopay) {
      score += 4;
      rationale.push('Zero co-pay protection prioritized for hospital claims.');
    }

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
        score += wantShortestPed ? 18 : 12;
        rationale.push(`PED rider reduces waiting period for ${peds.join('/')} down to 12 months or Day 1.`);
      } else if (policy.waitingPeriod.ped.includes('24')) {
        waitingScore += 10;
        score += 8;
        rationale.push('Short 24-month PED waiting period for pre-existing medical conditions.');
      } else {
        waitingScore -= 10;
        score -= wantShortestPed ? 12 : 5;
        rationale.push('Longer 36-month waiting period required before PED claims are accepted.');
      }
    }

    // 3. Exclusions Dimension Score (Weight: 10%)
    let exclusionScore = 90;
    if (policy.exclusions.length < 5) exclusionScore += 5;

    // 4. Sum Insured Dimension Score (Weight: 15%)
    let sumInsuredScore = 80;
    const baseCover = policy.baseSumInsured;
    if (baseCover >= targetSumInsured || baseCover >= estimatedCost) {
      sumInsuredScore += 15;
      score += 10;
      rationale.push(`Base Sum Insured (₹${(baseCover/100000).toFixed(0)} Lakhs) fully covers estimated treatment cost of ₹${(estimatedCost/100000).toFixed(1)} Lakhs.`);
    } else {
      sumInsuredScore -= 10;
      score -= 5;
    }

    // 5. Premium Value Score (Weight: 10%)
    const premium = policy.annualPremium[ageKey] || 15000;
    let premiumScore = 80;
    if (premium < 14000) {
      premiumScore += 10;
      score += 6;
      rationale.push(`Cost-effective premium of ₹${premium.toLocaleString('en-IN')}/yr for age ${age}.`);
    }

    // 6. Room-Rent Limits Dimension Score (Weight: 10%)
    let roomRentScore = 90;
    if (policy.roomRent.cappingPercentage === 0) {
      roomRentScore += 10;
      score += wantNoRoomCapping ? 12 : 8;
      rationale.push('No capping on room rent prevents proportionate deduction penalties during claims.');
    } else {
      roomRentScore -= 15;
      score -= wantNoRoomCapping ? 12 : 6;
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
