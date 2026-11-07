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
const logoScrollTrack = document.querySelector('[data-logo-scroll-track]');
const logoIntro = document.querySelector('[data-logo-intro]');
const logoFill = document.querySelector('[data-logo-fill]');
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
  const trackRect = logoScrollTrack instanceof HTMLElement ? logoScrollTrack.getBoundingClientRect() : null;
  const logoFramePinned = trackRect && logoIntro instanceof HTMLElement
    && trackRect.top <= 0
    && trackRect.bottom > logoIntro.offsetHeight;

  header?.classList.toggle('is-scrolled', window.scrollY > 24 && !logoFramePinned);
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
  updateLogoFill();
}

function updateLogoFill() {
  if (!(logoScrollTrack instanceof HTMLElement) || !(logoIntro instanceof HTMLElement) || !(logoFill instanceof HTMLElement)) return;

  const scrollDistance = logoScrollTrack.offsetHeight - logoIntro.offsetHeight;
  const progress = reducedMotion.matches || scrollDistance <= 0
    ? 1
    : Math.min(1, Math.max(0, -logoScrollTrack.getBoundingClientRect().top / scrollDistance));

  logoFill.style.setProperty('--logo-fill-progress', `${progress * 100}%`);
}

function initParticleWave() {
  const shell = document.querySelector('[data-particle-wave]');
  const canvas = shell?.querySelector('canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return () => {};

  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return () => {};

  const palette = [
    'rgba(91, 79, 255, 0.92)',
    'rgba(125, 81, 255, 0.9)',
    'rgba(165, 77, 243, 0.9)',
    'rgba(207, 67, 224, 0.9)',
    'rgba(239, 67, 197, 0.88)',
    'rgba(99, 128, 255, 0.9)',
  ];
  const pointer = {
    currentX: 0.5,
    currentY: 0.48,
    targetX: 0.5,
    targetY: 0.48,
    active: false,
    down: false,
    downX: 0.5,
    downY: 0.48,
  };
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const frameInterval = 1000 / 30;
  const pointerTimeConstant = coarsePointer ? 44 : 28;
  const interactionRadius = 0.26;
  const pulseDuration = 1.2;
  const maxClickRipples = 8;
  const tau = Math.PI * 2;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let columns = 0;
  let rows = 0;
  let rowSpacing = 24;
  let normalizedX = new Float32Array(0);
  let phases = new Float32Array(0);
  let waveColumnSin = new Float32Array(0);
  let waveColumnCos = new Float32Array(0);
  let phaseSin = new Float32Array(0);
  let phaseCos = new Float32Array(0);
  let sheenColumnSin = new Float32Array(0);
  let sheenColumnCos = new Float32Array(0);
  let animationId = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let clickRipples = [];
  let lastPointerActivity = 0;
  let pointerInside = false;
  let isRunning = false;
  let isVisible = true;

  function addShape(path, shape, x, y, size) {
    if (shape === 0) {
      path.moveTo(x + size, y);
      path.arc(x, y, size, 0, tau);
    } else if (shape === 1) {
      path.moveTo(x, y - size);
      path.lineTo(x + size * 0.92, y + size * 0.74);
      path.lineTo(x - size * 0.92, y + size * 0.74);
      path.closePath();
    } else {
      path.rect(x - size * 0.78, y - size * 0.78, size * 1.56, size * 1.56);
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    columns = Math.max(40, Math.min(240, Math.round(width / 12)));
    rowSpacing = Math.max(16, Math.min(24, Math.round(height / 62)));
    rows = Math.ceil(height / rowSpacing) + 5;
    normalizedX = new Float32Array(columns);
    phases = new Float32Array(columns);
    waveColumnSin = new Float32Array(columns);
    waveColumnCos = new Float32Array(columns);
    phaseSin = new Float32Array(columns);
    phaseCos = new Float32Array(columns);
    sheenColumnSin = new Float32Array(columns);
    sheenColumnCos = new Float32Array(columns);

    for (let column = 0; column < columns; column += 1) {
      normalizedX[column] = column / (columns - 1) * 2 - 1;
      phases[column] = column * 0.21;
      waveColumnSin[column] = Math.sin(normalizedX[column] * 4 + phases[column]);
      waveColumnCos[column] = Math.cos(normalizedX[column] * 4 + phases[column]);
      phaseSin[column] = Math.sin(phases[column]);
      phaseCos[column] = Math.cos(phases[column]);
      sheenColumnSin[column] = Math.sin(normalizedX[column] * 2.55 + phases[column] * 0.2);
      sheenColumnCos[column] = Math.cos(normalizedX[column] * 2.55 + phases[column] * 0.2);
    }

    draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    const centerX = width * 0.5;
    const planeWidth = Math.min(width * 1.08, 2100);
    const pointerX = (pointer.down ? pointer.downX : pointer.currentX) * width;
    const pointerY = (pointer.down ? pointer.downY : pointer.currentY) * height;
    const inverseWidth = 1 / Math.max(width, 1);
    const inverseHeight = 1 / Math.max(height, 1);
    const colorPaths = palette.map(() => [new Path2D(), new Path2D(), new Path2D()]);
    const sheenPath = new Path2D();
    const pointerPath = new Path2D();
    const pulsePaths = clickRipples.map(() => new Path2D());
    const baseSize = Math.max(2.6, Math.min(4.6, rowSpacing * 0.17));
    const pointerInfluenceActive = pointer.active || pointer.down;

    for (let row = 0; row < rows; row += 1) {
      const rowProgress = row / Math.max(rows - 1, 1);
      const gridY = rowProgress * 2 - 1;
      const depth = 0.96 + rowProgress * 0.08;
      const baseY = (row - 2) * rowSpacing;
      const rowPhase = row * 0.19;
      const waveY1Angle = rowPhase + elapsed * 0.16;
      const waveY1Sin = Math.sin(waveY1Angle);
      const waveY1Cos = Math.cos(waveY1Angle);
      const waveY2Angle = gridY * 3.5 + rowPhase - elapsed * 0.13;
      const waveY2Sin = Math.sin(waveY2Angle);
      const waveY2Cos = Math.cos(waveY2Angle);
      const waveXAngle = gridY * 3.5 + rowPhase + elapsed * 0.14;
      const waveXSin = Math.sin(waveXAngle);
      const waveXCos = Math.cos(waveXAngle);
      const sheenAngle = gridY * 1.8 + row * 0.038 - elapsed * 0.24;
      const sheenRowSin = Math.sin(sheenAngle);
      const sheenRowCos = Math.cos(sheenAngle);

      for (let column = 0; column < columns; column += 1) {
        const gridX = normalizedX[column];
        const baseX = centerX + gridX * planeWidth * 0.48 * depth;
        let distanceX = 0;
        let distanceY = 0;
        let distance = Infinity;
        let safeDistance = 1;
        if (pointerInfluenceActive) {
          distanceX = baseX - pointerX;
          distanceY = baseY - pointerY;
          distance = Math.hypot(distanceX * inverseWidth, distanceY * inverseHeight);
          safeDistance = Math.max(Math.hypot(distanceX, distanceY), 1);
        }
        const shape = (Math.floor(column / 3) + Math.floor(row / 3)) % 3;
        const phase = phases[column] + row * 0.19;
        const waveY = (
          waveColumnSin[column] * waveY1Cos + waveColumnCos[column] * waveY1Sin
        ) * 4.5 + (
          phaseCos[column] * waveY2Cos - phaseSin[column] * waveY2Sin
        ) * 3.5;
        const waveX = (
          phaseSin[column] * waveXCos + phaseCos[column] * waveXSin
        ) * 2.5;
        const hoverInfluence = pointer.active && !pointer.down ? Math.max(0, 1 - distance / interactionRadius) : 0;
        const holdInfluence = pointer.down ? Math.max(0, 1 - distance / 0.3) : 0;
        let ringInfluence = 0;
        let ringPushX = 0;
        let ringPushY = 0;
        let ripple = 0;
        clickRipples.forEach((clickRipple, index) => {
          const rippleX = baseX - clickRipple.x * width;
          const rippleY = baseY - clickRipple.y * height;
          const rippleDistance = Math.hypot(rippleX * inverseWidth, rippleY * inverseHeight);
          const rippleRadius = 0.035 + Math.min(clickRipple.age, 1.05) * 0.47;
          const ringDistance = Math.abs(rippleDistance - rippleRadius);
          const strength = Math.exp(-(ringDistance * ringDistance) / 0.0008) * Math.exp(-clickRipple.age * 1.25);

          if (strength > ringInfluence) {
            ringInfluence = strength;
            const safeRippleDistance = Math.max(Math.hypot(rippleX, rippleY), 1);
            const push = strength * 24;
            ringPushX = rippleX / safeRippleDistance * push;
            ringPushY = rippleY / safeRippleDistance * push;
            ripple = Math.sin((rippleDistance - rippleRadius) * 86 + phase) * strength * 4;
          }

          if (strength > 0.22) addShape(pulsePaths[index], shape, baseX + waveX, baseY + waveY, baseSize * 1.16);
        });
        const influence = Math.max(hoverInfluence, holdInfluence, ringInfluence);
        const pointerPush = hoverInfluence * 5 + holdInfluence * 18;
        const x = baseX + waveX + distanceX / safeDistance * pointerPush + ringPushX;
        const y = baseY + waveY + distanceY / safeDistance * pointerPush + ringPushY + ripple;
        const size = baseSize * (0.84 + influence * 0.42);
        const colorPosition = (
          column / columns * 3.45 +
          rowProgress * 1.1 +
          elapsed * 0.075 +
          influence * 0.42 +
          palette.length * 2
        ) % palette.length;
        const color = Math.floor(colorPosition);
        addShape(colorPaths[color][shape], shape, x, y, size);

        const sheen = Math.max(0, sheenColumnCos[column] * sheenRowCos - sheenColumnSin[column] * sheenRowSin);
        if (sheen > 0.86) addShape(sheenPath, shape, x, y, size * 1.06);
        if (hoverInfluence > 0.05 || holdInfluence > 0.05) addShape(pointerPath, shape, x, y, size * 1.12);
      }
    }

    const shapeOpacity = [0.54, 0.48, 0.52];
    colorPaths.forEach((paths, color) => {
      paths.forEach((path, shape) => {
        context.globalAlpha = shapeOpacity[shape];
        context.fillStyle = palette[color];
        context.fill(path);
      });
    });

    context.globalAlpha = 0.36;
    context.fillStyle = 'rgba(246, 232, 255, 0.78)';
    context.fill(sheenPath);

    if (pointer.active || pointer.down) {
      const pointerGlow = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, Math.min(width, height) * 0.22);
      pointerGlow.addColorStop(0, 'rgba(243, 226, 255, 0.56)');
      pointerGlow.addColorStop(0.28, 'rgba(223, 108, 255, 0.28)');
      pointerGlow.addColorStop(0.68, 'rgba(117, 127, 255, 0.11)');
      pointerGlow.addColorStop(1, 'rgba(88, 87, 255, 0)');
      context.globalAlpha = pointer.down ? 0.92 : 0.7;
      context.fillStyle = pointerGlow;
      context.fill(pointerPath);
    }

    clickRipples.forEach((clickRipple, index) => {
      const rippleX = clickRipple.x * width;
      const rippleY = clickRipple.y * height;
      const rippleRadius = 0.035 + Math.min(clickRipple.age, 1.05) * 0.47;
      const pulseGlow = context.createRadialGradient(rippleX, rippleY, 0, rippleX, rippleY, Math.min(width, height) * rippleRadius);
      pulseGlow.addColorStop(0, 'rgba(255, 245, 255, 0.08)');
      pulseGlow.addColorStop(0.65, 'rgba(235, 100, 236, 0.3)');
      pulseGlow.addColorStop(0.88, 'rgba(142, 132, 255, 0.52)');
      pulseGlow.addColorStop(1, 'rgba(117, 132, 255, 0)');
      context.globalAlpha = 0.9;
      context.fillStyle = pulseGlow;
      context.fill(pulsePaths[index]);
    });

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
    if (clickRipples.length) {
      clickRipples.forEach((clickRipple) => { clickRipple.age += delta / 1000; });
      clickRipples = clickRipples.filter((clickRipple) => clickRipple.age < pulseDuration);
    }
    pointer.active = pointerInside && timestamp - lastPointerActivity < 180;
    const pointerEase = 1 - Math.exp(-delta / pointerTimeConstant);
    pointer.currentX += (pointer.targetX - pointer.currentX) * pointerEase;
    pointer.currentY += (pointer.targetY - pointer.currentY) * pointerEase;
    draw();
    animationId = requestAnimationFrame(renderFrame);
  }

  function start() {
    if (isRunning || !isVisible || reducedMotion.matches || document.hidden) return;
    isRunning = true;
    lastFrame = performance.now();
    animationId = requestAnimationFrame(renderFrame);
  }

  function stop() {
    isRunning = false;
    cancelAnimationFrame(animationId);
  }

  function updatePointer(event) {
    pointer.targetX = Math.max(0, Math.min(1, event.clientX / width));
    pointer.targetY = Math.max(0, Math.min(1, event.clientY / height));
    pointer.active = true;
    pointerInside = true;
    lastPointerActivity = performance.now();

    if (reducedMotion.matches) {
      pointer.currentX = pointer.targetX;
      pointer.currentY = pointer.targetY;
    }
  }

  function handlePointerMove(event) {
    updatePointer(event);
    if (reducedMotion.matches) draw();
  }

  function handlePointerDown(event) {
    updatePointer(event);
    pointer.downX = pointer.targetX;
    pointer.downY = pointer.targetY;
    pointer.down = true;
    clickRipples.push({ x: pointer.downX, y: pointer.downY, age: 0 });
    if (clickRipples.length > maxClickRipples) clickRipples.shift();
    if (reducedMotion.matches) draw();
  }

  function handlePointerUp(event) {
    pointer.down = false;
    if (event.pointerType === 'touch') pointer.active = false;
    if (reducedMotion.matches) draw();
  }

  function handlePointerLeave() {
    pointer.active = false;
    pointerInside = false;
    pointer.down = false;
    if (reducedMotion.matches) draw();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  const visibilityObserver = typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('pointerup', handlePointerUp, { passive: true });
  window.addEventListener('pointercancel', handlePointerUp, { passive: true });
  window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  window.addEventListener('blur', handlePointerLeave);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  if (shell instanceof Element) visibilityObserver?.observe(shell);
  start();

  return () => {
    stop();
    visibilityObserver?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
    window.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('blur', handlePointerLeave);
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

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!(contactForm instanceof HTMLFormElement)) return;
  const email = contactForm.querySelector('input[type="email"]');
  if (!(email instanceof HTMLInputElement)) return;
  const submitButton = contactForm.querySelector('button[type="submit"]');

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
  contactForm.dataset.formState = 'pending';
  contactForm.setAttribute('aria-busy', 'true');
  setFormMessage('Joining the list…', 'pending');

  let originalButtonLabel = 'Join the list';
  if (submitButton instanceof HTMLButtonElement) {
    originalButtonLabel = submitButton.textContent?.trim() || originalButtonLabel;
    submitButton.disabled = true;
    submitButton.textContent = 'Joining…';
  }

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Form submission failed.');

    contactForm.reset();
    contactForm.dataset.formState = 'success';
    setFormMessage("You're on the list. Thanks for joining us.", 'success');
  } catch {
    contactForm.dataset.formState = 'error';
    setFormMessage('We could not save your email. Please try again.', 'error');
  } finally {
    contactForm.removeAttribute('aria-busy');
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonLabel;
    }
  }
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
