/**
 * ROI Edge — Professional ROI Calculator
 * Minaj Enterprises
 * Version 1.0
 */

(function () {
  'use strict';

  const DOM = {
    initialInput: document.getElementById('initial-amount'),
    finalInput: document.getElementById('final-amount'),
    resetBtn: document.getElementById('reset-btn'),
    copyBtn: document.getElementById('copy-btn'),
    roiFigure: document.getElementById('roi-figure'),
    roiPercent: document.getElementById('roi-percent'),
    figureBadge: document.getElementById('figure-badge'),
    percentBadge: document.getElementById('percent-badge'),
    figureCard: document.getElementById('roi-figure-card'),
    percentCard: document.getElementById('roi-percent-card'),
    insightStatus: document.getElementById('insight-status'),
    insightGrowth: document.getElementById('insight-growth'),
    insightAmount: document.getElementById('insight-amount'),
    insightAmountLabel: document.getElementById('insight-amount-label'),
    toast: document.getElementById('toast'),
  };

  const STATE_CLASSES = {
    positive: 'positive',
    negative: 'negative',
    neutral: 'neutral',
  };

  let toastTimer = null;

  /**
   * Parse a numeric input value safely.
   * @param {string} value
   * @returns {number|null}
   */
  function parseAmount(value) {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : null;
  }

  /**
   * Round to two decimal places.
   * @param {number} value
   * @returns {number}
   */
  function roundTwo(value) {
    return Math.round(value * 100) / 100;
  }

  /**
   * Determine ROI state from a numeric value.
   * @param {number} value
   * @returns {'positive'|'negative'|'neutral'}
   */
  function getState(value) {
    if (value > 0) return STATE_CLASSES.positive;
    if (value < 0) return STATE_CLASSES.negative;
    return STATE_CLASSES.neutral;
  }

  /**
   * Format a signed currency figure.
   * @param {number} value
   * @returns {string}
   */
  function formatFigure(value) {
    const rounded = roundTwo(value);
    const sign = rounded > 0 ? '+' : rounded < 0 ? '' : '';
    return `${sign}${rounded.toFixed(2)}`;
  }

  /**
   * Format a signed percentage.
   * @param {number} value
   * @returns {string}
   */
  function formatPercent(value) {
    const rounded = roundTwo(value);
    const sign = rounded > 0 ? '+' : rounded < 0 ? '' : '';
    return `${sign}${rounded.toFixed(2)}%`;
  }

  /**
   * Format amount for insights with dollar sign.
   * @param {number} value
   * @returns {string}
   */
  function formatInsightAmount(value) {
    const rounded = roundTwo(value);
    if (rounded > 0) return `+$${rounded.toFixed(2)}`;
    if (rounded < 0) return `-$${Math.abs(rounded).toFixed(2)}`;
    return `$${rounded.toFixed(2)}`;
  }

  /**
   * Apply color state classes to an element.
   * @param {HTMLElement} el
   * @param {'positive'|'negative'|'neutral'} state
   * @param {string} prefix
   */
  function applyStateClass(el, state, prefix) {
    el.classList.remove(
      `${prefix}--positive`,
      `${prefix}--negative`,
      `${prefix}--neutral`
    );
    el.classList.add(`${prefix}--${state}`);
  }

  /**
   * Apply card glow state.
   * @param {HTMLElement} card
   * @param {'positive'|'negative'|'neutral'} state
   */
  function applyCardState(card, state) {
    card.classList.remove(
      'result-card--positive',
      'result-card--negative',
      'result-card--neutral'
    );
    card.classList.add(`result-card--${state}`);
  }

  /**
   * Trigger a brief scale animation on value update.
   * @param {HTMLElement} el
   */
  function pulseValue(el) {
    el.classList.add('updating');
    requestAnimationFrame(() => {
      setTimeout(() => el.classList.remove('updating'), 150);
    });
  }

  /**
   * Reset all displays to empty state.
   */
  function resetDisplay() {
    DOM.roiFigure.textContent = '—';
    DOM.roiPercent.textContent = '—';
    DOM.figureBadge.textContent = '—';
    DOM.percentBadge.textContent = '—';
    DOM.insightStatus.textContent = '—';
    DOM.insightGrowth.textContent = '—';
    DOM.insightAmount.textContent = '—';
    DOM.insightAmountLabel.textContent = 'Amount Earned/Lost';

    applyStateClass(DOM.roiFigure, STATE_CLASSES.neutral, 'result-card__value');
    applyStateClass(DOM.roiPercent, STATE_CLASSES.neutral, 'result-card__value');
    applyStateClass(DOM.insightStatus, STATE_CLASSES.neutral, 'insight-card__value');
    applyStateClass(DOM.insightGrowth, STATE_CLASSES.neutral, 'insight-card__value');
    applyStateClass(DOM.insightAmount, STATE_CLASSES.neutral, 'insight-card__value');

    applyCardState(DOM.figureCard, STATE_CLASSES.neutral);
    applyCardState(DOM.percentCard, STATE_CLASSES.neutral);

    DOM.figureBadge.classList.remove('result-card__badge--positive', 'result-card__badge--negative');
    DOM.percentBadge.classList.remove('result-card__badge--positive', 'result-card__badge--negative');

    DOM.copyBtn.disabled = true;
  }

  /**
   * Calculate and render ROI results.
   */
  function calculate() {
    const initial = parseAmount(DOM.initialInput.value);
    const final = parseAmount(DOM.finalInput.value);

    if (initial === null || final === null) {
      resetDisplay();
      return;
    }

    if (initial === 0) {
      DOM.roiFigure.textContent = formatFigure(final - initial);
      DOM.roiPercent.textContent = '—';
      DOM.figureBadge.textContent = 'N/A';
      DOM.percentBadge.textContent = 'N/A';

      const figureState = getState(final - initial);
      applyStateClass(DOM.roiFigure, figureState, 'result-card__value');
      applyCardState(DOM.figureCard, figureState);
      applyCardState(DOM.percentCard, STATE_CLASSES.neutral);

      DOM.insightStatus.textContent = figureState === STATE_CLASSES.positive ? 'Profit' : figureState === STATE_CLASSES.negative ? 'Loss' : 'Break Even';
      applyStateClass(DOM.insightStatus, figureState, 'insight-card__value');
      DOM.insightGrowth.textContent = 'N/A';
      DOM.insightAmount.textContent = formatInsightAmount(final - initial);
      applyStateClass(DOM.insightAmount, figureState, 'insight-card__value');

      DOM.copyBtn.disabled = false;
      return;
    }

    const roiFigure = roundTwo(final - initial);
    const roiPercent = roundTwo(((final - initial) / initial) * 100);
    const state = getState(roiFigure);

    DOM.roiFigure.textContent = formatFigure(roiFigure);
    DOM.roiPercent.textContent = formatPercent(roiPercent);

    pulseValue(DOM.roiFigure);
    pulseValue(DOM.roiPercent);

    applyStateClass(DOM.roiFigure, state, 'result-card__value');
    applyStateClass(DOM.roiPercent, state, 'result-card__value');
    applyCardState(DOM.figureCard, state);
    applyCardState(DOM.percentCard, state);

    const badgeText = state === STATE_CLASSES.positive ? 'GAIN' : state === STATE_CLASSES.negative ? 'LOSS' : 'FLAT';
    DOM.figureBadge.textContent = badgeText;
    DOM.percentBadge.textContent = badgeText;

    DOM.figureBadge.classList.remove('result-card__badge--positive', 'result-card__badge--negative');
    DOM.percentBadge.classList.remove('result-card__badge--positive', 'result-card__badge--negative');

    if (state === STATE_CLASSES.positive) {
      DOM.figureBadge.classList.add('result-card__badge--positive');
      DOM.percentBadge.classList.add('result-card__badge--positive');
    } else if (state === STATE_CLASSES.negative) {
      DOM.figureBadge.classList.add('result-card__badge--negative');
      DOM.percentBadge.classList.add('result-card__badge--negative');
    }

    const statusText = state === STATE_CLASSES.positive ? 'Profit' : state === STATE_CLASSES.negative ? 'Loss' : 'Break Even';
    DOM.insightStatus.textContent = statusText;
    applyStateClass(DOM.insightStatus, state, 'insight-card__value');

    DOM.insightGrowth.textContent = formatPercent(roiPercent);
    applyStateClass(DOM.insightGrowth, state, 'insight-card__value');

    DOM.insightAmount.textContent = formatInsightAmount(roiFigure);
    applyStateClass(DOM.insightAmount, state, 'insight-card__value');

    DOM.copyBtn.disabled = false;
  }

  /**
   * Reset all form inputs and results.
   */
  function handleReset() {
    DOM.initialInput.value = '';
    DOM.finalInput.value = '';
    resetDisplay();
    DOM.initialInput.focus();
  }

  /**
   * Build copy text from current results.
   * @returns {string}
   */
  function buildCopyText() {
    const initial = parseAmount(DOM.initialInput.value);
    const final = parseAmount(DOM.finalInput.value);

    if (initial === null || final === null) return '';

    const roiFigure = roundTwo(final - initial);
    const roiPercent = initial !== 0 ? roundTwo(((final - initial) / initial) * 100) : null;

    let text = 'ROI Edge — Minaj Enterprises\n';
    text += '─────────────────────────\n';
    text += `Initial Amount: $${initial.toFixed(2)}\n`;
    text += `Final Amount: $${final.toFixed(2)}\n`;
    text += `ROI Figure: ${formatFigure(roiFigure)}\n`;
    text += roiPercent !== null
      ? `ROI Percentage: ${formatPercent(roiPercent)}\n`
      : 'ROI Percentage: N/A (initial amount is zero)\n';
    text += '─────────────────────────\n';
    text += 'Generated by ROI Edge v1.0';

    return text;
  }

  /**
   * Copy results to clipboard.
   */
  async function handleCopy() {
    const text = buildCopyText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Results copied to clipboard');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Results copied to clipboard');
    }
  }

  /**
   * Display a temporary toast notification.
   * @param {string} message
   */
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);

    DOM.toast.textContent = message;
    DOM.toast.hidden = false;
    DOM.toast.classList.add('toast--visible');

    toastTimer = setTimeout(() => {
      DOM.toast.classList.remove('toast--visible');
      setTimeout(() => {
        DOM.toast.hidden = true;
      }, 350);
    }, 2800);
  }

  /**
   * Bind event listeners.
   */
  function init() {
    DOM.initialInput.addEventListener('input', calculate);
    DOM.finalInput.addEventListener('input', calculate);
    DOM.resetBtn.addEventListener('click', handleReset);
    DOM.copyBtn.addEventListener('click', handleCopy);

    DOM.initialInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleReset();
    });

    DOM.finalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') handleReset();
    });

    resetDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
