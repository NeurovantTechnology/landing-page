const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const menuLabel = menuToggle?.querySelector('.sr-only');
const projectDropdown = document.querySelector('[data-project-dropdown]');
const projectToggle = projectDropdown?.querySelector('[data-project-toggle]');
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
const contentLinks = navLinks;
const sections = [...document.querySelectorAll('main section[id]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 50rem)');
const revealItems = [...document.querySelectorAll('[data-reveal]')];
const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('#form-status');

function setProjectMenu(open, { focusFirst = false, returnFocus = false } = {}) {
  if (!(projectToggle instanceof HTMLButtonElement) || !(projectDropdown instanceof HTMLElement)) return;

  projectToggle.setAttribute('aria-expanded', String(open));
  projectDropdown.classList.toggle('is-open', open);

  if (open && focusFirst) {
    const firstItem = projectDropdown.querySelector('a');
    if (firstItem instanceof HTMLElement) firstItem.focus();
  }

  if (!open && returnFocus) projectToggle.focus();
}

function setMenu(open, { focusFirst = false, returnFocus = false } = {}) {
  if (!menuToggle || !nav) return;
  setProjectMenu(false);
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (mobileNavigation.matches) {
    nav.setAttribute('aria-hidden', String(!open));
  } else {
    nav.removeAttribute('aria-hidden');
  }
  document.body.classList.toggle('menu-open', open);
  if (menuLabel) menuLabel.textContent = open ? 'Close navigation' : 'Open navigation';

  if (open && focusFirst && navLinks[0] instanceof HTMLElement) navLinks[0].focus();
  if (!open && returnFocus && menuToggle instanceof HTMLElement) menuToggle.focus();
}

if (nav && mobileNavigation.matches) nav.setAttribute('aria-hidden', 'true');
mobileNavigation.addEventListener?.('change', (event) => {
  if (event.matches) {
    nav?.setAttribute('aria-hidden', 'true');
  } else {
    setMenu(false);
  }
});

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

function updateActiveSection() {
  const threshold = window.innerHeight * 0.42;
  let activeId = sections[0]?.id;

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= threshold) activeId = section.id;
  });

  contentLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('is-active', isActive && !link.classList.contains('button'));
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateScrollState() {
  updateHeader();
  updateActiveSection();
}

