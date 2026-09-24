/**
 * IP Explorer — script.js
 * Handles all UI interactions:
 *   - Scroll-triggered reveal animations
 *   - Search/lookup button press animation
 *   - "How to Get My IP" modal open/close
 *   - AI IP Finder reveal
 *   - Copy-to-clipboard with Copied! tooltip
 *
 * NOTE: No real network requests are made here.
 * All IP lookup and detection logic will be wired in later on the backend.
 */

'use strict';

/* ── HELPERS ─────────────────────────────────────────────── */

/**
 * Shorthand for querySelector
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand for querySelectorAll
 * @param {string} sel
 * @param {Document|Element} [ctx=document]
 * @returns {NodeList}
 */
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

/* ── SCROLL-REVEAL OBSERVER ──────────────────────────────── */

/**
 * Sets up an IntersectionObserver to add the "visible" class to
 * elements with .reveal-up or .reveal-card as they scroll into view.
 * This triggers the CSS transition for the staggered fade/slide-up.
 */
function initScrollReveal() {
  const options = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once only
      }
    });
  }, options);

  // Observe all reveal elements
  $$('.reveal-up, .reveal-card').forEach((el) => observer.observe(el));
}

/* ── LOOKUP BUTTON INTERACTION ───────────────────────────── */

/**
 * Handles the visual press animation on the Lookup button.
 * Navigates to the standalone ip-details.html page with the entered IP.
 */
function initLookupButton() {
  const btn = $('#lookup-btn');
  const input = $('#ip-input');
  const searchBox = $('#search-box');

  if (!btn || !input) return;

  // Ripple/press animation & navigation
  btn.addEventListener('click', () => {
    const rawValue = input.value.trim();
    const ipToShow = rawValue !== '' ? rawValue : '8.8.8.8';

    // Visual press feedback
    btn.style.transform = 'scale(0.94)';
    btn.style.transition = 'transform 0.1s ease';
    setTimeout(() => {
      btn.style.transform = '';
      btn.style.transition = '';
    }, 140);

    // Brief loading pulse on the search box
    if (searchBox) {
      searchBox.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.30)';
      searchBox.style.borderColor = 'var(--clr-accent)';
    }

    // Redirect to ip-details.html page with entered IP as query parameter
    // setTimeout(() => {
    //   window.location.href = `ip-details.html?ip=${encodeURIComponent(ipToShow)}`;
    // }, 220);
  });

  // Also trigger on Enter key in the input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });

  // Focus ring enhancement on the search box
  input.addEventListener('focus', () => {
    searchBox.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    searchBox.classList.remove('focused');
  });
}

/* ── MODAL ───────────────────────────────────────────────── */

/**
 * Controls the "How to Get My IP" modal:
 *   - Opens on button click with fade+scale animation
 *   - Closes on overlay click, close button, or Escape key
 *   - Traps focus inside the modal while open
 *   - Manages aria-hidden / aria-expanded attributes for accessibility
 */
function initModal() {
  const openBtn    = $('#how-to-get-ip-btn');
  const overlay    = $('#modal-overlay');
  const modal      = $('#modal');
  const closeBtn   = $('#modal-close');
  const finderBtn  = $('#ai-finder-btn');
  const ipBox      = $('#detected-ip-box');

  if (!openBtn || !overlay || !modal) return;

  let isOpen = false;

  /** Opens the modal */
  function openModal() {
    isOpen = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus the close button for accessibility
    setTimeout(() => closeBtn?.focus(), 100);
  }

  /** Closes the modal and resets AI finder state */
  function closeModal() {
    isOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    openBtn.focus();
  }

  openBtn.addEventListener('click', openModal);

  // Navbar CTA button also opens the same modal
  const navCtaBtn = $('#how-to-find-ip-nav-btn');
  if (navCtaBtn) {
    navCtaBtn.addEventListener('click', openModal);
  }

  closeBtn?.addEventListener('click', closeModal);

  // Close when clicking the backdrop (but not the modal itself)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Escape key closes the modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });

  // Focus trap: keep Tab/Shift+Tab within the modal
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled);

    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // ── AI IP FINDER ──────────────────────────────────────────
  /**
   * When the AI IP Finder button is clicked, reveal the dummy detected
   * IP address with a smooth slide-up animation.
   * Real detection logic (e.g. API call) will replace this later.
   */
