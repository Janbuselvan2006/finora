/**
 * Insurance Policies Dataset for Finora AI Policy Finder
 * Contains health insurance policies with exact criteria matching parameters:
 * 1. Coverage
 * 2. Waiting period
 * 3. Exclusions
 * 4. Sum insured
 * 5. Premium
 * 6. Room-rent limits
 * 7. Disease-specific conditions
 */

export const HEALTH_POLICIES = [
  {
    id: 'care-supreme',
    name: 'Care Supreme Plan',
    provider: 'Care Health Insurance',
    badge: 'Best for Pre-Existing Conditions',
    rating: 4.8,
    claimSettlementRatio: '95.2%',
    baseSumInsured: 1000000, // ₹10 Lakhs
    sumInsuredOptions: [500000, 1000000, 2500000, 5000000],
    annualPremium: {
      age18_35: 9800,
      age36_50: 14500,
      age51_65: 24800,
    },
    // 1. Coverage
    coverage: {
      summary: 'Comprehensive hospitalization + 540 Daycare procedures + AYUSH',
      inpatient: '100% Covered up to Sum Insured',
      daycare: '540+ Daycare Treatments Covered',
      ayush: 'Covered up to 100% Sum Insured in Govt. recognized hospitals',
      restoration: 'Unlimited 100% Automatic Restore benefit for unrelated illnesses',
      ambulance: 'Up to ₹10,000 per hospitalization',
      organDonor: 'Covered up to Sum Insured'
    },
    // 2. Waiting Period
    waitingPeriod: {
      initial: '30 Days for non-accidental illnesses',
      ped: '24 Months (Reduceable to 12 Months with PED Add-on rider)',
      pedWaiverAvailable: true,
      specificIllnesses: '24 Months for Cataract, Joint Replacement, Hernia, Stones',
      accidents: '0 Days (Immediate coverage)'
    },
    // 3. Exclusions
    exclusions: [
      'Cosmetic or plastic surgery unless part of reconstructive surgery post-accident',
      'Unproven or experimental medical treatments',
      'Breach of law or illegal activities',
      'Hazardous adventure sports unless specifically endorsed'
    ],
    // 4. Sum Insured
    sumInsuredDetails: {
      baseAmount: '₹10,000,000 (₹10 Lakhs)',
      cumulativeBonus: '50% increase per claim-free year up to 500% (Instant 5x Super Bonus)',
      noClaimBonusMax: 'Up to ₹50 Lakhs extra coverage'
    },
    // 5. Premium
    premiumDetails: {
      monthly: '₹1,208 / month',
      annually: '₹14,500 / year',
      taxBenefit: 'Section 80D tax savings up to ₹25,000'
    },
    // 6. Room-Rent Limits
    roomRent: {
      limitText: 'No Capping on Room Rent (Single Private AC Room included)',
      icuLimit: 'No Limit on ICU Charges',
      cappingPercentage: 0
    },
    // 7. Disease-Specific Conditions & Sub-limits
    diseaseSpecificConditions: {
      diabetes: 'Covered after 24m wait (Day 1 PED rider available). Sub-limit: None.',
      hypertension: 'Covered after 24m wait. Sub-limit: None.',
      cardiacCare: 'Covered. Stent capping as per NPPA guidelines.',
      jointReplacement: 'Covered after 24m wait. Sub-limit: ₹3 Lakhs per knee.',
      cataract: 'Covered up to ₹50,000 per eye after 24m wait.',
      cancerCare: 'Comprehensive cover including chemotherapy and immunotherapy.'
    },
    fitReasons: [
      'PED waiting period can be reduced to 12 months for Diabetes/BP',
      'No room rent limit allows single private room stays in Tier 1 hospitals',
      'Automatic unlimited restoration benefit if multiple claims arise'
    ]
  },
  {
    id: 'hdfc-optima-secure',
    name: 'HDFC ERGO Optima Secure',
    provider: 'HDFC ERGO',
    badge: '4x Coverage Protection',
    rating: 4.9,
    claimSettlementRatio: '97.5%',
    baseSumInsured: 1000000,
    sumInsuredOptions: [500000, 1000000, 2000000, 5000000],
    annualPremium: {
      age18_35: 11200,
      age36_50: 16800,
      age51_65: 28500,
    },
    // 1. Coverage
    coverage: {
      summary: '2X Instant cover from Day 1 + 100% Secure Benefit',
      inpatient: '100% In-patient expenses covered without co-pay',
      daycare: 'All Daycare procedures covered',
      ayush: 'Full AYUSH treatment coverage',
      restoration: '100% Restore benefit activated on first claim itself',
      ambulance: 'Air Ambulance up to ₹5 Lakhs + Road Ambulance actuals',
      organDonor: '100% Covered'
    },
    // 2. Waiting Period
    waitingPeriod: {
      initial: '30 Days',
      ped: '36 Months (Can be customized to 24 Months)',
      pedWaiverAvailable: false,
      specificIllnesses: '24 Months for specified procedures',
      accidents: '0 Days'
    },
    // 3. Exclusions
    exclusions: [
      'Self-inflicted injuries or suicide attempts',
      'Dental treatment unless requiring hospitalization due to trauma',
      'Congenital external anomalies',
      'Weight loss / bariatric treatment unless medically mandatory'
    ],
    // 4. Sum Insured
    sumInsuredDetails: {
      baseAmount: '₹10,000,000 (₹10 Lakhs)',
      cumulativeBonus: '100% Secure Benefit adds ₹10L on Day 1 (Total ₹20L cover instantly)',
      noClaimBonusMax: 'Reaches ₹40 Lakhs effective cover in 2 years'
    },
    // 5. Premium
    premiumDetails: {
      monthly: '₹1,400 / month',
      annually: '₹16,800 / year',
      taxBenefit: 'Section 80D tax benefit applicable'
    },
    // 6. Room-Rent Limits
    roomRent: {
      limitText: 'Any Room Category (Up to Suite Room in network hospitals)',
      icuLimit: 'No ICU Capping',
      cappingPercentage: 0
    },
    // 7. Disease-Specific Conditions & Sub-limits
    diseaseSpecificConditions: {
      diabetes: 'Covered post 36m wait. No sub-limits on medicines or insulin hospitalizations.',
      hypertension: 'Covered post 36m wait.',
      cardiacCare: 'Comprehensive cover with cashless cardiac network hospitals.',
      jointReplacement: 'Covered post 24m wait without sub-limit.',
      cataract: 'Covered up to actual charges (No sub-limit).',
      cancerCare: 'Advanced oncology procedures & biological targeted therapies included.'
    },
    fitReasons: [
      'Instant 2X coverage on Day 1 (₹10L base becomes ₹20L automatically)',
      'Zero room rent capping allowing any room tier without co-pay penalty',
      'High claim settlement ratio (97.5%) with zero co-pay across India'
    ]
  },
  {
    id: 'niva-reassure',
    name: 'Niva Bupa ReAssure 2.0',
    provider: 'Niva Bupa',
    badge: 'Unlimited Lock-in Premium',
    rating: 4.7,
    claimSettlementRatio: '94.8%',
    baseSumInsured: 1000000,
    sumInsuredOptions: [500000, 1000000, 2500000, 10000000],
    annualPremium: {
      age18_35: 8900,
      age36_50: 13200,
      age51_65: 22100,
    },
    // 1. Coverage
    coverage: {
      summary: 'ReAssure Forever (Unlimited reinstatement for any illness)',
      inpatient: 'Full Inpatient medical fees, surgery, diagnostics',
      daycare: 'All Daycare surgeries included',
      ayush: 'Covered up to Sum Insured',
      restoration: 'Unlimited reinstatement triggered even for the same illness',
      ambulance: 'Actual expenses covered',
      organDonor: 'Covered'
    },
    // 2. Waiting Period
    waitingPeriod: {
      initial: '30 Days',
      ped: '36 Months (Special Diabetes/Hypertension Day-1 add-on available)',
      pedWaiverAvailable: true,
      specificIllnesses: '24 Months',
      accidents: '0 Days'
    },
    // 3. Exclusions
    exclusions: [
      'Standard cosmetic procedures and aesthetic enhancements',
      'Routine eye exams and specs (unless surgical requirement)',
      'Substance abuse treatment',
      'War and nuclear contamination risks'
    ],
    // 4. Sum Insured
    sumInsuredDetails: {
      baseAmount: '₹10,000,000 (₹10 Lakhs)',
      cumulativeBonus: 'Lock the premium until first claim made',
      noClaimBonusMax: 'Carry forward unutilized sum insured without cap'
    },
    // 5. Premium
    premiumDetails: {
      monthly: '₹1,100 / month',
      annually: '₹13,200 / year',
      taxBenefit: 'Section 80D tax exemption'
    },
    // 6. Room-Rent Limits
    roomRent: {
      limitText: 'Single Private Room',
      icuLimit: 'Actual ICU expense',
      cappingPercentage: 0
    },
    // 7. Disease-Specific Conditions & Sub-limits
    diseaseSpecificConditions: {
      diabetes: 'Day-1 coverage available with Health+ Rider. Sub-limit: None.',
      hypertension: 'Day-1 coverage option available with Health+ Rider.',
      cardiacCare: 'Covered under cashless network.',
      jointReplacement: '24m wait. Sub-limit: None.',
      cataract: 'Up to ₹60,000 per eye.',
      cancerCare: 'Chemotherapy, radiotherapy & targeted surgery included.'
    },
    fitReasons: [
      'ReAssure Forever benefit triggers unlimited restores even for same illness repeat admissions',
      'Health+ Rider provides Day 1 coverage for Diabetes & BP',
      'Locked premium rate until your first claim'
    ]
  },
  {
    id: 'star-comprehensive',
    name: 'Star Health Comprehensive Plan',
    provider: 'Star Health',
    badge: 'Extensive Cashless Network',
    rating: 4.6,
    claimSettlementRatio: '92.4%',
    baseSumInsured: 1000000,
    sumInsuredOptions: [500000, 1000000, 1500000, 2500000],
    annualPremium: {
      age18_35: 10500,
      age36_50: 15400,
      age51_65: 26000,
    },
    // 1. Coverage
    coverage: {
      summary: 'Includes Bariatric Surgery, Maternity & Newborn Cover',
      inpatient: 'Inpatient hospitalization fully covered',
      daycare: 'All daycare procedures',
      ayush: 'Up to ₹20,000 per policy year',
      restoration: '100% Restoration once per year',
      ambulance: 'Up to ₹2,500 per hospital admission',
      organDonor: 'Covered up to 10% Sum Insured'
    },
    // 2. Waiting Period
    waitingPeriod: {
      initial: '30 Days',
      ped: '24 Months',
      pedWaiverAvailable: false,
      specificIllnesses: '24 Months',
      accidents: '0 Days'
    },
    // 3. Exclusions
    exclusions: [
      'Infertility and IVF treatments',
      'Congenital internal disease (first 24m)',
      'Unproven therapies',
      'Hormone replacement therapies'
    ],
    // 4. Sum Insured
    sumInsuredDetails: {
      baseAmount: '₹10,000,000 (₹10 Lakhs)',
      cumulativeBonus: '100% Bonus over 2 claim-free years',
      noClaimBonusMax: 'Up to ₹20 Lakhs'
    },
    // 5. Premium
    premiumDetails: {
      monthly: '₹1,283 / month',
      annually: '₹15,400 / year',
      taxBenefit: 'Section 80D savings'
    },
    // 6. Room-Rent Limits
    roomRent: {
      limitText: 'Single Private AC Room (Capped at 1% of Sum Insured for lower sum insured)',
      icuLimit: 'Actual ICU charges for ₹10L+ policy',
      cappingPercentage: 1
    },
    // 7. Disease-Specific Conditions & Sub-limits
    diseaseSpecificConditions: {
      diabetes: '24 Months waiting period. Outpatient consultations covered up to ₹5,000.',
      hypertension: '24 Months waiting period.',
      cardiacCare: 'Covered with specialized cardiac hospital network.',
      jointReplacement: '24 Months wait. Sub-limit ₹4 Lakhs.',
      cataract: 'Up to ₹40,000 per eye.',
      cancerCare: 'Covered up to Sum Insured.'
    },
    fitReasons: [
      'Short 24-month baseline waiting period for pre-existing conditions',
      'Includes OPD dental & optical consultations bonus',
      'Over 14,000+ network cashless hospitals nationwide'
    ]
  }
];

