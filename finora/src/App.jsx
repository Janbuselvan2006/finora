import React, { useState, useEffect, useRef } from 'react';
import LoanDocScanner from './components/LoanDocScanner';
import MedicalDocScanner from './components/MedicalDocScanner';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

// Brand Logo Component with Finora Two-Circle Brand (as in reference pic)
function FinoraBrandLogo() {
  return (
    <svg className="sidebar-brand-svg" viewBox="0 0 40 40" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Finora Brand Logo">
      <path d="M12 28C17.5228 28 22 23.5228 22 18C22 12.4772 17.5228 8 12 8C6.47715 8 2 12.4772 2 18C2 23.5228 6.47715 28 12 28Z" fill="url(#finoraBrandGrad1)"/>
      <path d="M26 32C31.5228 32 36 27.5228 36 22C36 16.4772 31.5228 12 26 12C20.4772 12 16 16.4772 16 22C16 27.5228 20.4772 32 26 32Z" fill="url(#finoraBrandGrad2)" fillOpacity="0.9"/>
      <defs>
        <linearGradient id="finoraBrandGrad1" x1="2" y1="8" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB"/>
          <stop offset="1" stopColor="#1D4ED8"/>
        </linearGradient>
        <linearGradient id="finoraBrandGrad2" x1="16" y1="12" x2="36" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06B6D4"/>
          <stop offset="1" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'loans', 'insurance', 'fintech'
  const [activeStep, setActiveStep] = useState(2); // 0-indexed, 2 = 03 Prepare
  const [activeModal, setActiveModal] = useState(null); // 'emi', 'eligibility', 'docs', null
  const [searchQuery, setSearchQuery] = useState('');
  
  // Finora AI WhatsApp Chat State & Audio Effects
  const [aiDialogue, setAiDialogue] = useState([
    {
      sender: 'ai',
      text: "Hi, I'm Finora AI 👋 What financial journey are you trying to understand?",
      time: '12:00 PM',
      status: 'read'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showWaMenu, setShowWaMenu] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);

  // Soft Web Audio synthesizers for authentic WhatsApp feedback
  const playWaSendSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (_) {}
  };

  const playWaReceiveSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1040, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  };

  // Auto-scroll chat body on message change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [aiDialogue, isAiTyping]);

  // Speech-to-text for WhatsApp mic
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message in the chat input.');
      return;
    }

    if (isListeningMic) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListeningMic(true);
      };

      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setAiInput(text);
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListeningMic(false);
    }
  };

  // Interactive EMI Calculator State for Modal
  const [calcAmount, setCalcAmount] = useState(500000);
  const [calcRate, setCalcRate] = useState(8.5);
  const [calcTenure, setCalcTenure] = useState(5);

  // Sync theme attribute to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync URL hash / pathname to current view
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('loan') || hash.includes('loan')) {
        setCurrentView('loans');
      } else if (path.includes('insurance') || hash.includes('insurance')) {
        setCurrentView('insurance');
      } else if (path.includes('fintech') || hash.includes('fintech')) {
        setCurrentView('fintech');
      } else {
        setCurrentView('dashboard');
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      window.history.pushState(null, '', '/');
    } else {
      window.history.pushState(null, '', `#${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (e && e.preventDefault) e.preventDefault();
    if (!aiInput.trim()) return;
    
    const userText = aiInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiDialogue(prev => [...prev, { sender: 'user', text: userText, time: nowTime, status: 'read' }]);
    setAiInput('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    playWaSendSound();
    setIsAiTyping(true);

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

      setAiDialogue(prev => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsAiTyping(false);
      playWaReceiveSound();
    }, 750);
  };

  const handleQuickAction = (text) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiDialogue(prev => [
      ...prev,
      { sender: 'user', text, time: nowTime, status: 'read' }
    ]);
    playWaSendSound();
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = `Analyzing "${text}"... Let's review the required documents and lowest cost options tailored to your profile.`;
      const lower = text.toLowerCase();
      if (lower.includes('foir')) {
        reply = "FOIR (Fixed Obligation to Income Ratio) is the percentage of your monthly income that goes toward EMIs. Banks prefer FOIR under 50% for maximum loan eligibility.";
      } else if (lower.includes('floating')) {
        reply = "Floating loans allow zero-penalty prepayment at any time as mandated by the RBI, making them ideal if you plan to prepay early!";
      } else if (lower.includes('co-pay')) {
        reply = "Co-Pay is the percentage of hospital claim cost you agree to pay from your pocket, while the insurer pays the rest. Lower co-pay means higher coverage!";
      } else if (lower.includes('waiting')) {
        reply = "Pre-existing disease waiting periods typically range from 2 to 4 years. With Finora, we help you find policies with 1-year reduced waiting riders!";
      } else if (lower.includes('restore')) {
        reply = "100% Restore Benefit recharges your sum insured back to full value if exhausted during hospitalizations in the same policy year!";
      }

      setAiDialogue(prev => [
        ...prev,
        { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setIsAiTyping(false);
      playWaReceiveSound();
    }, 650);
  };

  return (
    <div className="app-container">
      <div className="dashboard-viewport">
        
        {/* ==================================================================
             LEFT FLOATING SIDEBAR DOCK (Reference Cilo Inspired + Finora Brand Logo)
             ================================================================== */}
        <aside className="sidebar-dock" aria-label="Finora Main Navigation">
          <button 
            type="button" 
            className="sidebar-logo-pill" 
            aria-label="Finora Home" 
            onClick={() => navigateTo('dashboard')}
            title="Finora Home Overview"
          >
            <FinoraBrandLogo />
          </button>

          <nav className="sidebar-nav-container" aria-label="Platform Views">
            {/* Dashboard Overview */}
            <button 
              type="button" 
              className={`sidebar-btn ${currentView === 'dashboard' ? 'active' : ''}`}
              data-tooltip="Dashboard Overview"
              aria-label="Home Overview"
              onClick={() => navigateTo('dashboard')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
            </button>

            {/* Loans Journey */}
            <button 
              type="button" 
              className={`sidebar-btn ${currentView === 'loans' ? 'active' : ''}`}
              data-tooltip="Loans Journey" 
              aria-label="Loans"
              onClick={() => navigateTo('loans')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="3" y1="21" x2="21" y2="21"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <polyline points="5 6 12 3 19 6"></polyline>
                <line x1="6" y1="10" x2="6" y2="21"></line>
                <line x1="10" y1="10" x2="10" y2="21"></line>
                <line x1="14" y1="10" x2="14" y2="21"></line>
                <line x1="18" y1="10" x2="18" y2="21"></line>
              </svg>
            </button>

            {/* Insurance Journey */}
            <button 
              type="button" 
              className={`sidebar-btn ${currentView === 'insurance' ? 'active' : ''}`}
              data-tooltip="Insurance Journey" 
              aria-label="Insurance"
              onClick={() => navigateTo('insurance')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </button>

            {/* Fintech Services */}
            <button 
              type="button" 
              className={`sidebar-btn ${currentView === 'fintech' ? 'active' : ''}`}
              data-tooltip="Fintech Services" 
              aria-label="Fintech"
              onClick={() => navigateTo('fintech')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </button>

            {/* Finora AI Copilot */}
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
                  placeholder={
                    currentView === 'loans' ? "Search home loans, rates, FOIR calculators, bank offers..." :
                    currentView === 'insurance' ? "Search health plans, waiting periods, disease coverage..." :
                    currentView === 'fintech' ? "Search digital KYC, payment protocols, APIs, sandbox..." :
                    "Search financial topics, products or your questions..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search Finora"
                />
                <span className="search-shortcut-badge">⌘K</span>
              </div>
            </div>

            <div className="header-right-actions">
              {/* Advisor Avatar Stack */}
              <div className="team-avatar-pill">
                <div className="avatar-stack">
                  <div className="avatar-img-sm" style={{ background: '#E2E8F0' }}>👨‍💼</div>
                  <div className="avatar-img-sm" style={{ background: '#CBD5E1' }}>👩‍💼</div>
                </div>
                <span className="avatar-more-count">+2</span>
              </div>

              {/* Theme Switcher */}
              <div className="theme-pill-toggle">
                <button 
                  type="button" 
                  className={`theme-mode-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  aria-label="Light Mode"
                >
                  ☀️
                </button>
                <button 
                  type="button" 
                  className={`theme-mode-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  aria-label="Dark Mode"
                >
                  🌙
                </button>
              </div>

              {/* Notification Icon */}
              <button 
                type="button" 
                className="header-icon-pill" 
                aria-label="Notifications"
                onClick={() => alert('Finora Alert: 1 new pre-approved home loan offer from SBI at 8.40% p.a.')}
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
                onClick={() => {
                  if (currentView === 'loans') {
                    const el = document.getElementById('loan-scanner-widget');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else if (currentView === 'insurance') {
                    const el = document.getElementById('insurance-scanner-widget');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveModal('emi');
                  }
                }}
              >
                <span>
                  {currentView === 'loans' ? 'Find Lenders' :
                   currentView === 'insurance' ? 'Scan Certificate' :
                   currentView === 'fintech' ? 'Explore APIs' :
                   'Start Journey'}
                </span>
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
                    <span>
                      {currentView === 'loans' ? '💰' :
                       currentView === 'insurance' ? '🛡️' :
                       currentView === 'fintech' ? '💳' :
                       '👋'}
                    </span>
                    <span>
                      {currentView === 'loans' ? 'Credit & Borrowing Journey' :
                       currentView === 'insurance' ? 'Protection & Wellness' :
                       currentView === 'fintech' ? 'Digital Banking & Infrastructure' :
                       'Good morning, Brightlin'}
                    </span>
                  </div>
                  <h1 className="dashboard-page-title">
                    {currentView === 'loans' ? 'Loans Journey' :
                     currentView === 'insurance' ? 'Insurance Journey' :
                     currentView === 'fintech' ? 'Fintech Services' :
                     'Finora Overview'}
                  </h1>
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
                    onClick={() => {
                      if (currentView === 'loans') {
                        const el = document.getElementById('loan-scanner-widget');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else if (currentView === 'insurance') {
                        const el = document.getElementById('insurance-scanner-widget');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setActiveModal('emi');
                      }
                    }}
                  >
                    <span>
                      {currentView === 'loans' ? '+ AI Salary Scan' :
                       currentView === 'insurance' ? '+ AI Medical Scan' :
                       currentView === 'fintech' ? '+ API Playground' :
                       '+ New Journey'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 4-CARD KEY METRICS ROW */}
              {currentView === 'loans' ? (
                <section className="metrics-row-grid" aria-label="Key Loan Metrics">
                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Max Borrowing Power</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">₹85.0 Lakhs</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">Tier-1 MNC</span>
                        <span>CIBIL 790</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Lowest Benchmark ROI</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">8.40% p.a.</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-blue">SBI Repo EBLR</span>
                        <span>Nil Prepay</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Assessed FOIR Debt</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">28.4% Ratio</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">Safe &lt; 50%</span>
                        <span>₹2,000 Existing EMI</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Target Config</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">₹45L / 20 Yrs</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-amber">Home Loan</span>
                        <span>₹38,767/mo</span>
                      </div>
                    </div>
                  </article>
                </section>
              ) : currentView === 'insurance' ? (
                <section className="metrics-row-grid" aria-label="Key Insurance Metrics">
                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Active Coverage</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">₹25.0 Lakhs</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">100% Restore</span>
                        <span>Zero Co-Pay</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Claim Settlement</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">98.2% Ratio</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-blue">Verified</span>
                        <span>IRDAI Compliant</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">PED Waiting Period</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">12 Months</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-amber">Day-1 Rider</span>
                        <span>Metabolic Cover</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">AI Best Fit Match</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">Care Supreme</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">98% Match</span>
                        <span>₹1,250/mo</span>
                      </div>
                    </div>
                  </article>
                </section>
              ) : currentView === 'fintech' ? (
                <section className="metrics-row-grid" aria-label="Key Fintech Metrics">
                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Digital KYC Throughput</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">99.4% Pass</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">DigiLocker</span>
                        <span>UIDAI Verified</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Payment Latency</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">&lt; 1.2 Sec</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-blue">UPI 2.0</span>
                        <span>e-NACH AutoPay</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Security Architecture</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">256-Bit AES</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-green">Account Aggregator</span>
                        <span>ISO 27001</span>
                      </div>
                    </div>
                  </article>

                  <article className="metric-card">
                    <div className="metric-card-top">
                      <span className="metric-label">Banking Connectors</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">45+ Banks</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-amber">Real-Time</span>
                        <span>Webhook Active</span>
                      </div>
                    </div>
                  </article>
                </section>
              ) : (
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
                        <span className="metric-delta-tag tag-green">75% Verified</span>
                        <span>Docs Complete</span>
                      </div>
                    </div>
                  </article>

                  {/* Metric 3 */}
                  <article className="metric-card" onClick={() => setActiveModal('emi')} style={{ cursor: 'pointer' }}>
                    <div className="metric-card-top">
                      <span className="metric-label">Next Step</span>
                      <span className="metric-arrow-badge">↗</span>
                    </div>
                    <div className="metric-value-group">
                      <span className="metric-main-value">Review EMI</span>
                      <div className="metric-sub-delta">
                        <span className="metric-delta-tag tag-blue">Action</span>
                        <span>Home Loan</span>
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
                        <span className="metric-delta-tag tag-amber">On Track</span>
                        <span>Target Q3 2026</span>
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {/* 5-STEP PROCESS STEPPER CENTERPIECE */}
              <section className="journey-stepper-card" aria-label="Finora Step Progression">
                <div className="stepper-header-row">
                  <div>
                    <span className="stepper-title">
                      {currentView === 'loans' ? '5-Step Loan Journey' :
                       currentView === 'insurance' ? '5-Step Insurance Journey' :
                       currentView === 'fintech' ? '5-Step Seamless Onboarding' :
                       'Your Financial Journey'}
                    </span>
                    <p className="stepper-subtext">
                      {currentView === 'loans' ? 'Clear, step-by-step guidance from salary verification to instant in-principle sanction.' :
                       currentView === 'insurance' ? 'Demystify medical terminology, compare pre-existing waiting periods, and secure coverage.' :
                       currentView === 'fintech' ? 'Zero paperwork journey: from digital identity verification to active banking workflows.' :
                       'A structured, transparent roadmap from discovering goals to completing milestones.'}
                    </p>
                  </div>
                  <span className="step-counter-pill">Step {activeStep + 1} of 5 Active</span>
                </div>

                <div className="stepper-steps-track">
                  {[
                    { num: '01', name: currentView === 'fintech' ? 'Identity' : 'Understand', desc: currentView === 'loans' ? 'Income & FOIR' : currentView === 'insurance' ? 'Pre-Existing PED' : currentView === 'fintech' ? 'e-KYC DigiLocker' : 'Goals & Needs' },
                    { num: '02', name: currentView === 'fintech' ? 'Consent' : 'Explore', desc: currentView === 'loans' ? 'Lender Matrix' : currentView === 'insurance' ? 'Policy Comparison' : currentView === 'fintech' ? 'Account Aggregator' : 'Options & ROI' },
                    { num: '03', name: currentView === 'fintech' ? 'Mandate' : 'Prepare', desc: currentView === 'loans' ? 'Payslip & ITR' : currentView === 'insurance' ? 'Medical Certificates' : currentView === 'fintech' ? 'UPI AutoPay' : 'Docs & Readiness' },
                    { num: '04', name: currentView === 'fintech' ? 'Verify' : 'Navigate', desc: currentView === 'loans' ? 'Sanction Letter' : currentView === 'insurance' ? 'Underwriting' : currentView === 'fintech' ? 'Penny Drop Test' : 'Digital Onboarding' },
                    { num: '05', name: currentView === 'fintech' ? 'Activated' : 'Complete', desc: currentView === 'loans' ? 'Disbursal' : currentView === 'insurance' ? 'Policy Issued' : currentView === 'fintech' ? 'Live Transacting' : 'Milestone Achieved' },
                  ].map((step, idx) => (
                    <div 
                      key={idx}
                      className={`stepper-step ${activeStep === idx ? 'active' : ''}`}
                      onClick={() => setActiveStep(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Step ${step.num}: ${step.name}`}
                    >
                      <div className="step-indicator">
                        <span className="step-num">{step.num}</span>
                      </div>
                      <div className="step-text-wrap">
                        <span className="step-name">{step.name}</span>
                        <span className="step-desc">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Step Details Expansion */}
                <div className="stepper-active-card">
                  <div className="stepper-card-content">
                    <div className="stepper-card-badge">Current Focus</div>
                    <h3 className="stepper-card-title">{STEP_DETAILS[activeStep].title}</h3>
                    <p className="stepper-card-desc">{STEP_DETAILS[activeStep].desc}</p>
                    <div className="stepper-ai-tip">
                      <span className="tip-sparkle">💡</span>
                      <span>{STEP_DETAILS[activeStep].tip}</span>
                    </div>
                  </div>
                  <div className="stepper-card-cta">
                    <button 
                      type="button" 
                      className="btn-stepper-action"
                      onClick={() => setActiveModal(STEP_DETAILS[activeStep].modal)}
                    >
                      <span>{STEP_DETAILS[activeStep].actionText}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* VIEW SPECIFIC CONTENT */}
              {currentView === 'loans' ? (
                <>
                  {/* AI SALARY FINDER SCANNER */}
                  <div id="loan-scanner-widget" style={{ marginTop: '24px' }}>
                    <LoanDocScanner />
                  </div>

                  {/* Explore Loan Categories Grid */}
                  <section className="policy-explore-section" style={{ marginTop: '32px' }}>
                    <div className="explore-header-row">
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          Explore Loan Categories
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                          Different life goals, optimized borrowing structures. Transparent guidance for every milestone.
                        </p>
                      </div>
                    </div>

                    <div className="policy-cards-grid">
                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Most Popular</span>
                          <span className="policy-copay-tag">Floating ROI</span>
                        </div>
                        <h3 className="policy-name">🏠 Home Loan</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">8.40% – 9.15%</span>
                          <span className="policy-sum-label">Tenure up to 30 Yrs</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Max Loan</span>
                            <strong>₹15.00 Cr</strong>
                          </div>
                          <div className="spec-row">
                            <span>Tax Benefit</span>
                            <strong>Sec 24(b) + 80C</strong>
                          </div>
                          <div className="spec-row">
                            <span>Turnaround</span>
                            <strong>5–7 Days</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => {
                          const el = document.getElementById('loan-scanner-widget');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          Configure Home Loan →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Fast Disbursal</span>
                          <span className="policy-copay-tag">Fixed ROI</span>
                        </div>
                        <h3 className="policy-name">👤 Personal Loan</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">10.25% – 13.50%</span>
                          <span className="policy-sum-label">Tenure 1 to 5 Yrs</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Max Loan</span>
                            <strong>₹40.00 Lakhs</strong>
                          </div>
                          <div className="spec-row">
                            <span>Collateral</span>
                            <strong>Zero Required</strong>
                          </div>
                          <div className="spec-row">
                            <span>Turnaround</span>
                            <strong>24 Hours</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => {
                          const el = document.getElementById('loan-scanner-widget');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          Configure Personal Loan →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Future Builder</span>
                          <span className="policy-copay-tag">Moratorium</span>
                        </div>
                        <h3 className="policy-name">🎓 Education Loan</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">8.65% – 9.75%</span>
                          <span className="policy-sum-label">Course + 1 Yr Grace</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Max Loan</span>
                            <strong>₹1.50 Cr</strong>
                          </div>
                          <div className="spec-row">
                            <span>Tax Benefit</span>
                            <strong>Sec 80E (100%)</strong>
                          </div>
                          <div className="spec-row">
                            <span>Turnaround</span>
                            <strong>4–6 Days</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => {
                          const el = document.getElementById('loan-scanner-widget');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          Configure Education Loan →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Drive Ahead</span>
                          <span className="policy-copay-tag">On-Road 100%</span>
                        </div>
                        <h3 className="policy-name">🚗 Car Loan</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">8.75% – 9.50%</span>
                          <span className="policy-sum-label">Tenure 3 to 7 Yrs</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Financing</span>
                            <strong>Up to 100% On-Road</strong>
                          </div>
                          <div className="spec-row">
                            <span>Processing</span>
                            <strong>₹1,500 Flat</strong>
                          </div>
                          <div className="spec-row">
                            <span>Turnaround</span>
                            <strong>48 Hours</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => {
                          const el = document.getElementById('loan-scanner-widget');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          Configure Car Loan →
                        </button>
                      </article>
                    </div>
                  </section>
                </>
              ) : currentView === 'insurance' ? (
                <>
                  {/* AI MEDICAL OCR & 7-DIMENSION POLICY FINDER */}
                  <div id="insurance-scanner-widget" style={{ marginTop: '20px' }}>
                    <MedicalDocScanner />
                  </div>
                </>
              ) : currentView === 'fintech' ? (
                <>
                  {/* Fintech Services Grid */}
                  <section className="policy-explore-section" style={{ marginTop: '24px' }}>
                    <div className="explore-header-row">
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          Finora Fintech Infrastructure
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                          Modern, secure financial building blocks designed for retail customers and paperless onboarding.
                        </p>
                      </div>
                    </div>

                    <div className="policy-cards-grid">
                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Paperless</span>
                          <span className="policy-copay-tag">DigiLocker</span>
                        </div>
                        <h3 className="policy-name">🆔 Digital KYC & Onboarding</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">30 Seconds</span>
                          <span className="policy-sum-label">Instant UIDAI Authentication</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>PAN Check</span>
                            <strong>NSDL API Validated</strong>
                          </div>
                          <div className="spec-row">
                            <span>Video KYC</span>
                            <strong>AI Geolocation & Liveness</strong>
                          </div>
                          <div className="spec-row">
                            <span>Compliance</span>
                            <strong>RBI Master Circular</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => alert('Digital KYC Simulator initialized with sandbox DigiLocker flow.')}>
                          Test KYC Flow →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">High TPS</span>
                          <span className="policy-copay-tag">UPI 2.0</span>
                        </div>
                        <h3 className="policy-name">💳 UPI & Smart Mandates</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">99.9% Uptime</span>
                          <span className="policy-sum-label">AutoPay Recurring Mandates</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Settlement</span>
                            <strong>T+0 Real-Time Credit</strong>
                          </div>
                          <div className="spec-row">
                            <span>Recurring</span>
                            <strong>Up to ₹15,000 / cycle</strong>
                          </div>
                          <div className="spec-row">
                            <span>Security</span>
                            <strong>Device Tokenization</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => alert('UPI Mandate Generator launched.')}>
                          Setup AutoPay →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">RBI Licensed</span>
                          <span className="policy-copay-tag">End-to-End Encrypted</span>
                        </div>
                        <h3 className="policy-name">🔄 Account Aggregator (AA)</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">Zero Storage</span>
                          <span className="policy-sum-label">Consent-Driven Financial Sharing</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>Financial Info</span>
                            <strong>Bank, MF, Insurance</strong>
                          </div>
                          <div className="spec-row">
                            <span>Data Privacy</span>
                            <strong>Revocable Consent</strong>
                          </div>
                          <div className="spec-row">
                            <span>Verification</span>
                            <strong>Tamper-Proof Statements</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => alert('Connecting to Sahamati Account Aggregator Sandbox...')}>
                          Simulate AA Consent →
                        </button>
                      </article>

                      <article className="policy-feature-card">
                        <div className="policy-card-header">
                          <span className="policy-insurer-tag">Smart Wealth</span>
                          <span className="policy-copay-tag">BSE Star MF</span>
                        </div>
                        <h3 className="policy-name">📈 Automated Wealth Management</h3>
                        <div className="policy-metric-pill">
                          <span className="policy-sum-val">Direct Plans</span>
                          <span className="policy-sum-label">0% Commission Mutual Funds</span>
                        </div>
                        <div className="policy-specs-list">
                          <div className="spec-row">
                            <span>SIP Automation</span>
                            <strong>Daily / Weekly / Monthly</strong>
                          </div>
                          <div className="spec-row">
                            <span>Tax Harvesting</span>
                            <strong>LTCG Exemption &lt; ₹1.25L</strong>
                          </div>
                          <div className="spec-row">
                            <span>Rebalancing</span>
                            <strong>Dynamic Risk Weighting</strong>
                          </div>
                        </div>
                        <button type="button" className="btn-select-policy" onClick={() => alert('Finora Wealth portfolio optimizer activated.')}>
                          Explore Wealth Tools →
                        </button>
                      </article>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  {/* DUAL PERFORMANCE CHART & JOURNEY MILESTONES GRID */}
                  <section className="dashboard-performance-grid performance-grid-2col" aria-label="Finora Performance Analytics">
                    
                    {/* Performance Overview Bar Chart */}
                    <article className="performance-card">
                      <div className="performance-card-header">
                        <h3 className="performance-card-title">Performance Overview</h3>
                        <div className="chart-legend-row">
                          <div className="legend-item">
                            <span className="legend-box-black"></span>
                            <span>Milestones</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-box-gray"></span>
                            <span>Readiness</span>
                          </div>
                        </div>
                      </div>

                      <div className="performance-chart-wrap performance-chart-canvas">
                        <div className="bar-chart-bars-container chart-bars-container">
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
                            <tr onClick={() => navigateTo('loans')} style={{ cursor: 'pointer' }} title="Click to open Loans Journey">
                              <td className="strong-val">Home Loan</td>
                              <td><span className="metric-delta-tag tag-blue">In Review</span></td>
                              <td className="strong-val">88% ↗</td>
                            </tr>
                            <tr onClick={() => navigateTo('insurance')} style={{ cursor: 'pointer' }} title="Click to open Insurance Journey">
                              <td className="strong-val">Health Cover</td>
                              <td><span className="metric-delta-tag tag-green">Verified</span></td>
                              <td className="strong-val">96% ↗</td>
                            </tr>
                            <tr onClick={() => navigateTo('fintech')} style={{ cursor: 'pointer' }} title="Click to open Fintech Services">
                              <td className="strong-val">DigiLocker KYC</td>
                              <td><span className="metric-delta-tag tag-green">Done</span></td>
                              <td className="strong-val">100% ↗</td>
                            </tr>
                            <tr onClick={() => navigateTo('loans')} style={{ cursor: 'pointer' }} title="Click to open Loans Journey">
                              <td className="strong-val">Salary Proof</td>
                              <td><span className="metric-delta-tag tag-amber">Pending</span></td>
                              <td className="strong-val">75% ↗</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </article>

                  </section>

                  {/* CONSOLIDATED FINANCIAL DOMAINS SUMMARY (Dashboard Consolidated Results) */}
                  <section className="consolidated-domains-section" aria-label="Consolidated Financial Portfolios">
                    <div className="explore-header-row" style={{ marginTop: '28px', marginBottom: '16px' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          Consolidated Portfolio Snapshot
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                          High-level consolidated readiness across borrowing, protection, and paperless digital onboarding.
                        </p>
                      </div>
                    </div>

                    <div className="consolidated-cards-grid">
                      {/* Domain Card 1: Loans & Borrowing */}
                      <article className="consolidated-pillar-card">
                        <div className="pillar-header">
                          <div className="pillar-badge-group">
                            <span className="pillar-icon">💰</span>
                            <span className="pillar-domain-tag">Lending & Credit</span>
                          </div>
                          <span className="metric-delta-tag tag-green">88% Ready</span>
                        </div>
                        <h3 className="pillar-title">Loans & Borrowing Health</h3>
                        <p className="pillar-desc">
                          Assessed income from payslips, estimated FOIR borrowing limits, and pre-approved offers from 4 tier-1 lenders.
                        </p>
                        <div className="pillar-kpi-row">
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">Borrowing Cap</span>
                            <strong className="kpi-value">₹85.0L</strong>
                          </div>
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">Lowest ROI</span>
                            <strong className="kpi-value">8.40% p.a.</strong>
                          </div>
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">FOIR Ratio</span>
                            <strong className="kpi-value">28.4% Safe</strong>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn-pillar-action"
                          onClick={() => navigateTo('loans')}
                        >
                          <span>Open Loans Journey & AI Salary Scan</span>
                          <span>→</span>
                        </button>
                      </article>

                      {/* Domain Card 2: Insurance & Protection */}
                      <article className="consolidated-pillar-card">
                        <div className="pillar-header">
                          <div className="pillar-badge-group">
                            <span className="pillar-icon">🛡️</span>
                            <span className="pillar-domain-tag">Protection & Health</span>
                          </div>
                          <span className="metric-delta-tag tag-green">96% Verified</span>
                        </div>
                        <h3 className="pillar-title">Insurance & Health Shield</h3>
                        <p className="pillar-desc">
                          OCR medical document evaluation, zero co-pay eligibility, and disease waiting period comparisons.
                        </p>
                        <div className="pillar-kpi-row">
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">Coverage</span>
                            <strong className="kpi-value">₹1.00 Cr</strong>
                          </div>
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">Co-Pay</span>
                            <strong className="kpi-value">0% Zero</strong>
                          </div>
                          <div className="pillar-kpi-item">
                            <span className="kpi-label">Claim Ratio</span>
                            <strong className="kpi-value">99.1% High</strong>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn-pillar-action"
                          onClick={() => navigateTo('insurance')}
                        >
                          <span>Open Insurance Journey & AI Medical OCR</span>
                          <span>→</span>
                        </button>
                      </article>
                    </div>
                  </section>
                </>
              )}

            </main>

            {/* ================================================================
                 RIGHT COLUMN: FINORA AI COPILOT & INSIGHTS FEED
                 ================================================================ */}
            <aside className="dashboard-right-column" id="ai-companion">
              
              {/* Card 1: Finora AI WhatsApp Chat Copilot */}
              <div className="ai-companion-card whatsapp-chat-card">
                
                {/* WhatsApp Chat Header */}
                <div className="wa-header">
                  <div className="wa-header-left" onClick={() => setShowWaMenu(prev => !prev)}>
                    <div className="wa-avatar-wrap">
                      <div className="wa-avatar">
                        <span>FA</span>
                      </div>
                      <span className="wa-avatar-online-dot" title="Online now"></span>
                    </div>
                    <div className="wa-contact-details">
                      <span className="wa-contact-name">
                        {currentView === 'loans' ? 'Finora Loan AI' :
                         currentView === 'insurance' ? 'Finora Health AI' :
                         currentView === 'fintech' ? 'Finora Tech Copilot' :
                         'Finora AI'}
                        <span className="wa-verified-badge" title="Official Verified Financial AI Copilot">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </span>
                      </span>
                      <span className={`wa-contact-status ${isAiTyping ? 'typing' : ''}`}>
                        {isAiTyping ? 'typing...' : 'online'}
                      </span>
                    </div>
                  </div>

                  <div className="wa-header-actions">
                    <button 
                      type="button" 
                      className="wa-header-btn" 
                      title="Voice Consultation"
                      onClick={() => toggleSpeechRecognition()}
                      aria-label="Voice Consultation"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="wa-header-btn" 
                      title="AI Video Insights"
                      onClick={() => alert('Finora AI Video Copilot: Interactive video breakdown is currently active for your current view.')}
                      aria-label="AI Video Insights"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="wa-header-btn" 
                      title="Chat Options"
                      onClick={() => setShowWaMenu(prev => !prev)}
                      aria-label="Chat Options"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>

                    {/* WhatsApp Header Dropdown Menu */}
                    {showWaMenu && (
                      <div className="wa-dropdown-menu">
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => {
                            setAiDialogue([
                              {
                                sender: 'ai',
                                text: "Chat cleared. Hi! I'm Finora AI 👋 How can I help with loans or insurance today?",
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                status: 'read'
                              }
                            ]);
                            setShowWaMenu(false);
                          }}
                        >
                          🗑️ Clear Chat
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => {
                            setActiveModal('emi');
                            setShowWaMenu(false);
                          }}
                        >
                          🧮 EMI Calculator
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => {
                            setActiveModal('docs');
                            setShowWaMenu(false);
                          }}
                        >
                          📑 Document Check
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Chat Stream Canvas */}
                <div className="wa-chat-body" ref={chatBodyRef}>
                  
                  {/* WhatsApp End-to-End Encryption Notice */}
                  <div className="wa-encryption-banner">
                    <span>🔒</span>
                    <span>Messages are end-to-end encrypted. Finora AI financial guidance is private & confidential.</span>
                  </div>

                  {/* WhatsApp Date Divider */}
                  <div className="wa-date-pill">TODAY</div>

                  {/* Message Stream */}
                  {aiDialogue.map((msg, idx) => (
                    <div key={idx} className={`wa-msg-row ${msg.sender === 'ai' ? 'incoming' : 'outgoing'}`}>
                      <div className={msg.sender === 'ai' ? 'wa-bubble-incoming' : 'wa-bubble-outgoing'}>
                        {msg.sender === 'ai' && (
                          <div className="wa-bubble-author">
                            <span>Finora AI</span>
                            <span>✦</span>
                          </div>
                        )}
                        <p className="wa-bubble-text">{msg.text}</p>
                        <div className="wa-msg-meta">
                          <span className="wa-msg-time">{msg.time || '12:00 PM'}</span>
                          {msg.sender === 'user' && (
                            <span className="wa-double-check" title="Read">
                              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                                <path d="M11.049 0.927002L4.99998 6.97602L2.45098 4.42702L1.04998 5.82802L4.99998 9.77802L12.45 2.32802L11.049 0.927002Z" fill="#53bdeb"/>
                                <path d="M14.55 2.32802L8.50098 8.37702L7.79398 7.67002L6.37998 9.08402L8.50098 11.205L15.951 3.72902L14.55 2.32802Z" fill="#53bdeb"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator bubble */}
                  {isAiTyping && (
                    <div className="wa-msg-row incoming">
                      <div className="wa-typing-bubble" aria-label="Finora AI is typing">
                        <span className="wa-typing-dot"></span>
                        <span className="wa-typing-dot"></span>
                        <span className="wa-typing-dot"></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Interactive Quick Action Chips */}
                <div className="wa-chips-section">
                  <span className="wa-chips-label">
                    <span>⚡</span>
                    <span>Quick Suggestions</span>
                  </span>
                  <div className="wa-chips-grid">
                    {currentView === 'loans' ? (
                      <>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('How is FOIR calculated?')}>
                          <span>💬 What is FOIR?</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('Compare Floating vs Fixed rates')}>
                          <span>⚖️ Floating vs Fixed</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => setActiveModal('emi')}>
                          <span>🧮 EMI Calculator</span>
                          <span className="chip-arrow">→</span>
                        </button>
                      </>
                    ) : currentView === 'insurance' ? (
                      <>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('What is Co-Pay in health insurance?')}>
                          <span>🛡️ What is Co-Pay?</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('Explain pre-existing disease waiting period')}>
                          <span>⏳ Waiting Periods</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('How does 100% Restore benefit work?')}>
                          <span>🔄 Restore Benefits</span>
                          <span className="chip-arrow">→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="wa-chip-btn" onClick={() => handleQuickAction('Explain a financial term')}>
                          <span>💬 Financial terms</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => { navigateTo('loans'); handleQuickAction('Explore loans'); }}>
                          <span>🏦 Explore loans</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => { navigateTo('insurance'); handleQuickAction('Understand insurance'); }}>
                          <span>🏥 Health insurance</span>
                          <span className="chip-arrow">→</span>
                        </button>
                        <button type="button" className="wa-chip-btn" onClick={() => setActiveModal('docs')}>
                          <span>📑 Prep documents</span>
                          <span className="chip-arrow">→</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Emoji Quick Drawer */}
                {showEmojiPicker && (
                  <div className="wa-popup-drawer">
                    <div className="wa-emoji-shelf">
                      {['💰', '📊', '🏥', '🏦', '📑', '💳', '👍', '💡', '🚀', '🎯', '⚖️', '🔒'].map((emoji, eIdx) => (
                        <button 
                          key={eIdx}
                          type="button" 
                          className="wa-emoji-btn"
                          onClick={() => {
                            setAiInput(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attach Quick Drawer */}
                {showAttachMenu && (
                  <div className="wa-popup-drawer">
                    <div className="wa-attach-menu">
                      <button 
                        type="button" 
                        className="wa-attach-item"
                        onClick={() => {
                          setShowAttachMenu(false);
                          navigateTo('loans');
                          handleQuickAction('I want to evaluate my salary slip for loan eligibility');
                        }}
                      >
                        <span className="wa-attach-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>📑</span>
                        <span>Salary Payslip Analyzer</span>
                      </button>
                      <button 
                        type="button" 
                        className="wa-attach-item"
                        onClick={() => {
                          setShowAttachMenu(false);
                          navigateTo('insurance');
                          handleQuickAction('I want to evaluate my medical report for insurance coverage');
                        }}
                      >
                        <span className="wa-attach-icon" style={{ background: '#ECFDF5', color: '#059669' }}>🏥</span>
                        <span>Medical Diagnostic Report</span>
                      </button>
                      <button 
                        type="button" 
                        className="wa-attach-item"
                        onClick={() => {
                          setShowAttachMenu(false);
                          setActiveModal('emi');
                        }}
                      >
                        <span className="wa-attach-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>🧮</span>
                        <span>Quick EMI Simulator</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp Chat Input Footer */}
                <form className="wa-chat-footer" onSubmit={handleAiSend}>
                  {/* Emoji Button */}
                  <button 
                    type="button" 
                    className="wa-util-btn" 
                    title="Emoji"
                    onClick={() => {
                      setShowEmojiPicker(prev => !prev);
                      setShowAttachMenu(false);
                    }}
                    aria-label="Insert Emoji"
                  >
                    😊
                  </button>

                  {/* Attachment Clip Button */}
                  <button 
                    type="button" 
                    className="wa-util-btn" 
                    title="Attach Document or Tool"
                    onClick={() => {
                      setShowAttachMenu(prev => !prev);
                      setShowEmojiPicker(false);
                    }}
                    aria-label="Attach File"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>

                  {/* Text Input Pill */}
                  <div className="wa-input-pill-wrapper">
                    <input 
                      type="text" 
                      className="wa-input-text" 
                      placeholder={
                        isListeningMic ? "Listening to your voice... Speak now" :
                        currentView === 'loans' ? "Ask about loans, interest rates, FOIR..." :
                        currentView === 'insurance' ? "Ask about waiting periods, health policies..." :
                        "Type a message..."
                      }
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      aria-label="Type a message"
                    />
                  </div>

                  {/* WhatsApp Circle Send or Mic Button */}
                  {aiInput.trim() ? (
                    <button type="submit" className="wa-circle-btn" aria-label="Send Message" title="Send">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className={`wa-circle-btn ${isListeningMic ? 'listening' : ''}`}
                      onClick={toggleSpeechRecognition}
                      aria-label={isListeningMic ? "Stop Listening" : "Voice Message Input"}
                      title={isListeningMic ? "Listening... Click to stop" : "Speak message"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                      </svg>
                    </button>
                  )}
                </form>
              </div>

              {/* Card 2: Finora Insights Feed */}
              <div className="insights-feed-card">
                <div className="insights-card-header">
                  <span className="insights-title">
                    {currentView === 'loans' ? 'Finora Lending Insights' :
                     currentView === 'insurance' ? 'Health Insurance Rules' :
                     currentView === 'fintech' ? 'Fintech Protocol Health' :
                     'Finora Insights'}
                  </span>
                  <span className="insights-badge">Live Market</span>
                </div>

                <div className="insights-items-list">
                  {currentView === 'loans' ? (
                    <>
                      <div className="insight-item">
                        <span className="insight-dot dot-green"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">RBI Repo Rate Steady at 6.50%</span>
                          <span className="insight-desc">Floating home loan EBLR benchmarks remain favorable for prime borrowers.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-blue"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">Zero Prepayment Advantage</span>
                          <span className="insight-desc">Under RBI guidelines, no floating rate individual loan can incur foreclosure fees.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-amber"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">Pre-Approved In-Principle Letters</span>
                          <span className="insight-desc">Obtaining an in-principle sanction locks in your negotiated rate for 90 days.</span>
                        </div>
                      </div>
                    </>
                  ) : currentView === 'insurance' ? (
                    <>
                      <div className="insight-item">
                        <span className="insight-dot dot-green"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">IRDAI 3-Year Incontestability Rule</span>
                          <span className="insight-desc">Once a health policy completes 36 continuous months, non-disclosure cannot be used to reject claims.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-blue"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">Zero Co-Pay Significance</span>
                          <span className="insight-desc">Policies with 0% co-pay ensure 100% admissible hospitalization bills are settled without out-of-pocket costs.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-amber"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">Day-1 Metabolic Riders</span>
                          <span className="insight-desc">Selecting Day-1 PED riders waives standard 3-year waiting periods for diabetes and hypertension.</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="insight-item">
                        <span className="insight-dot dot-green"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">RBI Repo Rate Steady at 6.50%</span>
                          <span className="insight-desc">Floating home loan benchmarks remain attractive. Best floating ROI is 8.40% at SBI.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-blue"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">IRDAI Guidelines</span>
                          <span className="insight-desc">Pre-existing disease waiting periods reduced across all comprehensive health covers.</span>
                        </div>
                      </div>
                      <div className="insight-item">
                        <span className="insight-dot dot-amber"></span>
                        <div className="insight-text-wrap">
                          <span className="insight-headline">FOIR Health Benchmark</span>
                          <span className="insight-desc">Keeping monthly EMIs below 40% of net salary qualifies you for Super-Prime discounts.</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </aside>

          </div>

        </div>
      </div>

      {/* ====================================================================
           INTERACTIVE MODALS
           ==================================================================== */}
      
      {/* 1. EMI CALCULATOR MODAL */}
      {activeModal === 'emi' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-badge">Interactive Tool</span>
                <h3 className="modal-heading">Interactive EMI & Amortization Calculator</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="emi-modal-grid">
                {/* Sliders Side */}
                <div className="emi-modal-inputs">
                  <div className="emi-slider-block">
                    <div className="slider-label-flex">
                      <span>Loan Amount</span>
                      <span className="slider-number-bold">₹{calcAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                      type="range" 
                      min="50000" 
                      max="10000000" 
                      step="50000"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="cilo-slider"
                    />
                    <div className="slider-bounds">
                      <span>₹50K</span>
                      <span>₹1 Cr</span>
                    </div>
                  </div>

                  <div className="emi-slider-block">
                    <div className="slider-label-flex">
                      <span>Annual Interest Rate</span>
                      <span className="slider-number-bold">{calcRate}% p.a.</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="20" 
                      step="0.1"
                      value={calcRate}
                      onChange={(e) => setCalcRate(Number(e.target.value))}
                      className="cilo-slider"
                    />
                    <div className="slider-bounds">
                      <span>5%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div className="emi-slider-block">
                    <div className="slider-label-flex">
                      <span>Loan Tenure</span>
                      <span className="slider-number-bold">{calcTenure} Years</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      step="1"
                      value={calcTenure}
                      onChange={(e) => setCalcTenure(Number(e.target.value))}
                      className="cilo-slider"
                    />
                    <div className="slider-bounds">
                      <span>1 Yr</span>
                      <span>30 Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="emi-summary-box">
                  <span className="emi-summary-label">Monthly Repayment (EMI)</span>
                  <span className="emi-summary-big">₹{emiStats.emi.toLocaleString('en-IN')}</span>
                  <span className="emi-summary-sub">per month</span>

                  <div className="emi-breakdown-list">
                    <div className="emi-breakdown-row">
                      <span>Principal Amount</span>
                      <strong>₹{calcAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="emi-breakdown-row">
                      <span>Total Interest</span>
                      <strong style={{ color: 'var(--accent-amber)' }}>₹{emiStats.totalInterest.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="emi-breakdown-row total-row">
                      <span>Total Payable</span>
                      <strong>₹{emiStats.totalPayment.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-modal-primary"
                    onClick={() => {
                      setActiveModal(null);
                      navigateTo('loans');
                    }}
                  >
                    Match Lenders For This EMI →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELIGIBILITY CRITERIA MODAL */}
      {activeModal === 'eligibility' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-badge">Guidance</span>
                <h3 className="modal-heading">Finora Financial Readiness & Eligibility Standards</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="eligibility-cards-list">
                <div className="eligibility-item">
                  <div className="eligibility-item-header">
                    <span className="eligibility-item-icon">🎯</span>
                    <strong>Credit Score (CIBIL) Tiering</strong>
                  </div>
                  <p>A score of 750+ qualifies you for Super-Prime institutional interest concessions (8.40%–8.60%). Scores between 700–749 receive standard approval rates.</p>
                </div>

                <div className="eligibility-item">
                  <div className="eligibility-item-header">
                    <span className="eligibility-item-icon">⚖️</span>
                    <strong>FOIR (Fixed Obligation to Income Ratio)</strong>
                  </div>
                  <p>Lenders calculate total monthly debt obligations divided by net in-hand salary. A FOIR under 50% ensures seamless sanction without additional guarantor requirements.</p>
                </div>

                <div className="eligibility-item">
                  <div className="eligibility-item-header">
                    <span className="eligibility-item-icon">🏢</span>
                    <strong>Employment & Corporate Categorization</strong>
                  </div>
                  <p>Borrowers working in Tier-1 MNCs, listed PSUs, or Fortune 500 corporations qualify for instant paperless e-sanctions with zero processing fees.</p>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-modal-primary" onClick={() => setActiveModal(null)}>
                  Got it, Proceed With Application →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCUMENT CHECKLIST MODAL */}
      {activeModal === 'docs' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-badge">Verification</span>
                <h3 className="modal-heading">Paperless Documentation Checklist</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-subtext">All verified documents are processed via end-to-end encrypted DigiLocker integration without physical paperwork:</p>

              <div className="doc-checklist-grid">
                <div className="doc-check-item done">
                  <span className="check-box-icon">✓</span>
                  <div>
                    <strong>Identity Proof (Aadhaar & PAN)</strong>
                    <p>Verified instantly via DigiLocker e-KYC</p>
                  </div>
                </div>

                <div className="doc-check-item done">
                  <span className="check-box-icon">✓</span>
                  <div>
                    <strong>Proof of Address</strong>
                    <p>Linked to UIDAI digital demographic records</p>
                  </div>
                </div>

                <div className="doc-check-item in-progress">
                  <span className="check-box-icon">⏳</span>
                  <div>
                    <strong>Salary Slips / Form 16</strong>
                    <p>Use our AI Salary Finder below for instant verification</p>
                  </div>
                </div>

                <div className="doc-check-item done">
                  <span className="check-box-icon">✓</span>
                  <div>
                    <strong>Bank Statement (6 Months)</strong>
                    <p>Net banking statement validated</p>
                  </div>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button 
                  type="button" 
                  className="btn-modal-primary"
                  onClick={() => {
                    setActiveModal(null);
                    navigateTo('loans');
                  }}
                >
                  Open AI Salary Finder →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Assistant-Style Voice Assistant (Global) */}
      <VoiceAssistant 
        onApplyToInsurance={() => {
          navigateTo('insurance');
          setTimeout(() => {
            const target = document.getElementById('medical-ocr-section');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }}
        onApplyToLoans={() => {
          navigateTo('loans');
          setTimeout(() => {
            const target = document.getElementById('loan-intelligence-section');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }}
      />

    </div>
  );
}
