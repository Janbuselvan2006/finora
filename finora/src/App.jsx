import React, { useState } from 'react';
import FirebaseStatus from './components/FirebaseStatus';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [heroAiInput, setHeroAiInput] = useState('');
  const [heroAiDialogue, setHeroAiDialogue] = useState(
    "Hi! I'm Finora AI 👋 Tell me what you're trying to accomplish, and I'll guide you through the right financial journey."
  );

  // AI Guidance preview scenario state
  const [activeScenario, setActiveScenario] = useState('home-loan');

  const scenarioData = {
    'home-loan': {
      user: "What documents do I need for a home loan, and how is eligibility evaluated?",
      greeting: "Here is a simplified breakdown of the Home Loan journey:",
      body: "Eligibility is typically assessed using your stable monthly income, credit profile (CIBIL/Equifax), and existing debt obligations (FOIR). Essential documents usually include: 1) Proof of Identity & Residence, 2) Last 3-6 months' salary slips or ITR for self-employed, 3) 6 months' bank statements, and 4) Property chain documents."
    },
    'insurance-compare': {
      user: "What's the fundamental difference between Term Life Insurance and Health Insurance?",
      greeting: "Clear comparison of both coverage types:",
      body: "• Term Insurance provides financial protection to your nominees in the event of unforeseen loss of life during the policy period.\n• Health Insurance reimburses or cashless-settles hospitalization, medical treatments, and critical illness expenses during your lifetime. Both serve complementary protective roles in your financial plan."
    },
    'kyc-verification': {
      user: "Why is Digital KYC necessary, and what is DigiLocker verification?",
      greeting: "Here's how secure digital onboarding works:",
      body: "Digital KYC allows regulated financial institutions to verify customer identity seamlessly and prevent identity theft. DigiLocker enables government-verified instant credential sharing (such as Aadhaar XML or PAN verification) without needing to submit physical paper photocopies."
    }
  };

  const handleQuickAction = (actionText) => {
    setHeroAiDialogue(`Let's explore "${actionText}". I'll break down the requirements and next milestones for you.`);
  };

  const handleHeroAiSubmit = (e) => {
    e.preventDefault();
    if (!heroAiInput.trim()) return;
    setHeroAiDialogue(`Understood: "${heroAiInput}". I'm organizing the journey steps and guidelines for this topic.`);
    setHeroAiInput('');
  };

  return (
    <div className="app-container">
      {/* GLOBAL HEADER */}
      <header className="top-header" role="banner">
        <div className="header-inner">
          <a href="#" className="brand-wrapper" aria-label="Finora Home">
            <svg className="brand-icon" viewBox="0 0 40 40" width="36" height="36" fill="none">
              <path d="M12 28C17.5228 28 22 23.5228 22 18C22 12.4772 17.5228 8 12 8C6.47715 8 2 12.4772 2 18C2 23.5228 6.47715 28 12 28Z" fill="url(#brandGrad1)"/>
              <path d="M26 32C31.5228 32 36 27.5228 36 22C36 16.4772 31.5228 12 26 12C20.4772 12 16 16.4772 16 22C16 27.5228 20.4772 32 26 32Z" fill="url(#brandGrad2)" fillOpacity="0.9"/>
              <defs>
                <linearGradient id="brandGrad1" x1="2" y1="8" x2="22" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563EB"/>
                  <stop offset="1" stopColor="#1D4ED8"/>
                </linearGradient>
                <linearGradient id="brandGrad2" x1="16" y1="12" x2="36" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06B6D4"/>
                  <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="brand-text-group">
              <span className="brand-name">Finora</span>
              <span className="brand-tagline">Simpler Journeys. Brighter Futures.</span>
            </div>
          </a>

          <nav className="nav-links" aria-label="Primary Navigation">
            <button className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
            <a href="loan.html" className="nav-link">Loans & Products</a>
            <button className={`nav-link ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>AI Assistant</button>
            <button className={`nav-link ${activeTab === 'db' ? 'active' : ''}`} onClick={() => setActiveTab('db')}>Database Demo</button>
          </nav>

          <div className="header-actions">
            <div className="header-search">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6"></circle>
                  <line x1="18" y1="18" x2="13.5" y2="13.5"></line>
                </svg>
                <input type="search" className="search-input" placeholder="Search financial topics..." />
                <span className="search-shortcut">Ctrl K</span>
              </div>
            </div>

            <button className="btn-icon" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="notification-badge"></span>
            </button>

            <div className="user-profile-badge">
              <div className="avatar-circle">BB</div>
              <div className="user-details">
                <span className="user-greeting">Welcome</span>
                <span className="user-name">Brightlin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <a href="#home" className="sidebar-link active">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span>Home</span>
            </a>
            <a href="loan.html" className="sidebar-link">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polyline points="5 6 12 3 19 6"></polyline>
              </svg>
              <span>Loans</span>
            </a>
            <a href="insurance.html" className="sidebar-link">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Insurance</span>
            </a>
            <a href="#goals" className="sidebar-link">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              </svg>
              <span>Fintech</span>
            </a>
            <a href="#ai-assistant" className="sidebar-link">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>AI Assistant</span>
            </a>
          </nav>

          <div className="sidebar-quote-card">
            <p className="sidebar-quote-text">“Finance should empower people, not confuse them.”</p>
            <p className="sidebar-quote-subtext">Build a more inclusive financial future.</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {/* SECTION 1: HERO */}
          <section className="hero-section" id="home">
            <div className="hero-bg-glow"></div>
            <div className="hero-grid-pattern"></div>

            <div className="hero-content-grid">
              <div className="hero-left">
                <div className="eyebrow-pill pill-dark">
                  ✨ AI-POWERED FINANCIAL JOURNEYS
                </div>
                <h1 className="hero-heading">
                  Your Financial Goals,<br />
                  <span className="hero-accent-text">Powered by AI Guidance.</span>
                </h1>
                <p className="hero-description">
                  Explore, understand and navigate financial services through a simpler, more guided experience — all in one place.
                </p>

                <div className="hero-actions">
                  <a href="#ai-assistant" className="btn btn-hero-glow">
                    Start Your Journey →
                  </a>
                  <a href="#how-it-works" className="btn btn-secondary-glass">
                    Explore How It Works
                  </a>
                </div>

                <div className="hero-metrics-pill-grid">
                  <div className="hero-metric-item">
                    <div className="hero-metric-icon-wrap">👥</div>
                    <div className="hero-metric-text">
                      <span className="hero-metric-value">1M+</span>
                      <span className="hero-metric-label">People Guided</span>
                    </div>
                  </div>

                  <div className="hero-metric-item">
                    <div className="hero-metric-icon-wrap">⚡</div>
                    <div className="hero-metric-text">
                      <span className="hero-metric-value">70%</span>
                      <span className="hero-metric-label">Faster Clarity</span>
                    </div>
                  </div>

                  <div className="hero-metric-item">
                    <div className="hero-metric-icon-wrap">🎯</div>
                    <div className="hero-metric-text">
                      <span className="hero-metric-value">Informed</span>
                      <span className="hero-metric-label">Decisions</span>
                    </div>
                  </div>

                  <div className="hero-metric-item">
                    <div className="hero-metric-icon-wrap">🛡️</div>
                    <div className="hero-metric-text">
                      <span className="hero-metric-value">Trusted</span>
                      <span className="hero-metric-label">& Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-ai-card">
                  <div className="hero-ai-header">
                    <div className="hero-ai-brand">
                      <div className="ai-sparkle-badge">✨</div>
                      <span className="hero-ai-title">Finora AI</span>
                    </div>
                    <div className="hero-ai-status">
                      <span className="status-dot-pulse"></span>
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="hero-ai-dialogue">
                    <p className="ai-message-text">{heroAiDialogue}</p>
                    <span className="ai-message-subtitle">Interactive journey companion</span>
                  </div>

                  <div className="hero-ai-chips-group">
                    <span className="chips-label">Quick actions:</span>
                    <div className="chips-container">
                      <button className="ai-chip" onClick={() => handleQuickAction('I need a loan')}>🏦 I need a loan</button>
                      <button className="ai-chip" onClick={() => handleQuickAction('I want insurance')}>🛡️ I want insurance</button>
                      <button className="ai-chip" onClick={() => handleQuickAction('Financial question')}>💬 Have a question</button>
                    </div>
                  </div>

                  <form className="hero-ai-input-form" onSubmit={handleHeroAiSubmit}>
                    <input
                      type="text"
                      className="hero-ai-input"
                      placeholder="Type what you're trying to do..."
                      value={heroAiInput}
                      onChange={(e) => setHeroAiInput(e.target.value)}
                    />
                    <button type="submit" className="btn-send-mini">➔</button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: GOAL CARDS */}
          <section className="goals-section" id="goals">
            <div className="section-header">
              <div className="eyebrow-pill pill-light">GOAL-BASED DISCOVERY</div>
              <h2 className="section-title">Start with your goal.</h2>
              <p className="section-subtitle">
                You don't need to know the financial product first. Just tell us what you're trying to accomplish.
              </p>
            </div>

            <div className="goal-cards-grid">
              {/* LOANS */}
              <article className="goal-card goal-card-loans">
                <div className="goal-card-top">
                  <div className="goal-card-icon-wrap icon-loans">🏦</div>
                  <div className="goal-card-arrow-badge">➔</div>
                </div>
                <div className="goal-card-body">
                  <h3 className="goal-card-title">Loans</h3>
                  <p className="goal-card-description">
                    Understand loan journeys, eligibility information, documentation and repayment concepts.
                  </p>
                  <div className="goal-card-checklist">
                    <div className="checklist-item"><span className="icon-check-blue">✓</span> Loan eligibility check</div>
                    <div className="checklist-item"><span className="icon-check-blue">✓</span> Application guidance</div>
                    <div className="checklist-item"><span className="icon-check-blue">✓</span> Document assistance</div>
                  </div>
                </div>
                <div className="goal-card-footer">
                  <a href="loan.html" className="goal-card-cta cta-loans">Explore Loans →</a>
                </div>
              </article>

              {/* INSURANCE */}
              <article className="goal-card goal-card-insurance">
                <div className="goal-card-top">
                  <div className="goal-card-icon-wrap icon-insurance">🛡️</div>
                  <div className="goal-card-arrow-badge">➔</div>
                </div>
                <div className="goal-card-body">
                  <h3 className="goal-card-title">Insurance</h3>
                  <p className="goal-card-description">
                    Understand coverage, policy terms, claims and the steps involved in an insurance journey.
                  </p>
                  <div className="goal-card-checklist">
                    <div className="checklist-item"><span className="icon-check-green">✓</span> Policy recommendations</div>
                    <div className="checklist-item"><span className="icon-check-green">✓</span> Simplified explanations</div>
                    <div className="checklist-item"><span className="icon-check-green">✓</span> Coverage comparison</div>
                  </div>
                </div>
                <div className="goal-card-footer">
                  <a href="insurance.html" className="goal-card-cta cta-insurance">Explore Insurance →</a>
                </div>
              </article>

              {/* FINTECH */}
              <article className="goal-card goal-card-fintech">
                <div className="goal-card-top">
                  <div className="goal-card-icon-wrap icon-fintech">💳</div>
                  <div className="goal-card-arrow-badge">➔</div>
                </div>
                <div className="goal-card-body">
                  <h3 className="goal-card-title">Fintech</h3>
                  <p className="goal-card-description">
                    Explore digital financial services, onboarding, KYC, payments and financial tools.
                  </p>
                  <div className="goal-card-checklist">
                    <div className="checklist-item"><span className="icon-check-purple">✓</span> Account onboarding</div>
                    <div className="checklist-item"><span className="icon-check-purple">✓</span> KYC support</div>
                    <div className="checklist-item"><span className="icon-check-purple">✓</span> Payment solutions</div>
                  </div>
                </div>
                <div className="goal-card-footer">
                  <a href="#ai-assistant" className="goal-card-cta cta-fintech">Explore Fintech →</a>
                </div>
              </article>
            </div>
          </section>

          {/* SECTION 3: AI GUIDANCE INTERVIEW PREVIEW */}
          <section className="ai-guidance-section" id="ai-assistant">
            <div className="section-header">
              <div className="eyebrow-pill pill-light">INTELLIGENT COMPANION</div>
              <h2 className="section-title">Financial questions shouldn't feel complicated.</h2>
              <p className="section-subtitle">
                Finora AI helps users understand financial concepts, navigate processes and identify the next step.
              </p>
            </div>

            <div className="ai-preview-container">
              <div className="ai-preview-sidebar">
                <div className="ai-preview-brand-block">
                  <div className="ai-avatar-large">✨</div>
                  <div>
                    <h3 className="ai-preview-brand-title">Finora AI</h3>
                    <p className="ai-preview-brand-desc">Your financial journey companion</p>
                  </div>
                </div>

                <div className="ai-scenarios-list">
                  <span className="scenario-label">Try interactive scenarios:</span>
                  <button
                    className={`scenario-btn ${activeScenario === 'home-loan' ? 'active' : ''}`}
                    onClick={() => setActiveScenario('home-loan')}
                  >
                    <span>Home Loan Eligibility</span> ➔
                  </button>
                  <button
                    className={`scenario-btn ${activeScenario === 'insurance-compare' ? 'active' : ''}`}
                    onClick={() => setActiveScenario('insurance-compare')}
                  >
                    <span>Term vs Health Insurance</span> ➔
                  </button>
                  <button
                    className={`scenario-btn ${activeScenario === 'kyc-verification' ? 'active' : ''}`}
                    onClick={() => setActiveScenario('kyc-verification')}
                  >
                    <span>Digital KYC & Verification</span> ➔
                  </button>
                </div>
              </div>

              <div className="ai-preview-chat-pane">
                <div className="chat-message-stream">
                  <div className="chat-bubble chat-bubble-user">
                    <div className="chat-avatar-mini avatar-user-mini">You</div>
                    <div className="chat-bubble-content">
                      <p className="chat-text">{scenarioData[activeScenario].user}</p>
                    </div>
                  </div>

                  <div className="chat-bubble chat-bubble-ai">
                    <div className="chat-avatar-mini avatar-ai-mini">✨</div>
                    <div className="chat-bubble-content">
                      <div className="chat-greeting">{scenarioData[activeScenario].greeting}</div>
                      <p className="chat-text">{scenarioData[activeScenario].body}</p>
                    </div>
                  </div>
                </div>

                <div className="ai-disclaimer-box">
                  <span className="disclaimer-icon">ℹ️</span>
                  <p className="disclaimer-text">
                    AI guidance is informational and does not replace advice from regulated financial institutions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: FIREBASE DATABASE STATUS & INTERACTIVE COMPONENT */}
          <section id="database">
            <FirebaseStatus />
          </section>

          {/* SECTION 5: HOW IT WORKS */}
          <section className="how-it-works-section" id="how-it-works">
            <div className="section-header centered">
              <div className="eyebrow-pill pill-light">SEAMLESS WORKFLOW</div>
              <h2 className="section-title">One journey. Less friction.</h2>
              <p className="section-subtitle">
                From confusion to clarity in five guided, human-centered steps.
              </p>
            </div>

            <div className="journey-timeline-wrapper">
              <div className="journey-track-line"></div>
              <div className="journey-steps-grid">
                <div className="journey-step-card">
                  <div className="step-node-badge">01</div>
                  <h3 className="step-title">Discover</h3>
                  <p className="step-description">Tell us what you need and what goal you want to achieve.</p>
                </div>
                <div className="journey-step-card">
                  <div className="step-node-badge">02</div>
                  <h3 className="step-title">Understand</h3>
                  <p className="step-description">Get simple, jargon-free explanations tailored to your context.</p>
                </div>
                <div className="journey-step-card">
                  <div className="step-node-badge">03</div>
                  <h3 className="step-title">Prepare</h3>
                  <p className="step-description">Know what information and documents may be needed in advance.</p>
                </div>
                <div className="journey-step-card">
                  <div className="step-node-badge">04</div>
                  <h3 className="step-title">Navigate</h3>
                  <p className="step-description">Move through the process with step-by-step guided assistance.</p>
                </div>
                <div className="journey-step-card">
                  <div className="step-node-badge">05</div>
                  <h3 className="step-title">Complete</h3>
                  <p className="step-description">Understand what's next and track your milestones with clarity.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 Finora Inc. All rights reserved.</p>
            <div className="footer-prototype-tag">
              <span className="prototype-pulse-dot"></span> Finora AI Prototype
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