export const PRESET_MEDICAL_DOCUMENTS = [
  {
    id: 'doc-diabetes-bp',
    title: 'Doctor Certificate: Type 2 Diabetes & Hypertension',
    patientName: 'Brightlin Bright',
    patientAge: 44,
    gender: 'Male',
    doctorName: 'Dr. A. R. Sharma, MD (General Medicine)',
    hospital: 'Apex Healthcare Super Speciality Hospital',
    date: '2026-08-14',
    diagnosis: 'Type 2 Diabetes Mellitus (HbA1c 7.8%) with Stage 1 Essential Hypertension',
    preExistingDiseases: ['Diabetes', 'Hypertension'],
    recommendedProcedure: 'Medical Management, Routine HbA1c Monitoring & Cardiovascular Evaluation',
    estimatedCost: 650000,
    roomPreference: 'Single Private Room',
    extractedNotes: 'Patient cleared for health insurance coverage. Requires policy with short PED waiting period for metabolic disorders and zero room-rent sub-limits.',
    icon: '🩸'
  },
  {
    id: 'doc-knee-surgery',
    title: 'Discharge Summary: Total Knee Arthroplasty (Knee Replacement)',
    patientName: 'Sunita Sharma',
    patientAge: 58,
    gender: 'Female',
    doctorName: 'Dr. K. V. Raman, MS Ortho',
    hospital: 'Fortis Orthopedic Care Institute',
    date: '2026-09-02',
    diagnosis: 'Severe Grade IV Bilateral Osteoarthritis of Knees',
    preExistingDiseases: ['Osteoarthritis'],
    recommendedProcedure: 'Unilateral / Bilateral Total Knee Replacement (TKR Surgery)',
    estimatedCost: 850000,
    roomPreference: 'Single Private AC Room',
    extractedNotes: 'Recommended policy with high sub-limits for joint replacement surgery, 0% co-pay for senior age brackets, and full modern robotic surgery coverage.',
    icon: '🦴'
  },
  {
    id: 'doc-cardiac-stent',
    title: 'Medical Report: Coronary Artery Disease & Stenting',
    patientName: 'Rajesh Verma',
    patientAge: 52,
    gender: 'Male',
    doctorName: 'Dr. S. Mukherji, DM Cardiology',
    hospital: 'Metro Heart & Vascular Center',
    date: '2026-07-28',
    diagnosis: 'Coronary Artery Disease - Single Vessel Blockage (LAD 85%)',
    preExistingDiseases: ['Cardiac Condition', 'Hypertension'],
    recommendedProcedure: 'Percutaneous Coronary Intervention (PCI / Stent Placement)',
    estimatedCost: 1200000,
    roomPreference: 'ICU + Single Private Suite',
    extractedNotes: 'Requires insurance policy with high ICU allowance, instant restoration benefit, and cashless network in top cardiology centres.',
    icon: '🫀'
  },
  {
    id: 'doc-asthma-resp',
    title: 'Prescription: Bronchial Asthma & Acute Respiratory Care',
    patientName: 'Priya Nair',
    patientAge: 31,
    gender: 'Female',
    doctorName: 'Dr. Meera Menon, MD Pulmonology',
    hospital: 'City Care Chest & Respiratory Clinic',
    date: '2026-09-10',
    diagnosis: 'Moderate Persistent Bronchial Asthma with Allergic Rhinitis',
    preExistingDiseases: ['Asthma'],
    recommendedProcedure: 'Nebulization, Pulmonary Function Test & Inhaler Therapy',
    estimatedCost: 400000,
    roomPreference: 'Standard Private Room',
    extractedNotes: 'Policy needs coverage for respiratory daycare procedures, nebulization hospitalization, and minimum waiting period for pulmonary conditions.',
    icon: '🫁'
  }
];