function initParticleWave() {
  const shell = document.querySelector('[data-particle-wave]');
  const canvas = shell?.querySelector('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return () => {};

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return () => {};

  const pointer = {
    currentX: 0.5,
    currentY: 0.48,
    targetX: 0.5,
    targetY: 0.48,
  };
  const tau = Math.PI * 2;
  const frameInterval = 1000 / 60;
  const pointerTimeConstant = 55;
  const scrollTimeConstant = 85;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let columns = 0;
  let rows = 0;
  let rowSpacing = 34;
  let normalizedX = new Float32Array(0);
  let phases = new Float32Array(0);
  let animationId = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let scrollCurrent = window.scrollY;
  let scrollTarget = window.scrollY;
  let scrollVelocity = 0;
  let isRunning = false;
  const interactionRadiusSquared = 1 / (5.2 * 5.2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    columns = Math.max(26, Math.min(48, Math.round(width / 30)));
    rowSpacing = Math.max(28, Math.min(42, Math.round(height / 22)));
    rows = Math.ceil(height / rowSpacing) + 5;
    normalizedX = new Float32Array(columns);
    phases = new Float32Array(columns);

    for (let column = 0; column < columns; column += 1) {
      normalizedX[column] = column / (columns - 1) * 2 - 1;
      phases[column] = column * 0.21;
    }

    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    const centerX = width * 0.5;
    const planeWidth = Math.min(width * 1.5, 1700);
    const pointerX = pointer.currentX * width;
    const pointerY = pointer.currentY * height;
    const scrollPhase = scrollCurrent * 0.0028;
    const scrollLift = scrollVelocity * 10;
    const inverseWidth = 1 / Math.max(width, 1);
    const inverseHeight = 1 / Math.max(height, 1);
    const firstWorldRow = Math.floor(scrollCurrent / rowSpacing) - 2;
    const scrollRemainder = scrollCurrent - Math.floor(scrollCurrent / rowSpacing) * rowSpacing;
    const lightPath = new Path2D();
    const deepPath = new Path2D();

    for (let row = 0; row < rows; row += 1) {
      const worldRow = firstWorldRow + row;
      const rowProgress = row / Math.max(rows - 1, 1);
      const gridY = worldRow * 0.37;
      const depth = 0.91 + rowProgress * 0.09;
      const baseY = (row - 2) * rowSpacing - scrollRemainder;

      for (let column = 0; column < columns; column += 1) {
        const gridX = normalizedX[column];
        const baseX = centerX + gridX * planeWidth * 0.72 * depth;
        const distanceX = baseX - pointerX;
        const distanceY = baseY - pointerY;
        const normalizedDistanceX = distanceX * inverseWidth;
        const normalizedDistanceY = distanceY * inverseHeight;
        const distanceSquared = normalizedDistanceX * normalizedDistanceX + normalizedDistanceY * normalizedDistanceY;
        const phase = phases[column] + worldRow * 0.19;
        const wave =
          Math.sin(gridX * 5.6 + scrollPhase * 0.9 + elapsed * 0.24 + phase) * 12 +
          Math.cos(gridY * 5.1 - scrollPhase * 1.15 - elapsed * 0.18 + phase) * 8 +
          Math.sin((gridX + gridY) * 3.2 - scrollPhase * 0.72 - elapsed * 0.12) * 5;
        let interactionX = 0;
        let interactionY = 0;
        let interactionInfluence = 0;

        if (distanceSquared < interactionRadiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          interactionInfluence = 1 - distance * 5.2;
          const push = interactionInfluence * 22;
          const safeDistance = Math.max(Math.sqrt(distanceX * distanceX + distanceY * distanceY), 1);
          const ripple = Math.sin(distance * 72 - elapsed * 3.4 + phase) * push;
          interactionX = distanceX / safeDistance * push;
          interactionY = distanceY / safeDistance * push + ripple;
        }

        const scrollWave = Math.sin(gridX * 4.2 + scrollPhase * 1.8 + gridY * 2.6) * 10;
        const x = baseX + interactionX + wave * 0.2 + scrollWave * 0.28;
        const y = baseY + interactionY + wave + scrollWave + scrollLift;
        const radius = 0.55 + depth * 0.65 + interactionInfluence * 1.2;
        const path = (row + column) % 4 === 0 ? lightPath : deepPath;

        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, tau);
      }
    }

    context.globalCompositeOperation = 'screen';
    context.globalAlpha = 0.52;
    context.fillStyle = 'rgba(221, 211, 255, 0.82)';
    context.fill(lightPath);
    context.globalAlpha = 0.62;
    context.fillStyle = 'rgba(121, 88, 202, 0.68)';
    context.fill(deepPath);
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }

  function renderFrame(timestamp) {
    if (!isRunning) return;
    if (timestamp - lastFrame < frameInterval) {
      animationId = requestAnimationFrame(renderFrame);
      return;
    }

    const delta = Math.min(timestamp - lastFrame || 16, 64);
    lastFrame = timestamp;
    elapsed += delta / 1000;
    const pointerEase = 1 - Math.exp(-delta / pointerTimeConstant);
    const scrollEase = 1 - Math.exp(-delta / scrollTimeConstant);
    pointer.currentX += (pointer.targetX - pointer.currentX) * pointerEase;
    pointer.currentY += (pointer.targetY - pointer.currentY) * pointerEase;
    scrollCurrent += (scrollTarget - scrollCurrent) * scrollEase;
    scrollVelocity *= Math.pow(0.88, delta / (1000 / 48));
    draw();
    animationId = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (isRunning || reducedMotion.matches || document.hidden) return;
    isRunning = true;
    lastFrame = performance.now();
    animationId = requestAnimationFrame(renderFrame);
  }

  function stop() {
    isRunning = false;
    cancelAnimationFrame(animationId);
  }

  function handlePointerMove(event) {
    pointer.targetX = Math.max(0, Math.min(1, event.clientX / width));
    pointer.targetY = Math.max(0, Math.min(1, event.clientY / height));
  }

  function handleScroll() {
    const nextScrollY = window.scrollY;
    const scrollDelta = nextScrollY - scrollTarget;
    scrollTarget = nextScrollY;
    scrollVelocity = Math.max(-1, Math.min(1, scrollDelta / Math.max(height, 1)));

    if (reducedMotion.matches) {
      scrollCurrent = scrollTarget;
      draw();
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  start();

  return () => {
    stop();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenu(!isOpen, { focusFirst: !isOpen });
});

projectToggle?.addEventListener('click', () => {
  const isOpen = projectToggle.getAttribute('aria-expanded') === 'true';
  setProjectMenu(!isOpen);
});

projectToggle?.addEventListener('keydown', (event) => {
  if (!(event instanceof KeyboardEvent)) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setProjectMenu(true, { focusFirst: true });
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    setProjectMenu(true, { focusFirst: true });
  }
});

projectDropdown?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setProjectMenu(false));
});

