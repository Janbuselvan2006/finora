/**
 * Loan Financial Institutions & Salary Documents Dataset for Finora
 * Covers top Indian banks & NBFCs with parameters across all loan categories:
 * Home, Personal, Education, Car, and Business Loans.
 */

export const LOAN_TYPES = [
  { id: 'home', name: 'Home Loan', icon: '🏠', defaultAmount: 4500000, defaultTenure: 20, maxTenure: 30 },
  { id: 'personal', name: 'Personal Loan', icon: '👤', defaultAmount: 500000, defaultTenure: 3, maxTenure: 5 },
  { id: 'car', name: 'Car / Vehicle Loan', icon: '🚗', defaultAmount: 800000, defaultTenure: 5, maxTenure: 7 },
  { id: 'education', name: 'Education Loan', icon: '🎓', defaultAmount: 1500000, defaultTenure: 7, maxTenure: 15 },
  { id: 'business', name: 'Business / MSME Loan', icon: '🏢', defaultAmount: 2500000, defaultTenure: 5, maxTenure: 10 }
];

export const FINANCIAL_INSTITUTIONS = [
  {
    id: 'sbi-bank',
    name: 'State Bank of India (SBI)',
    shortName: 'SBI',
    badge: 'Lowest Interest Rate',
    rating: 4.8,
    type: 'Public Sector Bank',
    loanProducts: {
      home: {
        interestRate: 8.40,
        rateType: 'Floating (EBLR linked)',
        processingFee: '0.15% (Min ₹2,000, Max ₹10,000) - Often waived during festive offers',
        prepaymentFee: 'Nil (0% prepayment penalty on floating rate)',
        disbursalTime: '5 - 7 working days',
        maxFoir: 0.65, // 65% of net monthly income allowed for EMI
        specialBenefit: '0.05% interest concession for women borrowers; No hidden annual fees'
      },
      personal: {
        interestRate: 10.30,
        rateType: 'Fixed / Floating',
        processingFee: 'Flat ₹1,500 + GST',
        prepaymentFee: '3% if prepaid within 1 year, Nil thereafter',
        disbursalTime: '24 - 48 hours for salary account holders',
        maxFoir: 0.50,
        specialBenefit: 'Express Credit Loan available for corporate & govt employees'
      },
      car: {
        interestRate: 8.65,
        rateType: 'Fixed',
        processingFee: 'Nil (Zero processing fee on YONO)',
        prepaymentFee: 'Nil after 2 years',
        disbursalTime: '2 - 3 days',
        maxFoir: 0.60,
        specialBenefit: 'Financing up to 90% of on-road car price'
      },
      education: {
        interestRate: 8.15,
        rateType: 'Floating',
        processingFee: 'Nil for studies in India, ₹10,000 for abroad',
        prepaymentFee: 'Nil',
        disbursalTime: '7 - 10 days',
        maxFoir: 0.70,
        specialBenefit: '0.50% concession for girl students + Moratorium period (Course + 1 yr)'
      },
      business: {
        interestRate: 9.25,
        rateType: 'Floating',
        processingFee: '0.50%',
        prepaymentFee: 'Nil on floating rate loans to MSEs',
        disbursalTime: '7 - 14 days',
        maxFoir: 0.60,
        specialBenefit: 'CGTMSE collateral-free guarantee support'
      }
    }
  },
  {
    id: 'hdfc-bank',
    name: 'HDFC Bank',
    shortName: 'HDFC Bank',
    badge: 'Fastest Disbursal & Digital Onboarding',
    rating: 4.9,
    type: 'Private Sector Bank',
    loanProducts: {
      home: {
        interestRate: 8.50,
        rateType: 'Floating (Repo Rate Linked)',
        processingFee: '0.50% or ₹3,000 whichever is higher',
        prepaymentFee: 'Nil on floating rates for individual borrowers',
        disbursalTime: '3 - 5 days',
        maxFoir: 0.60,
        specialBenefit: 'Instant digital in-principle sanction letter in 10 minutes'
      },
      personal: {
        interestRate: 10.50,
        rateType: 'Fixed',
        processingFee: 'Up to ₹4,999 + GST',
        prepaymentFee: '4% of principal outstanding after 12 months',
        disbursalTime: 'Instant 10-second disbursal for pre-approved customers',
        maxFoir: 0.55,
        specialBenefit: 'Top-tier corporate category employees get flat 10.25% special ROI'
      },
      car: {
        interestRate: 8.75,
        rateType: 'Fixed',
        processingFee: 'Flat ₹3,500',
        prepaymentFee: '5% if closed before 1 year, 3% thereafter',
        disbursalTime: 'Same-day 30-minute approval',
        maxFoir: 0.55,
        specialBenefit: '100% on-road funding for select luxury vehicle models'
      },
      education: {
        interestRate: 9.50,
        rateType: 'Floating',
        processingFee: '1.0% + GST',
        prepaymentFee: 'Nil',
        disbursalTime: '3 - 5 days',
        maxFoir: 0.65,
        specialBenefit: 'Unsecured education loans up to ₹50 Lakhs for premier universities'
      },
      business: {
        interestRate: 11.25,
        rateType: 'Fixed',
        processingFee: '1.50%',
        prepaymentFee: '4% on premature closure',
        disbursalTime: '48 hours',
        maxFoir: 0.55,
        specialBenefit: 'Zero collateral required up to ₹75 Lakhs for eligible businesses'
      }
    }
  },
  {
    id: 'icici-bank',
    name: 'ICICI Bank',
    shortName: 'ICICI Bank',
    badge: 'Best Digital App Experience & Flexibility',
    rating: 4.7,
    type: 'Private Sector Bank',
    loanProducts: {
      home: {
        interestRate: 8.60,
        rateType: 'Floating (I-EBLR linked)',
        processingFee: '0.50% of loan amount + GST',
        prepaymentFee: 'Nil on floating rate home loans',
        disbursalTime: '3 - 5 days',
        maxFoir: 0.60,
        specialBenefit: 'Extra Home Loan feature: higher eligibility with step-up repayment facility'
      },
      personal: {
        interestRate: 10.65,
        rateType: 'Fixed',
        processingFee: 'Up to 2.25% + GST',
        prepaymentFee: '3% after 12 EMIs',
        disbursalTime: '3 seconds for pre-approved accounts',
        maxFoir: 0.50,
        specialBenefit: 'Flexible tenure up to 72 months to keep EMIs light'
      },
      car: {
        interestRate: 8.85,
        rateType: 'Fixed',
        processingFee: 'Flat ₹4,000',
        prepaymentFee: '3% after 1 year',
        disbursalTime: '24 hours',
        maxFoir: 0.55,
        specialBenefit: 'Pre-approved car loans with instant token generation'
      },
      education: {
        interestRate: 9.60,
        rateType: 'Floating',
        processingFee: '0.75% + GST',
        prepaymentFee: 'Nil',
        disbursalTime: '5 days',
        maxFoir: 0.60,
        specialBenefit: 'Tax deduction under Section 80E on total interest paid'
      },
      business: {
        interestRate: 11.50,
        rateType: 'Floating',
        processingFee: '1.0% - 2.0%',
        prepaymentFee: '2% after 6 months',
        disbursalTime: '3 - 4 days',
        maxFoir: 0.50,
        specialBenefit: 'OD (Overdraft) facility bundled with business current accounts'
      }
    }
  },
  {
    id: 'axis-bank',
    name: 'Axis Bank',
    shortName: 'Axis Bank',
    badge: 'Best EMI Waiver & Loyalty Rewards',
    rating: 4.6,
    type: 'Private Sector Bank',
    loanProducts: {
      home: {
        interestRate: 8.65,
        rateType: 'Floating',
        processingFee: 'Up to 1% or ₹10,000',
        prepaymentFee: 'Nil',
        disbursalTime: '4 - 6 days',
        maxFoir: 0.60,
        specialBenefit: 'Shubh Aarambh Home Loan: 12 EMIs waived off on timely payments'
      },
      personal: {
        interestRate: 10.75,
        rateType: 'Fixed',
        processingFee: '1.5% - 2%',
        prepaymentFee: 'Nil foreclosure charges on select schemes',
        disbursalTime: '1 - 2 days',
        maxFoir: 0.50,
        specialBenefit: 'EDGE reward points earned on every regular EMI payment'
      },
      car: {
        interestRate: 8.90,
        rateType: 'Fixed',
        processingFee: 'Flat ₹3,500',
        prepaymentFee: '5% within 1 year, 0% after 3 years',
        disbursalTime: '24 - 48 hours',
        maxFoir: 0.55,
        specialBenefit: 'Up to 100% on-road funding for electric vehicles (EV discount)'
      },
      education: {
        interestRate: 9.75,
        rateType: 'Floating',
        processingFee: 'Flat ₹10,000 for foreign universities',
        prepaymentFee: 'Nil',
        disbursalTime: '5 - 7 days',
        maxFoir: 0.60,
        specialBenefit: 'Pre-visa approval disbursement available'
      },
      business: {
        interestRate: 12.00,
        rateType: 'Fixed',
        processingFee: '1.50%',
        prepaymentFee: '3% after 1 year',
        disbursalTime: '3 - 5 days',
        maxFoir: 0.50,
        specialBenefit: 'Fast-track approval based on GST return filings'
      }
    }
  },
  {
    id: 'bajaj-finserv',
    name: 'Bajaj Finserv',
    shortName: 'Bajaj Finserv',
    badge: 'Flexi-Loan Facility with Lowest Initial EMI',
    rating: 4.5,
    type: 'Leading NBFC',
    loanProducts: {
      home: {
        interestRate: 8.80,
        rateType: 'Floating',
        processingFee: '0.25% - 0.50%',
        prepaymentFee: 'Nil on floating rate loans',
        disbursalTime: '48 hours',
        maxFoir: 0.65,
        specialBenefit: 'Flexi Hybrid variant: Pay interest-only EMIs for the initial tenure'
      },
      personal: {
        interestRate: 11.00,
        rateType: 'Fixed',
        processingFee: 'Up to 2.50%',
        prepaymentFee: '4% on outstanding amount',
        disbursalTime: '20 minutes to 2 hours',
        maxFoir: 0.55,
        specialBenefit: 'Flexi Term Loan: Withdraw and prepay multiple times at zero extra fee'
      },
      car: {
        interestRate: 9.20,
        rateType: 'Fixed',
        processingFee: '1.50%',
        prepaymentFee: '4%',
        disbursalTime: 'Same day',
        maxFoir: 0.55,
        specialBenefit: 'Pre-approved loan against existing used car or new purchase'
      },
      education: {
        interestRate: 10.25,
        rateType: 'Floating',
        processingFee: '1.0%',
        prepaymentFee: 'Nil',
        disbursalTime: '48 hours',
        maxFoir: 0.60,
        specialBenefit: 'Comprehensive coverage including accommodation & exam fees'
      },
      business: {
        interestRate: 12.50,
        rateType: 'Fixed',
        processingFee: '2.0%',
        prepaymentFee: '4%',
        disbursalTime: '24 hours',
        maxFoir: 0.60,
        specialBenefit: 'Minimal documentation with simple bank statement net-banking upload'
      }
    }
  }
];

