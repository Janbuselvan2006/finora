/**
 * Finora - Main Interactive JavaScript
 * Global Foldable Chatbot Controller & Core Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initFoldableChat();
});

/**
 * Initializes foldable/collapsible behavior on all AI Chatbot cards
 */
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

    // Find or create fold toggle button
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

    // Ensure folded badge exists in header
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
        } catch (e) {
          // ignore localStorage failure in restricted modes
        }
      }
    }

    // Click on fold toggle button
    foldBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyFolded = card.classList.contains('folded');
      setFoldState(!isCurrentlyFolded);
    });

    // Clicking anywhere on the header when folded will unfold the chat
    header.addEventListener('click', (e) => {
      if (card.classList.contains('folded')) {
        setFoldState(false);
      }
    });

    // Check saved state from localStorage if present
    try {
      const savedState = localStorage.getItem('finora_chat_folded');
      if (savedState === 'true') {
        setFoldState(true, false);
      }
    } catch (e) {}

    // Global toggle function attached to window for manual calls
    window.toggleFinoraChat = () => {
      const isCurrentlyFolded = card.classList.contains('folded');
      setFoldState(!isCurrentlyFolded);
    };
  });
}
