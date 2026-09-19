/**
 * Finora Insurance Journey Interactive Script
 * Provides AI Doctor Certificate OCR & Policy Recommendation Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const presetButtons = document.querySelectorAll('.med-preset-item');
  const ocrLoader = document.getElementById('medOcrLoader');
  const extractedCard = document.getElementById('medExtractedCard');
  const resultsArea = document.getElementById('medResultsArea');
  const fileInput = document.getElementById('medFileInputHTML');

  // Preset data dictionary
  const PRESETS = {
    'diabetes': {
      title: 'Doctor Certificate: Type 2 Diabetes & Hypertension',
      patient: 'Brightlin Bright (44 yrs, Male)',
      diagnosis: 'Type 2 Diabetes Mellitus with Stage 1 Essential Hypertension',
      peds: ['Diabetes', 'Hypertension'],
      cost: '₹6,50,000',
      facility: 'Apex Healthcare Super Speciality Hospital',
      note: 'Requires policy with short PED waiting period for metabolic disorders and zero room-rent sub-limits.',
      bestPolicy: 'Care Supreme Plan',
      bestProvider: 'Care Health Insurance',
      fitScore: '96%',
      premium: '₹14,500 / yr',
      pedWait: '24 Months (12m with rider)',
      roomRent: 'No Capping (Single Private Room)',
      rationale: [
        'PED rider reduces waiting period for Diabetes/Hypertension down to 12 months.',
        'No room rent limit allows single private room stays without claim deduction penalties.',
        'Automatic unlimited restoration benefit if multiple claims arise.'
      ]
    },
    'knee': {
      title: 'Discharge Summary: Total Knee Arthroplasty (Knee Surgery)',
      patient: 'Sunita Sharma (58 yrs, Female)',
      diagnosis: 'Severe Grade IV Bilateral Osteoarthritis of Knees',
      peds: ['Osteoarthritis'],
      cost: '₹8,50,000',
      facility: 'Fortis Orthopedic Care Institute',
      note: 'Recommended policy with high sub-limits for joint replacement surgery and zero room-rent capping.',
      bestPolicy: 'HDFC ERGO Optima Secure',
      bestProvider: 'HDFC ERGO',
      fitScore: '98%',
      premium: '₹16,800 / yr',
      pedWait: '24 Months',
      roomRent: 'Any Room Category (No Capping)',
      rationale: [
        'Instant 2X coverage on Day 1 (₹10L base becomes ₹20L automatically).',
        'Zero room rent capping allowing any room tier without co-pay penalty.',
        'Zero sub-limits on joint replacement surgery.'
      ]
    },
    'cardiac': {
      title: 'Medical Report: Coronary Artery Disease & Stenting',
      patient: 'Rajesh Verma (52 yrs, Male)',
      diagnosis: 'Coronary Artery Disease - Single Vessel Blockage (LAD 85%)',
      peds: ['Cardiac Condition', 'Hypertension'],
      cost: '₹12,00,000',
      facility: 'Metro Heart & Vascular Center',
      note: 'Requires insurance policy with high ICU allowance, instant restoration benefit, and cashless network in top cardiology centres.',
      bestPolicy: 'Niva Bupa ReAssure 2.0',
      bestProvider: 'Niva Bupa',
      fitScore: '95%',
      premium: '₹13,200 / yr',
      pedWait: '36 Months (Day-1 Rider Available)',
      roomRent: 'Single Private Room',
      rationale: [
        'ReAssure Forever benefit triggers unlimited restores even for same illness repeat admissions.',
        'Health+ Rider provides Day 1 coverage for Cardiac & BP.',
        'Locked premium rate until your first claim.'
      ]
    }
  };

  function renderAnalysis(data) {
    if (!ocrLoader || !extractedCard || !resultsArea) return;

    ocrLoader.style.display = 'block';
    extractedCard.style.display = 'none';
    resultsArea.style.display = 'none';

    setTimeout(() => {
      ocrLoader.style.display = 'none';

      // Extracted Card Details
      document.getElementById('extPatient').textContent = data.patient;
      document.getElementById('extDiagnosis').textContent = data.diagnosis;
      document.getElementById('extCost').textContent = data.cost;
      document.getElementById('extFacility').textContent = data.facility;
      document.getElementById('extNote').textContent = data.note;

      const pedsContainer = document.getElementById('extPeds');
      if (pedsContainer) {
        pedsContainer.innerHTML = data.peds.map(p => `<span class="ped-tag">⚠️ ${p}</span>`).join('');
      }

      // Best Fit Policy Card
      document.getElementById('resBestPolicy').textContent = data.bestPolicy;
      document.getElementById('resBestProvider').textContent = data.bestProvider;
      document.getElementById('resFitScore').textContent = `🎯 ${data.fitScore} Match Score`;
      document.getElementById('resPremium').textContent = data.premium;
      document.getElementById('resPedWait').textContent = data.pedWait;
      document.getElementById('resRoomRent').textContent = data.roomRent;

      const ratContainer = document.getElementById('resRationale');
      if (ratContainer) {
        ratContainer.innerHTML = data.rationale.map(r => `<li>${r}</li>`).join('');
      }

      extractedCard.style.display = 'block';
      resultsArea.style.display = 'block';
    }, 1000);
  }

  // Bind click handlers to preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-preset-key') || 'diabetes';
      if (PRESETS[key]) {
        renderAnalysis(PRESETS[key]);
      }
    });
  });

  // Handle custom file select
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        presetButtons.forEach(b => b.classList.remove('active'));
        renderAnalysis({
          title: `OCR Scan: ${file.name}`,
          patient: 'Custom Patient (45 yrs, Male)',
          diagnosis: 'Extracted Clinical Diagnosis & Medical Evaluation',
          peds: ['Diabetes', 'Hypertension'],
          cost: '₹5,00,000',
          facility: 'Uploaded Medical Certificate',
          note: `Extracted parameters from ${file.name}. Recommended short PED waiting period policy.`,
          bestPolicy: 'Care Supreme Plan',
          bestProvider: 'Care Health Insurance',
          fitScore: '94%',
          premium: '₹14,500 / yr',
          pedWait: '24 Months (12m with rider)',
          roomRent: 'No Capping (Single Private Room)',
          rationale: [
            'Shortest PED waiting period available for extracted conditions.',
            'Zero room rent capping preventing co-pay penalties.',
            'High claim settlement ratio.'
          ]
        });
      }
    });
  }

  // Initial render
  renderAnalysis(PRESETS['diabetes']);
});