if (finderBtn && ipBox) {
    finderBtn.addEventListener('click', () => {

        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => {
                const ipValue = data.ip;
                const ipValueElement = document.getElementById('detected-ip-value');

                if (ipValueElement) {
                    ipValueElement.textContent = ipValue;
                }
            });

        ipBox.classList.add('revealed');
        ipBox.setAttribute('aria-hidden', 'false');
        finderBtn.setAttribute('aria-expanded', 'true');

        finderBtn.style.transform = 'scale(0.96)';

        setTimeout(() => {
            finderBtn.style.transform = '';
        }, 160);
    });
}
}

/* ── COPY TO CLIPBOARD ───────────────────────────────────── */

/**
 * Copies the detected IP address to clipboard when the copy button
 * is clicked, then briefly shows the "Copied!" state and tooltip.
 */
function initCopyButton() {
  const copyBtn  = $('#copy-ip-btn');
  const ipValue  = $('#detected-ip-value');

  if (!copyBtn || !ipValue) return;

  let copyTimeout = null;

  copyBtn.addEventListener('click', () => {
    const textToCopy = ipValue.textContent.trim();

    // Use the Clipboard API
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Show "copied" state
      copyBtn.classList.add('copied');
      copyBtn.setAttribute('aria-label', 'Copied!');

      // Clear any existing timeout
      if (copyTimeout) clearTimeout(copyTimeout);

      // Revert after 2.2 seconds
      copyTimeout = setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.setAttribute('aria-label', 'Copy IP address to clipboard');
      }, 2200);
    }).catch(() => {
      // Fallback for browsers without clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        copyBtn.classList.add('copied');
        if (copyTimeout) clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => copyBtn.classList.remove('copied'), 2200);
      } catch (err) {
        console.warn('IP Explorer: Could not copy to clipboard.', err);
      }
    });
  });
}

/* ── NAVBAR SCROLL SHADOW ─────────────────────────────────── */

/**
 * Adds a more prominent shadow/tint to the navbar as the user scrolls
 * down, creating a subtle depth effect.
 */
function initNavbarScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 20;
        navbar.style.borderBottomColor = scrolled
          ? 'rgba(56, 139, 253, 0.28)'
          : 'rgba(56, 139, 253, 0.18)';
        navbar.style.background = scrolled
          ? 'rgba(5, 12, 24, 0.92)'
          : 'rgba(5, 12, 24, 0.75)';
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ── SMOOTH ANCHOR LINKS ─────────────────────────────────── */

/**
 * Intercepts clicks on anchor links (href="#...") and performs
 * a smooth-scroll to the target section, accounting for the sticky navbar height.
 */
function initSmoothAnchors() {
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68',
    10
  );

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── IP DETAILS STANDALONE PAGE HANDLER ──────────────────── */

/**
 * Handles the standalone ip-details.html page:
 *   - Parses ?ip=... query param from URL
 *   - Updates the result IP display, card IP value, and IP type
 *   - Triggers staggered reveal animations on cards
 */

/* ── INIT ─────────────────────────────────────────────────── */

/**
 * Entry point — runs once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initLookupButton();
  initModal();
  initCopyButton();
  initNavbarScroll();
  initSmoothAnchors();
});



/* ── ERROR TOAST ───────────────────────────────────────── */

const errorToast = document.getElementById('glassErrorToast');
const errorToastClose = document.getElementById('glassErrorClose');

let errorToastTimer = null;


function showErrorToast() {

    if (!errorToast) return;

    errorToast.classList.remove('hide');

    void errorToast.offsetWidth;

    errorToast.classList.add('show');


    if (errorToastTimer) {
        clearTimeout(errorToastTimer);
    }


    errorToastTimer = setTimeout(() => {

        hideErrorToast();

    }, 12000);
}


function hideErrorToast() {

    if (!errorToast) return;

    errorToast.classList.remove('show');

    errorToast.classList.add('hide');


    if (errorToastTimer) {
        clearTimeout(errorToastTimer);
        errorToastTimer = null;
    }
}


if (errorToastClose) {

    errorToastClose.addEventListener(
        'click',
        hideErrorToast
    );

}


/* STATIC TEST */

document.addEventListener('DOMContentLoaded', () => {

    showErrorToast();

});