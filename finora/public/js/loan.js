/**
 * Finora Loan Journey Interactive Script
 * Provides AI Salary Slip OCR & Lender Recommendation Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const presetButtons = document.querySelectorAll('.loan-preset-item');
  const loanTypeButtons = document.querySelectorAll('.loan-type-btn');
  const ocrLoader = document.getElementById('loanOcrLoader');
  const extractedCard = document.getElementById('loanExtractedCard');
  const resultsArea = document.getElementById('loanResultsArea');
  const fileInput = document.getElementById('loanFileInputHTML');
  const amountSlider = document.getElementById('loanAmountSlider');
  const amountDisplay = document.getElementById('loanAmountDisplay');
  const tenureSlider = document.getElementById('loanTenureSlider');
  const tenureDisplay = document.getElementById('loanTenureDisplay');

  let currentLoanType = 'home';
  let currentAmount = 4500000;
  let currentTenure = 20;

  const PRESETS = {
    'tech-lead': {
      name: 'Brightlin Bright',
      employer: 'Google India (Tier-1 MNC)',
      netSalary: '₹1,42,000 / mo',
      grossSalary: '₹1,85,000 / mo',
      existingEmi: '₹2,000 / mo',
      cibil: '790 (Super-Prime)',
      notes: 'Super-prime borrower with high disposable income. Eligible for lowest rate brackets across all banks.',
      bestLender: 'State Bank of India (SBI)',
      bestType: 'Public Sector Bank',
      matchScore: '98%',
      roi: '8.40% p.a.',
      emi: '₹38,767 / mo',
      fee: '0.15% (Min ₹2,000)',
      prepay: 'Nil (0% on floating)',
      speed: '5-7 working days',
      rationale: [
        'Lowest floating interest rate in India (8.40% linked to RBI EBLR).',
        'Zero prepayment penalties on floating rate loans.',
        'High FOIR allowance up to 65% of net monthly income.'
      ]
    },
    'analyst': {
      name: 'Ananya Deshmukh',
      employer: 'KPMG Advisory (Corporate)',
      netSalary: '₹64,500 / mo',
      grossSalary: '₹82,000 / mo',
      existingEmi: '₹15,000 / mo',
      cibil: '760 (Prime)',
      notes: 'Stable corporate career. Has existing EMI obligation of ₹15,000/mo. Recommended banks with high FOIR flexibility.',
      bestLender: 'HDFC Bank',
      bestType: 'Private Sector Bank',
      matchScore: '96%',
      roi: '8.50% p.a.',
      emi: '₹39,058 / mo',
      fee: '0.50% or ₹3,000',
      prepay: 'Nil on floating rates',
      speed: '3-5 days',
      rationale: [
        'Tier-1 Corporate Category A perk applied: special interest concession.',
        'Instant digital in-principle sanction letter in 10 minutes.',
        'Fast turnaround and paperless salary account verification.'
      ]
    },
    'business': {
      name: 'Vikramaditya Rao',
      employer: 'Vortex Digital Solutions LLP (Business)',
      netSalary: '₹2,15,000 / mo',
      grossSalary: '₹2,90,000 / mo',
      existingEmi: '₹25,000 / mo',
      cibil: '775 (Prime)',
      notes: 'Healthy 3-year rising profit margins and average bank balance > ₹4 Lakhs. Ideal candidate for Home & Business loan programs.',
      bestLender: 'ICICI Bank',
      bestType: 'Private Sector Bank',
      matchScore: '95%',
      roi: '8.60% p.a.',
      emi: '₹39,350 / mo',
      fee: '0.50% of loan amount',
      prepay: 'Nil on floating rates',
      speed: '3-5 days',
      rationale: [
        'Step-up repayment options suited for self-employed professionals.',
        'Overdraft (OD) facility bundled with business current account.',
        'High borrowing capacity multipliers.'
      ]
    }
  };

  let activePreset = PRESETS['tech-lead'];

  function updateDisplay() {
    if (!ocrLoader || !extractedCard || !resultsArea) return;

    ocrLoader.style.display = 'block';
    extractedCard.style.display = 'none';
    resultsArea.style.display = 'none';

    setTimeout(() => {
      ocrLoader.style.display = 'none';

      // Extracted Profile
      document.getElementById('loanExtName').textContent = activePreset.name;
      document.getElementById('loanExtEmployer').textContent = activePreset.employer;
      document.getElementById('loanExtNetSalary').textContent = activePreset.netSalary;
      document.getElementById('loanExtGrossSalary').textContent = activePreset.grossSalary;
      document.getElementById('loanExtEmi').textContent = activePreset.existingEmi;
      document.getElementById('loanExtCibil').textContent = activePreset.cibil;
      document.getElementById('loanExtNotes').textContent = activePreset.notes;

      // Recommended Lender
      document.getElementById('resBestLender').textContent = activePreset.bestLender;
      document.getElementById('resLenderType').textContent = activePreset.bestType;
      document.getElementById('resLenderMatch').textContent = `🎯 ${activePreset.matchScore} Match Score`;
      document.getElementById('resLenderRoi').textContent = activePreset.roi;
      document.getElementById('resLenderEmi').textContent = activePreset.emi;
      document.getElementById('resLenderFee').textContent = activePreset.fee;
      document.getElementById('resLenderPrepay').textContent = activePreset.prepay;
      document.getElementById('resLenderSpeed').textContent = `⚡ ${activePreset.speed}`;

      const ratList = document.getElementById('resLenderRationale');
      if (ratList) {
        ratList.innerHTML = activePreset.rationale.map(r => `<li>${r}</li>`).join('');
      }

      extractedCard.style.display = 'block';
      resultsArea.style.display = 'block';
    }, 1000);
  }

  // Bind Preset clicks
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-preset-key') || 'tech-lead';
      if (PRESETS[key]) {
        activePreset = PRESETS[key];
        updateDisplay();
      }
    });
  });

  // Bind Loan Type buttons
  loanTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      loanTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLoanType = btn.getAttribute('data-loan-type') || 'home';
      updateDisplay();
    });
  });

  // Sliders
  if (amountSlider && amountDisplay) {
    amountSlider.addEventListener('input', (e) => {
      currentAmount = Number(e.target.value);
      amountDisplay.textContent = `₹${(currentAmount / 100000).toFixed(1)} Lakhs`;
    });
  }

  if (tenureSlider && tenureDisplay) {
    tenureSlider.addEventListener('input', (e) => {
      currentTenure = Number(e.target.value);
      tenureDisplay.textContent = `${currentTenure} Years`;
    });
  }

  // Custom File select
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        presetButtons.forEach(b => b.classList.remove('active'));
        activePreset = {
          name: 'Verified Applicant Document',
          employer: 'Corporate Entity',
          netSalary: '₹95,000 / mo',
          grossSalary: '₹1,25,000 / mo',
          existingEmi: '₹5,000 / mo',
          cibil: '770 (Prime)',
          notes: `AI financial extraction completed from "${file.name}". Clean FOIR balance evaluated.`,
          bestLender: 'State Bank of India (SBI)',
          bestType: 'Public Sector Bank',
          matchScore: '97%',
          roi: '8.40% p.a.',
          emi: '₹38,767 / mo',
          fee: '0.15% (Min ₹2,000)',
          prepay: 'Nil (0% on floating)',
          speed: '5-7 working days',
          rationale: [
            'Optimal ROI for your salary tier.',
            'Zero prepayment penalties.',
            'Pre-approved in-principle limit.'
          ]
        };
        updateDisplay();
      }
    });
  }

  // Initial Run
  updateDisplay();
});
