(() => {
  'use strict';

  const SUPPORTED = new Set(['text', 'email', 'number', 'password', 'search', 'tel', 'url']);
  const records = new Set();

  function isSupported(input) {
    return input instanceof HTMLInputElement &&
      SUPPORTED.has((input.type || 'text').toLowerCase()) &&
      !input.classList.contains('native-select-source');
  }

  function displayValue(record) {
    const { input } = record;
    const raw = input.value == null ? '' : String(input.value);
    if (record.wasPassword && raw) return '•'.repeat(Math.min(Math.max(raw.length, 8), 12));
    return raw || input.placeholder || '';
  }

  function position(record) {
    const { input, mirror } = record;
    if (!input.isConnected || !mirror.isConnected) return;
    const cs = getComputedStyle(input);

    mirror.style.left = `${input.offsetLeft}px`;
    mirror.style.top = `${input.offsetTop}px`;
    mirror.style.width = `${input.offsetWidth}px`;
    mirror.style.height = `${input.offsetHeight}px`;
    mirror.style.paddingLeft = cs.paddingLeft;
    mirror.style.paddingRight = cs.paddingRight;
    mirror.style.paddingTop = cs.paddingTop;
    mirror.style.paddingBottom = cs.paddingBottom;
    mirror.style.fontFamily = cs.fontFamily;
    mirror.style.fontSize = cs.fontSize;
    mirror.style.fontWeight = cs.fontWeight;
    mirror.style.letterSpacing = cs.letterSpacing;
    mirror.style.textAlign = cs.textAlign;
    mirror.style.lineHeight = cs.lineHeight === 'normal' ? `${input.offsetHeight}px` : cs.lineHeight;
  }

  function sync(record) {
    const { input, mirror } = record;
    if (!input.isConnected) return;

    const text = displayValue(record);
    if (mirror.textContent !== text) mirror.textContent = text;
    mirror.classList.toggle('is-placeholder', !input.value && !!input.placeholder);
    mirror.classList.toggle('is-readonly', input.readOnly || input.disabled);
    position(record);

    const editing = document.activeElement === input && !input.readOnly && !input.disabled;
    input.classList.toggle('capture-field-editing', editing);
    mirror.hidden = editing;
  }

  function enhance(input) {
    if (!isSupported(input) || input.dataset.captureMirror === 'true') return;

    const parent = input.parentElement;
    if (!parent) return;

    input.dataset.captureMirror = 'true';
    const mirror = document.createElement('span');
    mirror.className = 'capture-field-mirror';
    mirror.setAttribute('aria-hidden', 'true');

    parent.classList.add('capture-field-parent');
    parent.appendChild(mirror);

    const record = {
      input,
      mirror,
      wasPassword: input.type === 'password'
    };
    input._agriCaptureMirror = record;
    records.add(record);

    input.addEventListener('focus', () => sync(record));
    input.addEventListener('blur', () => sync(record));
    input.addEventListener('input', () => sync(record));
    input.addEventListener('change', () => sync(record));

    sync(record);
  }

  function enhanceAll(root = document) {
    if (root.nodeType === 1 && root.matches?.('input')) enhance(root);
    root.querySelectorAll?.('input').forEach(enhance);
  }

  function cleanup() {
    records.forEach(record => {
      if (record.input.isConnected) return;
      record.mirror.remove();
      records.delete(record);
    });
  }

  function syncAll() {
    cleanup();
    records.forEach(sync);
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhanceAll(document);
    syncAll();
  });

  const observer = new MutationObserver((mutations) => {
    let addedRelevantContent = false;

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.classList?.contains('capture-field-mirror')) return;
        enhanceAll(node);
        addedRelevantContent = true;
      });
    });

    if (addedRelevantContent) syncAll();
    else cleanup();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', syncAll);
  window.addEventListener('load', syncAll);

  // Programmatic .value assignments do not emit input/change events.
  // A lightweight sync keeps capture mirrors correct for calculated/read-only fields.
  setInterval(syncAll, 1000);

  window.AgriCaptureFields = { syncAll };
})();