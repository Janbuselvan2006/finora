/**
 * FINORA - AI-Powered Financial Journeys
 * Main Interactive JavaScript
 * Hackathon Prototype Edition 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSearchInteraction();
    initHeroAIChat();
    initScenarioSwitcher();
    initAiAssistantChips();
    initSmoothScroll();
    initFoldableChat();
});

/* --------------------------------------------------------------------------
   1. MOBILE MENU & BACKDROP TOGGLE
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');
    const mobileBackdrop = document.getElementById('mobileDrawerBackdrop');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!mobileMenuBtn || !mobileDrawer) return;

    function openDrawer() {
        mobileDrawer.classList.add('open');
        if (mobileBackdrop) mobileBackdrop.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    if (mobileDrawerClose) {
        mobileDrawerClose.addEventListener('click', closeDrawer);
    }

    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeDrawer);
    }

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeDrawer();
        });
    });
}

/* --------------------------------------------------------------------------
   2. SEARCH INTERACTION & KEYBOARD SHORTCUT (Ctrl + K / Cmd + K)
   -------------------------------------------------------------------------- */
function initSearchInteraction() {
    const searchInputs = document.querySelectorAll('.search-input');

    // Listen for Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const primarySearch = document.getElementById('globalSearchInput');
            if (primarySearch) {
                primarySearch.focus();
                primarySearch.select();
            }
        }
    });

    searchInputs.forEach((input) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (query) {
                    // In prototype, smoothly redirect or notify user
                    window.location.href = `knowledge-hub.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    });
}

/* --------------------------------------------------------------------------
   3. HERO FLOATING AI ASSISTANT CHAT SIMULATOR
   -------------------------------------------------------------------------- */
function initHeroAIChat() {
    const heroForm = document.getElementById('heroAiForm');
    const heroInput = document.getElementById('heroAiInput');
    const heroAiText = document.getElementById('heroAiDialogueText');
    const heroChips = document.querySelectorAll('.hero-ai-chip');

    const responses = {
        loan: "I can help you navigate loan eligibility, calculate potential EMI ranges, and prepare required documentation checklist step-by-step.",
        insurance: "I'll guide you through understanding coverage needs, comparing policy types, and reviewing claims criteria in clear plain language.",
        question: "Feel free to ask any financial term or journey question. I break down complex concepts into simple, actionable steps.",
        document: "You can learn what specific documents (income proof, identity verification, address) are standard for each journey."
    };

    function updateHeroMessage(text) {
        if (!heroAiText) return;
        heroAiText.textContent = "Finora AI is thinking...";
        setTimeout(() => {
            heroAiText.textContent = text;
        }, 350);
    }

    heroChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const intent = chip.getAttribute('data-intent');
            if (intent && responses[intent]) {
                updateHeroMessage(responses[intent]);
            } else {
                updateHeroMessage(`Let's explore "${chip.textContent.trim()}". I'll break down the requirements and next milestones for you.`);
            }
        });
    });

    if (heroForm && heroInput) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = heroInput.value.trim();
            if (!query) return;

            updateHeroMessage(`Understood: "${query}". I'm organizing the journey steps and guidelines for this topic.`);
            heroInput.value = '';
        });
    }
}

/* --------------------------------------------------------------------------
   4. SECTION 3 — AI GUIDANCE SCENARIO SWITCHER
   -------------------------------------------------------------------------- */