document.addEventListener('pointerdown', (event) => {
  if (!(projectDropdown instanceof HTMLElement) || !(event.target instanceof Node)) return;
  if (!projectDropdown.contains(event.target)) setProjectMenu(false);
});

anchorLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false, { returnFocus: true });
    return;
  }

  if (projectToggle?.getAttribute('aria-expanded') === 'true') setProjectMenu(false, { returnFocus: true });
});

if (reducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

function setFormMessage(message, state = '') {
  if (!(formStatus instanceof HTMLElement)) return;
  formStatus.textContent = message;
  if (state) {
    formStatus.dataset.state = state;
  } else {
    formStatus.removeAttribute('data-state');
  }
}

function clearFormError() {
  if (!(contactForm instanceof HTMLFormElement)) return;
  contactForm.removeAttribute('data-form-state');
  setFormMessage('');
}

contactForm?.addEventListener('input', () => {
  const email = contactForm.querySelector('input[type="email"]');
  if (!(email instanceof HTMLInputElement)) return;
  const hasFormMessage = formStatus instanceof HTMLElement && Boolean(formStatus.dataset.state);
  if (email.getAttribute('aria-invalid') === 'true' || hasFormMessage) {
    email.setAttribute('aria-invalid', 'false');
    clearFormError();
  }
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!(contactForm instanceof HTMLFormElement)) return;
  const email = contactForm.querySelector('input[type="email"]');
  if (!(email instanceof HTMLInputElement)) return;

  const value = email.value.trim();
  if (!value) {
    email.setAttribute('aria-invalid', 'true');
    contactForm.dataset.formState = 'error';
    setFormMessage('Please enter your email address.', 'error');
    email.focus();
    return;
  }

  if (!email.checkValidity()) {
    email.setAttribute('aria-invalid', 'true');
    contactForm.dataset.formState = 'error';
    setFormMessage('That email address looks incomplete. Try name@example.com.', 'error');
    email.focus();
    return;
  }

  email.value = value;
  email.setAttribute('aria-invalid', 'false');
  contactForm.dataset.formState = 'success';
  setFormMessage('Demo complete - your email is valid. Nothing was sent or stored.', 'success');
});

document.querySelectorAll('[data-year]').forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
reducedMotion.addEventListener?.('change', () => window.location.reload());
const cleanupParticleWave = initParticleWave();
window.addEventListener('beforeunload', cleanupParticleWave, { once: true });
updateScrollState();