export const PRESET_INCOME_DOCUMENTS = [
  {
    id: 'payslip-tech-lead',
    title: 'Salary Slip: Senior Tech Lead (Tier-1 MNC)',
    employeeName: 'Brightlin Bright',
    employerName: 'Google India Pvt Ltd',
    employerCategory: 'Category A (Fortune 500 / Top Tier MNC)',
    designation: 'Staff Software Engineer',
    payPeriod: 'August 2026',
    grossMonthlySalary: 185000,
    netMonthlySalary: 142000,
    deductions: {
      pf: 18000,
      tax: 23000,
      existingEmi: 2000 // Small gadget EMI
    },
    cibilEstimate: 790,
    salaryAccountBank: 'HDFC Bank',
    notes: 'Clean financial track record. Eligible for super-prime interest rates and up to 65% FOIR limit across all banks.',
    icon: '💻'
  },
  {
    id: 'payslip-mid-analyst',
    title: 'Salary Slip: Financial Analyst (Mid-Corporate)',
    employeeName: 'Ananya Deshmukh',
    employerName: 'KPMG Advisory Services',
    employerCategory: 'Category A (Big 4 / Listed Corporate)',
    designation: 'Senior Financial Analyst',
    payPeriod: 'August 2026',
    grossMonthlySalary: 82000,
    netMonthlySalary: 64500,
    deductions: {
      pf: 7500,
      tax: 8000,
      existingEmi: 15000 // Existing bike/education loan
    },
    cibilEstimate: 760,
    salaryAccountBank: 'ICICI Bank',
    notes: 'Stable corporate career. Has existing EMI obligation of ₹15,000/mo. Recommended banks with generous FOIR criteria.',
    icon: '📊'
  },
  {
    id: 'itr-business-owner',
    title: 'ITR-V & Bank Statement: Digital Agency Owner',
    employeeName: 'Vikramaditya Rao',
    employerName: 'Vortex Digital Solutions LLP',
    employerCategory: 'Self-Employed Professional / Business Owner',
    designation: 'Managing Partner',
    payPeriod: 'AY 2026-27 (3-Year Audited ITR)',
    grossMonthlySalary: 290000,
    netMonthlySalary: 215000,
    deductions: {
      pf: 0,
      tax: 65000,
      existingEmi: 25000 // Commercial vehicle EMI
    },
    cibilEstimate: 775,
    salaryAccountBank: 'Axis Bank',
    notes: 'Healthy 3-year rising profit margins and average monthly bank balance > ₹4 Lakhs. Ideal candidate for Home & Business loan programs.',
    icon: '🏢'
  },
  {
    id: 'payslip-govt-officer',
    title: 'Salary Slip: Section Officer (Central Government)',
    employeeName: 'Rajeshwari Iyer',
    employerName: 'Ministry of Finance / Central Govt',
    employerCategory: 'Central Government / PSU',
    designation: 'Senior Section Officer (Gazetted)',
    payPeriod: 'August 2026',
    grossMonthlySalary: 104000,
    netMonthlySalary: 83000,
    deductions: {
      pf: 11000,
      tax: 9500,
      existingEmi: 0 // Zero existing debt
    },
    cibilEstimate: 810,
    salaryAccountBank: 'State Bank of India (SBI)',
    notes: 'Government job security + pristine 810 CIBIL score. Eligible for government-special interest subsidies and SBI Express Credit benefits.',
    icon: '🏛️'
  }
];
