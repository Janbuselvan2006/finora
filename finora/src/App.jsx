import React, { useState, useEffect } from 'react';
import LoanDocScanner from './components/LoanDocScanner';
import MedicalDocScanner from './components/MedicalDocScanner';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeStep, setActiveStep] = useState(2); // 0-indexed, 2 = 03 Prepare
  const [activeModal, setActiveModal] = useState(null); // 'emi', 'eligibility', 'docs', null
  const [searchQuery, setSearchQuery] = useState('');
  
  // Finora AI Chat State
  const [aiDialogue, setAiDialogue] = useState([
    {
      sender: 'ai',
      text: "Hi, I'm Finora AI 👋 What financial journey are you trying to understand?"
    }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Interactive EMI Calculator State for Modal
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(5);

  // Sync theme attribute to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Stepper descriptions dictionary
  const STEP_DETAILS = [
    {
      num: '01',
      title: '01 — Discover Goals & Understand Financial Options',
      desc: 'Clarify your personal or business goals. Finora AI simplifies complex banking terminology so you start your journey with crystal clarity.',
      tip: 'AI Tip: Clearly defining loan purpose unlocks specialized lower-rate government and corporate subsidy programs.',
      actionText: 'Explore Loan Categories',
      modal: 'eligibility'
    },
    {
      num: '02',
      title: '02 — Explore Top Lenders & Insurance Coverage',
      desc: 'Compare pre-approved institutional offers across interest rates, processing waivers, and disease-specific coverage limits.',
      tip: 'AI Tip: Comparing at least 3 institutions saves an average of ₹1.4 Lakhs in lifetime interest repayments.',
      actionText: 'Compare Financial Offers',
      modal: 'emi'
    },
    {
      num: '03',
      title: '03 — Prepare Documentation & Assess Financial Health',
      desc: 'Organize your KYC records, income statements, and credit score records. Finora AI verifies checklist readiness so you avoid rejection delays.',
      tip: 'AI Tip: Matching names across PAN and Aadhaar prevents 92% of early documentation rejections.',
      actionText: 'Open Document Checklist',
      modal: 'docs'
    },
    {
      num: '04',
      title: '04 — Navigate Paperless Application & Digital KYC',
      desc: 'Fast-track onboarding via instant DigiLocker credential sharing, e-sign, and video verification without physical paperwork.',
      tip: 'AI Tip: Digital KYC applications are processed 4x faster than paper-based submission queues.',
      actionText: 'Check Eligibility Standards',
      modal: 'eligibility'
    },
    {
      num: '05',
      title: '05 — Complete Disbursal & Track Repayment Milestones',
      desc: 'Track loan sanction milestones, policy issuance, and monitor automated EMI debit schedules with transparent reporting.',
      tip: 'AI Tip: Setting up automated NACH mandate ensures zero missed EMIs and boosts CIBIL score.',
      actionText: 'Calculate EMI Schedule',
      modal: 'emi'
    }
  ];

  // Calculate Modal EMI
  const calculateModalEmi = () => {
    const monthlyRate = calcRate / (12 * 100);
    const months = calcTenure * 12;
    const emi = (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    const roundedEmi = Math.round(emi);
    const totalPayment = roundedEmi * months;
    const totalInterest = Math.max(0, totalPayment - calcAmount);
    return {
      emi: roundedEmi,
      totalPayment,
      totalInterest
    };
  };

  const emiStats = calculateModalEmi();

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userText = aiInput;
    setAiDialogue(prev => [...prev, { sender: 'user', text: userText }]);
    setAiInput('');

    setTimeout(() => {
      let reply = `I've organized the next steps for "${userText}". Check our AI Salary and Medical document scanners below for personalized rates!`;
      const lower = userText.toLowerCase();
      if (lower.includes('loan') || lower.includes('interest')) {
        reply = `For loans, your verified salary unlocks prime rates as low as 8.40% p.a. You can adjust the requested amount in our AI Salary Finder below.`;
      } else if (lower.includes('insurance') || lower.includes('health')) {
        reply = `For health coverage, upload your doctor certificate or test report below to get policy matching across pre-existing disease waiting periods.`;
      } else if (lower.includes('emi')) {
        reply = `Monthly EMI depends on your loan principal, ROI and tenure. Click "Review EMI" above to open our instant interactive calculator!`;
      }

      setAiDialogue(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleQuickAction = (text) => {
    setAiDialogue(prev => [
      ...prev,
      { sender: 'user', text },
      { sender: 'ai', text: `Analyzing "${text}"... Let's review the required documents and lowest cost options tailored to your profile.` }
    ]);
  };

  return (
    <div className="app-container">
      <div className="dashboard-viewport">
        
        {/* ==================================================================
             LEFT FLOATING SIDEBAR DOCK (Reference Cilo Inspired)
             ================================================================== */}
        <aside class="sidebar-dock" aria-label="Finora Main Navigation">
          <a href="#" className="sidebar-logo-pill" aria-label="Finora Home">
            <svg className="sidebar-logo-svg" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
            </svg>
          </a>

          <nav className="sidebar-nav-container" aria-label="Platform Views">
            <button 
              type="button" 
              className="sidebar-btn active" 
              data-tooltip="Dashboard Overview"
              aria-label="Home Overview"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
            </button>

            <a href="loan.html" className="sidebar-btn" data-tooltip="Loans Journey" aria-label="Loans">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="3" y1="21" x2="21" y2="21"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polyline points="5 6 12 3 19 6"></polyline>
                <line x1="6" y1="10" x2="6" y2="21"></line>
                <line x1="10" y1="10" x2="10" y2="21"></line>
                <line x1="14" y1="10" x2="14" y2="21"></line>
                <line x1="18" y1="10" x2="18" y2="21"></line>
              </svg>
            </a>

            <a href="insurance.html" className="sidebar-btn" data-tooltip="Insurance Journey" aria-label="Insurance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </a>

            <a href="fintech.html" className="sidebar-btn" data-tooltip="Fintech Services" aria-label="Fintech">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </a>

            <a href="#ai-companion" className="sidebar-btn" data-tooltip="Finora AI" aria-label="AI Assistant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </a>
          </nav>

          <div className="sidebar-footer-nav" aria-label="Utility Controls">
            <button 
              type="button" 
              className="sidebar-btn" 
              data-tooltip="Settings" 
              aria-label="Settings"
              onClick={() => setActiveModal('docs')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button 
              type="button" 
              className="sidebar-btn" 
              data-tooltip="Help & FAQ" 
              aria-label="Help"
              onClick={() => setActiveModal('eligibility')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div>
        </aside>

        {/* ==================================================================
             MAIN FLOW VIEWPORT (HEADER + CENTER + RIGHT PANEL)
             ================================================================== */}
        <div className="dashboard-main-flow">
          
          {/* TOP PILL HEADER */}
          <header className="top-pill-header" role="banner">
            <div className="header-left-search">
              <div className="search-pill-container">
                <svg className="search-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="search" 
                  className="search-pill-input" 
                  placeholder="Search financial topics, products or your questions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-shortcut-badge">⌘K</span>
              </div>
            </div>

            <div className="header-right-actions">
              <div className="team-avatar-pill" title="Advisors Online">
                <div className="avatar-stack">
                  <div className="avatar-img-sm" style={{ background: '#E2E8F0' }}>👨‍💼</div>
                  <div className="avatar-img-sm" style={{ background: '#CBD5E1' }}>👩‍💻</div>
                </div>
                <span className="avatar-more-count">+2</span>
              </div>

              <div className="theme-pill-toggle">
                <button 
                  type="button" 
                  className={`theme-mode-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  aria-label="Light Mode"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </button>
                <button 
                  type="button" 
                  className={`theme-mode-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  aria-label="Dark Mode"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                </button>
              </div>

              <button 
                type="button" 
                className="header-icon-pill" 
                aria-label="Notifications"
                onClick={() => alert('Finora AI Alert: 1 new pre-approved home loan offer from SBI at 8.40% p.a.')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="unread-indicator"></span>
              </button>

              <div className="user-profile-pill">
                <div className="user-avatar-circle">BB</div>
                <span className="user-pill-name">Brightlin</span>
              </div>

              <button 
                type="button" 
                className="header-action-btn-black"
                onClick={() => setActiveModal('emi')}
              >
                <span>Start Journey</span>
                <span>→</span>
              </button>
            </div>
          </header>

          {/* DASHBOARD 2-COLUMN CONTAINER */}
          <div className="dashboard-grid-container">
            
            {/* CENTER MAIN COLUMN */}
            <main className="dashboard-center-column" role="main">
              
              {/* Heading Row */}
              <div className="dashboard-heading-row">
                <div className="dashboard-heading-group">
                  <div className="dashboard-greeting-eyebrow">
                    <span>👋</span>
                    <span>Good morning, Brightlin</span>
                  </div>
                  <h1 className="dashboard-page-title">Finora Overview</h1>
                </div>

                <div className="dashboard-heading-controls">
                  <button 
                    type="button" 
                    className="pill-icon-control" 
                    title="Filter View"
                    onClick={() => setActiveModal('eligibility')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="21" x2="4" y2="14"></line>
                      <line x1="4" y1="10" x2="4" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12" y2="3"></line>
                      <line x1="20" y1="21" x2="20" y2="16"></line>
                      <line x1="20" y1="12" x2="20" y2="3"></line>
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    className="btn-black-compact"
                    onClick={() => setActiveModal('emi')}
                  >
                    <span>+ New Journey</span>
                  </button>
                </div>
              </div>

              {/* 4-CARD KEY METRICS ROW */}
              <section className="metrics-row-grid" aria-label="Key Financial Journey Metrics">
                
                {/* Metric 1 */}
                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-label">Financial Journey</span>
                    <span className="metric-arrow-badge">↗</span>
                  </div>
                  <div className="metric-value-group">
                    <span className="metric-main-value">72%</span>
                    <div className="metric-sub-delta">
                      <span className="metric-delta-tag tag-green">+12%</span>
                      <span>vs. Last Month</span>
                    </div>
                  </div>
                </article>

                {/* Metric 2 */}
                <article className="metric-card" onClick={() => setActiveModal('docs')} style={{ cursor: 'pointer' }}>
                  <div className="metric-card-top">
                    <span className="metric-label">Prepared</span>
                    <span className="metric-arrow-badge">↗</span>
                  </div>
                  <div className="metric-value-group">
                    <span className="metric-main-value">3 of 4 Ready</span>
                    <div className="metric-sub-delta">
                      <span className="metric-delta-tag tag-blue">75%</span>
                      <span>Documents Verified</span>
                    </div>
                  </div>
                </article>

                {/* Metric 3: Next Step (Opens EMI Modal) */}
                <article className="metric-card" onClick={() => setActiveModal('emi')} style={{ cursor: 'pointer' }}>
                  <div className="metric-card-top">
                    <span className="metric-label">Next Step</span>
                    <span className="metric-arrow-badge">↗</span>
                  </div>
                  <div className="metric-value-group">
                    <span className="metric-main-value">Review EMI</span>
                    <div className="metric-sub-delta">
                      <span className="metric-delta-tag tag-amber">Action</span>
                      <span>Home Loan comparison</span>
                    </div>
                  </div>
                </article>

                {/* Metric 4 */}
                <article className="metric-card">
                  <div className="metric-card-top">
                    <span className="metric-label">Active Journey</span>
                    <span className="metric-arrow-badge">↗</span>
                  </div>
                  <div className="metric-value-group">
                    <span className="metric-main-value">Home Buyer</span>
                    <div className="metric-sub-delta">
                      <span className="metric-delta-tag tag-green">On Track</span>
                      <span>Target Q3 2026</span>
                    </div>
                  </div>
                </article>

              </section>

              {/* VISUAL CENTERPIECE: YOUR FINANCIAL JOURNEY (5-STEP STEPPER) */}
              <section className="journey-centerpiece-card" id="journeyCenterpiece">
                <div className="journey-card-header">
                  <div className="journey-header-title-group">
                    <h2 className="journey-card-title">Your Financial Journey</h2>
                    <p className="journey-card-subtitle">AI-guided progress from initial understanding to final goal completion.</p>
                  </div>
                  <div className="journey-progress-pill">
                    <span className="progress-dot"></span>
                    <span>Active Step: {STEP_DETAILS[activeStep].num} {['Understand', 'Explore', 'Prepare', 'Navigate', 'Complete'][activeStep]}</span>
                  </div>
                </div>

                {/* 5-Step Stepper Track */}
                <div className="journey-stepper-track">
                  {['Understand', 'Explore', 'Prepare', 'Navigate', 'Complete'].map((stepName, idx) => (
                    <button 
                      key={idx}
                      type="button" 
                      className={`journey-step-btn ${activeStep === idx ? 'active-step' : ''}`}
                      onClick={() => setActiveStep(idx)}
                    >
                      <span className="step-num-badge">0{idx + 1}</span>
                      <span className="step-title-text">{stepName}</span>
                      <div className="step-status-bar">
                        <div 
                          className="step-status-fill" 
                          style={{ width: activeStep > idx ? '100%' : (activeStep === idx ? '65%' : '0%') }}
                        ></div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Dynamic Active Step Detail Card */}
                <div className="journey-step-detail-box">
                  <div className="step-detail-text-group">
                    <h3 className="step-detail-heading">
                      <span>{STEP_DETAILS[activeStep].title}</span>
                    </h3>
                    <p className="step-detail-paragraph">
                      {STEP_DETAILS[activeStep].desc}
                    </p>
                    <div className="step-detail-ai-tip">
                      <span className="tip-sparkle">✦</span>
                      <span>{STEP_DETAILS[activeStep].tip}</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-journey-action-black"
                    onClick={() => setActiveModal(STEP_DETAILS[activeStep].modal)}
                  >
                    <span>{STEP_DETAILS[activeStep].actionText}</span>
                    <span>→</span>
                  </button>
                </div>
              </section>

              {/* DUAL PERFORMANCE & MILESTONES SECTION */}
              <section className="dashboard-performance-grid">
                
                {/* Performance Chart Card */}
                <article className="performance-card">
                  <div className="performance-card-header">
                    <h3 className="performance-card-title">Performance Overview</h3>
                    <select className="performance-filter-select" aria-label="Select Time Range">
                      <option value="6m">6 months</option>
                      <option value="12m">12 months</option>
                    </select>
                  </div>

                  <div className="performance-chart-wrap">
                    <div className="chart-legend-row">
                      <div className="legend-item">
                        <span className="legend-box-black"></span>
                        <span>Target Milestone</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-box-gray"></span>
                        <span>Readiness Score</span>
                      </div>
                    </div>

                    <div className="bar-chart-bars-container">
                      {[
                        { month: 'Jan', black: 40, gray: 25 },
                        { month: 'Feb', black: 65, gray: 45 },
                        { month: 'Mar', black: 85, gray: 60 },
                        { month: 'Apr', black: 35, gray: 20 },
                        { month: 'May', black: 75, gray: 55 },
                        { month: 'Jun', black: 80, gray: 72 },
                      ].map((item, i) => (
                        <div key={i} className="chart-column-group">
                          <div className="bars-pair">
                            <div className="bar-rect-black" style={{ height: `${item.black}px` }}></div>
                            <div className="bar-rect-gray" style={{ height: `${item.gray}px` }}></div>
                          </div>
                          <span className="column-month-label">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>

                {/* Journey Milestones Card */}
                <article className="performance-card">
                  <div className="performance-card-header">
                    <h3 className="performance-card-title">Journey Milestones</h3>
                    <select className="performance-filter-select" aria-label="Select Filter">
                      <option value="active">Active Goals</option>
                      <option value="all">All Goals</option>
                    </select>
                  </div>

                  <div className="cohort-table-wrap">
                    <table className="cohort-table">
                      <thead>
                        <tr>
                          <th>Domain</th>
                          <th>Status</th>
                          <th>Readiness</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="strong-val">Home Loan</td>
                          <td><span className="metric-delta-tag tag-blue">In Review</span></td>
                          <td className="strong-val">88%</td>
                        </tr>
                        <tr>
                          <td className="strong-val">Health Cover</td>
                          <td><span className="metric-delta-tag tag-green">Verified</span></td>
                          <td className="strong-val">96%</td>
                        </tr>
                        <tr>
                          <td className="strong-val">DigiLocker KYC</td>
                          <td><span className="metric-delta-tag tag-green">Done</span></td>
                          <td className="strong-val">100%</td>
                        </tr>
                        <tr>
                          <td className="strong-val">Salary Proof</td>
                          <td><span className="metric-delta-tag tag-amber">Pending</span></td>
                          <td className="strong-val">75%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </article>

              </section>

              {/* ==============================================================
                   FLAGSHIP AI SCANNERS (LOANS & INSURANCE)
                   ============================================================== */}
              
              {/* AI LOAN FINDER SCANNER */}
              <div id="loan-scanner-widget">
                <LoanDocScanner />
              </div>

              {/* AI MEDICAL OCR FINDER SCANNER */}
              <div id="insurance-scanner-widget">
                <MedicalDocScanner />
              </div>

            </main>

            {/* ================================================================
                 RIGHT COLUMN: FINORA AI COMPANION & FINORA INSIGHTS
                 ================================================================ */}
            <aside className="dashboard-right-column" id="ai-companion">
              
              {/* Card 1: Finora AI */}
              <div className="ai-companion-card">
                <div className="ai-card-header">
                  <div className="ai-header-brand">
                    <div className="ai-sparkle-dot">✦</div>
                    <span className="ai-card-title">Finora AI</span>
                  </div>
                  <span className="ai-status-badge">
                    <span className="ai-status-pulse"></span>
                    <span>Online</span>
                  </span>
                </div>

                <div className="ai-dialogue-body">
                  {aiDialogue.map((msg, idx) => (
                    <div key={idx} className={msg.sender === 'ai' ? 'ai-msg-bubble' : 'user-msg-bubble'}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="ai-chips-container">
                  <span className="ai-chips-label">Quick Actions</span>
                  <div className="ai-chips-list">
                    <button type="button" className="ai-chip-pill" onClick={() => handleQuickAction('Explain a financial term')}>
                      <span>Explain a financial term</span>
                      <span className="chip-arrow">→</span>
                    </button>
                    <button type="button" className="ai-chip-pill" onClick={() => handleQuickAction('Explore loans')}>
                      <span>Explore loans</span>
                      <span className="chip-arrow">→</span>
                    </button>
                    <button type="button" className="ai-chip-pill" onClick={() => handleQuickAction('Understand insurance')}>
                      <span>Understand insurance</span>
                      <span className="chip-arrow">→</span>
                    </button>
                    <button type="button" className="ai-chip-pill" onClick={() => handleQuickAction('Explore fintech')}>
                      <span>Explore fintech</span>
                      <span className="chip-arrow">→</span>
                    </button>
                    <button type="button" className="ai-chip-pill" onClick={() => handleQuickAction('Help me prepare')}>
                      <span>Help me prepare</span>
                      <span className="chip-arrow">→</span>
                    </button>
                  </div>
                </div>

                <form className="ai-chat-input-form" onSubmit={handleAiSend}>
                  <input 
                    type="text" 
                    className="ai-chat-text-input" 
                    placeholder="Ask Finora AI..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                  <button type="submit" className="ai-send-btn-black" aria-label="Send query">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>

              {/* Card 2: Finora Insights */}
              <div className="insights-feed-card">
                <div className="insights-card-title">Finora Insights</div>
                
                <div className="insights-items-list">
                  
                  <div className="insight-item-row">
                    <div className="insight-icon-pill icon-amber">⚠️</div>
                    <div className="insight-content-group">
                      <span className="insight-heading">Understanding EMI</span>
                      <span className="insight-subtext">Signals up 18% interest awareness</span>
                      <a href="#loan-scanner-widget" className="insight-action-link">View details →</a>
                    </div>
                  </div>

                  <div className="insight-item-row">
                    <div className="insight-icon-pill icon-blue">🛡️</div>
                    <div className="insight-content-group">
                      <span className="insight-heading">Insurance Coverage Impact</span>
                      <span className="insight-subtext">Reported 42% explained</span>
                      <a href="#insurance-scanner-widget" className="insight-action-link">View guide →</a>
                    </div>
                  </div>

                  <div className="insight-item-row">
                    <div className="insight-icon-pill icon-amber">📋</div>
                    <div className="insight-content-group">
                      <span className="insight-heading">Documents You May Need</span>
                      <span className="insight-subtext">3 ready of 4 needed</span>
                      <button 
                        type="button" 
                        className="insight-action-link"
                        onClick={() => setActiveModal('docs')}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        Checklist →
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </aside>

          </div>

          {/* SITE FOOTER */}
          <footer className="dashboard-site-footer">
            <div className="footer-left-brand">
              <span className="footer-brand-title">Finora</span>
              <span>• Simpler Journeys. Brighter Futures.</span>
            </div>
            <div className="footer-nav-links">
              <a href="loan.html">Loans</a>
              <a href="insurance.html">Insurance</a>
              <a href="fintech.html">Fintech</a>
              <span>© 2026 Finora Inc.</span>
            </div>
          </footer>

        </div>
      </div>

      {/* ==================================================================
           INTERACTIVE MODALS
           ================================================================== */}

      {/* MODAL 1: INTERACTIVE EMI CALCULATOR */}
      {activeModal === 'emi' && (
        <div className="home-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="home-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="home-modal-header">
              <div className="home-modal-title-group">
                <div className="home-modal-icon-pill">🧮</div>
                <h3 className="home-modal-title">Interactive EMI Calculator</h3>
              </div>
              <button type="button" className="home-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="home-modal-body">
              <div className="calc-input-group">
                <div className="calc-label-row">
                  <span>Loan Amount</span>
                  <span className="calc-value-badge">₹{(calcAmount/100000).toFixed(2)} Lakhs</span>
                </div>
                <input 
                  type="range" 
                  min={50000} 
                  max={10000000} 
                  step={25000}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#111' }}
                />
              </div>

              <div className="calc-input-group">
                <div className="calc-label-row">
                  <span>Annual Interest Rate</span>
                  <span className="calc-value-badge">{calcRate}% p.a.</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={20} 
                  step={0.1}
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#111' }}
                />
              </div>

              <div className="calc-input-group">
                <div className="calc-label-row">
                  <span>Loan Tenure</span>
                  <span className="calc-value-badge">{calcTenure} Years ({calcTenure * 12} Mos)</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={30} 
                  step={1}
                  value={calcTenure}
                  onChange={(e) => setCalcTenure(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#111' }}
                />
              </div>

              <div className="calc-results-card">
                <div className="calc-emi-primary-display">
                  <span className="calc-emi-label">Estimated Monthly EMI</span>
                  <span className="calc-emi-amount">₹{emiStats.emi.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="calc-breakdown-row">
                  <span>Principal Amount:</span>
                  <span className="calc-breakdown-value">₹{calcAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span>Total Interest Payable:</span>
                  <span className="calc-breakdown-value" style={{ color: '#0066FF' }}>
                    ₹{emiStats.totalInterest.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="calc-breakdown-row">
                  <span>Total Loan Repayment:</span>
                  <span className="calc-breakdown-value">
                    ₹{emiStats.totalPayment.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="calc-disclaimer-note">
                  Standard reducing balance formula. Prepayment without penalty is available on floating rate home loans.
                </p>
              </div>

              <button 
                type="button" 
                className="btn-cta-full"
                onClick={() => {
                  setActiveModal(null);
                  document.getElementById('loan-scanner-widget')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Find Lowest Rate Lenders in AI Scanner →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ELIGIBILITY ASSESSMENT GUIDE */}
      {activeModal === 'eligibility' && (
        <div className="home-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="home-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="home-modal-header">
              <div className="home-modal-title-group">
                <div className="home-modal-icon-pill">📊</div>
                <h3 className="home-modal-title">Eligibility Assessment Guide</h3>
              </div>
              <button type="button" className="home-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="home-modal-body">
              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">1. Credit Score (CIBIL 750+)</h4>
                <p className="home-modal-sec-desc">Demonstrates disciplined repayment behavior and unlocks super-prime interest rates (8.40% vs 9.50%+).</p>
              </div>

              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">2. Fixed Obligation to Income Ratio (FOIR)</h4>
                <p className="home-modal-sec-desc">Lenders cap your total monthly EMIs (existing debt + new loan) at 50% to 65% of net in-hand monthly salary.</p>
              </div>

              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">3. Employment Stability & Tier</h4>
                <p className="home-modal-sec-desc">Top-tier corporate employees (TCS, Google, Infosys, Big-4) and government officers receive instant processing fee waivers.</p>
              </div>

              <button 
                type="button" 
                className="btn-cta-full"
                onClick={() => {
                  setActiveModal(null);
                  document.getElementById('loan-scanner-widget')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Scan Payslip to Check Exact FOIR Limit →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DOCUMENT CHECKLIST */}
      {activeModal === 'docs' && (
        <div className="home-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="home-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="home-modal-header">
              <div className="home-modal-title-group">
                <div className="home-modal-icon-pill">📋</div>
                <h3 className="home-modal-title">Required Document Checklist</h3>
              </div>
              <button type="button" className="home-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="home-modal-body">
              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">Identity & Address (DigiLocker Verified)</h4>
                <p className="home-modal-sec-desc">✓ PAN Card (Mandatory for tax verification), Aadhaar XML, Passport or Driving License.</p>
              </div>

              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">Income & Banking Records</h4>
                <p className="home-modal-sec-desc">✓ Last 3 months Salary Slips, Form 16 (Part A & B), and 6 months operative salary bank statement.</p>
              </div>

              <div className="home-modal-box">
                <h4 className="home-modal-sec-title">Health / Medical Records (For Insurance)</h4>
                <p className="home-modal-sec-desc">✓ Doctor Certificate, diagnosis summary, or prescription indicating pre-existing conditions for accurate policy matching.</p>
              </div>

              <button 
                type="button" 
                className="btn-cta-full"
                onClick={() => {
                  setActiveModal(null);
                  document.getElementById('insurance-scanner-widget')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Upload Medical Document in AI Scanner →</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