function initScenarioSwitcher() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    const chatUserBubble = document.getElementById('previewUserText');
    const chatAiGreeting = document.getElementById('previewAiGreeting');
    const chatAiBody = document.getElementById('previewAiBody');

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

    scenarioButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            scenarioButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const scenarioKey = btn.getAttribute('data-scenario');
            const data = scenarioData[scenarioKey];

            if (data && chatUserBubble && chatAiGreeting && chatAiBody) {
                chatUserBubble.textContent = data.user;
                chatAiGreeting.textContent = data.greeting;
                chatAiBody.textContent = data.body;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   5. AI ASSISTANT QUICK ACTION CHIPS IN SECTION 3 PREVIEW
   -------------------------------------------------------------------------- */
function initAiAssistantChips() {
    const actionChips = document.querySelectorAll('.chat-action-chip');
    const chatUserBubble = document.getElementById('previewUserText');
    const chatAiBody = document.getElementById('previewAiBody');
    const chatAiGreeting = document.getElementById('previewAiGreeting');

    const chipResponses = {
        'I need a loan': {
            user: "I need a loan for personal or business purposes.",
            greeting: "Let's explore your loan journey:",
            body: "To get started, consider: 1) The required loan amount and tenure, 2) Your repayment capacity (EMI), 3) Credit score health, and 4) Choosing between secured (collateral-backed) vs unsecured options."
        },
        'I want insurance': {
            user: "I want to explore insurance options for health and family.",
            greeting: "Insurance discovery guidance:",
            body: "Start by identifying what risks you want to protect against: family income security (Term Life), medical emergencies (Comprehensive Health Cover), or asset protection (Motor/Home)."
        },
        'Explain a financial term': {
            user: "Can you explain what 'APR' vs 'Nominal Interest Rate' means?",
            greeting: "Financial concept simplified:",
            body: "Nominal Interest Rate is the base percentage charged on borrowed money. APR (Annual Percentage Rate) includes the interest rate PLUS all mandatory fees, processing charges, and upfront costs, showing the true annual borrowing cost."
        },
        'Help me understand a document': {
            user: "How do I review a loan sanction letter or policy schedule?",
            greeting: "Document review checklist:",
            body: "Always verify: 1) The approved amount and interest rate type (fixed vs floating), 2) Processing fees and prepayment penalty terms, 3) Deductibles & waiting periods for insurance policies."
        }
    };

    actionChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const chipText = chip.textContent.trim();
            const response = chipResponses[chipText];

            if (response && chatUserBubble && chatAiBody && chatAiGreeting) {
                chatUserBubble.textContent = response.user;
                chatAiGreeting.textContent = response.greeting;
                chatAiBody.textContent = response.body;
            }
        });
    });
}

/* --------------------------------------------------------------------------
   6. SMOOTH SCROLLING FOR IN-PAGE ANCHORS
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElem.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* --------------------------------------------------------------------------
   7. FOLDABLE CHATBOT CONTROLLER
   -------------------------------------------------------------------------- */
function initFoldableChat() {
    const chatCards = document.querySelectorAll('.whatsapp-chat-card, .ai-companion-card, .finora-ai-card');
    if (!chatCards.length) return;

    chatCards.forEach(card => {
        const header = card.querySelector('.wa-header, .ai-card-header');
        if (!header) return;

        let actionsWrap = header.querySelector('.wa-header-actions');
        if (!actionsWrap) {
            actionsWrap = document.createElement('div');
            actionsWrap.className = 'wa-header-actions';
            header.appendChild(actionsWrap);
        }

        let foldBtn = actionsWrap.querySelector('.wa-fold-toggle, .wa-fold-btn');
        if (!foldBtn) {
            foldBtn = document.createElement('button');
            foldBtn.type = 'button';
            foldBtn.className = 'wa-header-btn wa-fold-toggle';
            foldBtn.setAttribute('title', 'Fold Chat (Minimize)');
            foldBtn.setAttribute('aria-label', 'Fold or unfold chat');
            foldBtn.setAttribute('aria-expanded', 'true');
            foldBtn.innerHTML = `
                <svg class="wa-fold-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            `;
            actionsWrap.appendChild(foldBtn);
        }

        let badge = header.querySelector('.wa-folded-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'wa-folded-badge';
            badge.textContent = 'Folded • Tap to open';
            const nameEl = header.querySelector('.wa-contact-name, .ai-header-name');
            if (nameEl) {
                nameEl.appendChild(badge);
            } else {
                header.appendChild(badge);
            }
        }

        function setFoldState(folded, save = true) {
            if (folded) {
                card.classList.add('folded');
                foldBtn.setAttribute('title', 'Unfold Chat (Expand)');
                foldBtn.setAttribute('aria-expanded', 'false');
            } else {
                card.classList.remove('folded');
                foldBtn.setAttribute('title', 'Fold Chat (Minimize)');
                foldBtn.setAttribute('aria-expanded', 'true');
            }
            if (save) {
                try {
                    localStorage.setItem('finora_chat_folded', folded ? 'true' : 'false');
                } catch (e) {}
            }
        }

        foldBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCurrentlyFolded = card.classList.contains('folded');
            setFoldState(!isCurrentlyFolded);
        });

        header.addEventListener('click', (e) => {
            if (card.classList.contains('folded')) {
                setFoldState(false);
            }
        });

        try {
            const savedState = localStorage.getItem('finora_chat_folded');
            if (savedState === 'true') {
                setFoldState(true, false);
            }
        } catch (e) {}
    });
}