/* ========================================================================== 
   AgriPrice — Modern Capture-Safe Selects
   Replaces the browser-painted native select UI with DOM text/options so
   Figma Capture can preserve the selected value. The original <select>
   remains the source of truth for all existing page logic.
   ========================================================================== */
(() => {
  const ENHANCED = 'data-agri-select-enhanced';
  let openInstance = null;

  function optionText(select) {
    const opt = select.options[select.selectedIndex];
    return opt ? opt.textContent.trim() : 'Select an option';
  }

  function positionMenu(instance) {
    const { button, menu } = instance;
    const rect = button.getBoundingClientRect();
    const gap = 6;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const desiredMax = 280;
    const below = viewportH - rect.bottom - gap;
    const above = rect.top - gap;
    const openUp = below < 180 && above > below;

    menu.style.position = 'fixed';
    menu.style.left = `${Math.max(8, Math.min(rect.left, viewportW - rect.width - 8))}px`;
    menu.style.width = `${rect.width}px`;
    menu.style.minWidth = `${rect.width}px`;
    menu.style.maxWidth = `${Math.max(rect.width, 360)}px`;
    menu.style.zIndex = '99999';
    menu.style.maxHeight = `${Math.max(120, Math.min(desiredMax, (openUp ? above : below) - 8))}px`;

    if (openUp) {
      menu.style.top = 'auto';
      menu.style.bottom = `${viewportH - rect.top + gap}px`;
    } else {
      menu.style.bottom = 'auto';
      menu.style.top = `${rect.bottom + gap}px`;
    }
  }

  function close(instance, restoreFocus = false) {
    if (!instance || !instance.wrapper.classList.contains('open')) return;
    instance.wrapper.classList.remove('open');
    instance.menu.classList.remove('portal-open');
    instance.button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) instance.button.focus();
    if (openInstance === instance) openInstance = null;
  }

  function buildOptions(instance) {
    const { select, menu } = instance;
    menu.innerHTML = '';

    [...select.options].forEach((opt, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'modern-select-option';
      item.dataset.value = opt.value;
      item.dataset.index = String(index);
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
      item.disabled = opt.disabled;

      const label = document.createElement('span');
      label.className = 'modern-select-option-label';
      label.textContent = opt.textContent;

      const check = document.createElement('span');
      check.className = 'modern-select-option-check';
      check.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';

      item.append(label, check);

      item.addEventListener('click', () => {
        if (opt.disabled) return;
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        sync(instance);
        close(instance, true);
      });

      menu.appendChild(item);
    });
  }

  function sync(instance) {
    const { select, value, menu } = instance;
    value.textContent = optionText(select);
    value.classList.toggle('placeholder', !select.value);
    [...menu.children].forEach((item, index) => {
      const selected = index === select.selectedIndex;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function open(instance) {
    if (openInstance && openInstance !== instance) close(openInstance);
    buildOptions(instance);
    sync(instance);
    instance.wrapper.classList.add('open');
    instance.menu.classList.add('portal-open');
    instance.button.setAttribute('aria-expanded', 'true');
    openInstance = instance;
    positionMenu(instance);

    requestAnimationFrame(() => {
      positionMenu(instance);
      const selected = instance.menu.querySelector('.modern-select-option.selected:not(:disabled)');
      selected?.scrollIntoView({ block: 'nearest' });
    });
  }

  function enhance(select) {
    if (!(select instanceof HTMLSelectElement) || select.hasAttribute(ENHANCED)) return;
    if (select.multiple || select.size > 1) return;

    select.setAttribute(ENHANCED, 'true');

    const wrapper = document.createElement('div');
    wrapper.className = 'modern-select';
    if (select.className) wrapper.classList.add(...select.className.split(/\s+/).filter(Boolean));
    if (select.style.maxWidth) wrapper.style.maxWidth = select.style.maxWidth;
    if (select.style.width) wrapper.style.width = select.style.width;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'modern-select-trigger';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    if (select.id) button.setAttribute('aria-controls', `${select.id}-menu`);

    const value = document.createElement('span');
    value.className = 'modern-select-value';

    const icon = document.createElement('span');
    icon.className = 'modern-select-chevron';
    icon.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';

    button.append(value, icon);

    const menu = document.createElement('div');
    menu.className = 'modern-select-menu';
    menu.setAttribute('role', 'listbox');
    if (select.id) menu.id = `${select.id}-menu`;

    select.parentNode.insertBefore(wrapper, select);
    wrapper.append(select, button);
    document.body.appendChild(menu);
    select.classList.add('native-select-source');

    const instance = { select, wrapper, button, value, menu };
    select._agriModernSelect = instance;

    buildOptions(instance);
    sync(instance);

    button.addEventListener('click', () => {
      wrapper.classList.contains('open') ? close(instance) : open(instance);
    });

    button.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key) && !wrapper.classList.contains('open')) {
        event.preventDefault();
        open(instance);
        const items = [...menu.querySelectorAll('.modern-select-option:not(:disabled)')];
        const current = menu.querySelector('.modern-select-option.selected:not(:disabled)');
        (current || items[0])?.focus();
      }
      if (event.key === 'Escape') close(instance);
    });

    menu.addEventListener('keydown', (event) => {
      const items = [...menu.querySelectorAll('.modern-select-option:not(:disabled)')];
      const currentIndex = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        items[Math.min(currentIndex + 1, items.length - 1)]?.focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        items[Math.max(currentIndex - 1, 0)]?.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(instance, true);
      } else if (event.key === 'Tab') {
        close(instance);
      }
    });

    select.addEventListener('change', () => sync(instance));

    const optionObserver = new MutationObserver(() => {
      buildOptions(instance);
      sync(instance);
    });
    optionObserver.observe(select, { childList: true, subtree: true, attributes: true });
  }

  function enhanceAll(root = document) {
    if (root instanceof HTMLSelectElement) enhance(root);
    root.querySelectorAll?.('select').forEach(enhance);
  }

  document.addEventListener('click', (event) => {
    if (
      openInstance &&
      !openInstance.wrapper.contains(event.target) &&
      !openInstance.menu.contains(event.target)
    ) close(openInstance);
  });

  window.addEventListener('resize', () => {
    if (openInstance) positionMenu(openInstance);
  });

  window.addEventListener('scroll', () => {
    if (openInstance) positionMenu(openInstance);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openInstance) close(openInstance, true);
  });

  enhanceAll();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) enhanceAll(node);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
