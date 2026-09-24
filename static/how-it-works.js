/**
 * IP Explorer — how-it-works.js
 * Handles all UI interactions specific to the How It Works page:
 *   - Scroll-triggered reveal animations (same observer as main page)
 *   - Navbar scroll shadow / tint effect
 *   - Smooth anchor link scrolling
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
 * elements with .reveal-up as they scroll into view.
 * Mirrors the same logic used on index.html.
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

  $$('.reveal-up').forEach((el) => observer.observe(el));
}

/* ── NAVBAR SCROLL SHADOW ─────────────────────────────────── */

/**
 * Adds a more prominent shadow/tint to the navbar as the user scrolls
 * down — matches the behaviour on the main page.
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
 * Intercepts anchor link clicks and smooth-scrolls to the target,
 * accounting for the sticky navbar height.
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

/* ── INIT ─────────────────────────────────────────────────── */

/**
 * Entry point — runs once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavbarScroll();
  initSmoothAnchors();
});
