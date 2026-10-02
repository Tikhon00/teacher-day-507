/* Small, dependency-free interactions. All content also works without JavaScript. */
(() => {
  'use strict';
  const progress = document.querySelector('.reading-progress');
  let scheduled = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? window.scrollY / total * 100 : 0}%`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  // A visible button keeps the joke accessible without taking over Ctrl+S.
  const techButton = document.querySelector('.tech-button');
  const techNote = document.querySelector('.tech-note');
  techButton.addEventListener('click', () => {
    const opening = techNote.hidden;
    techNote.hidden = !opening;
    techButton.setAttribute('aria-expanded', String(opening));
  });

  const wishes = [
    'Пусть хороших новостей будет больше, чем сообщений в школьных чатах.',
    'Желаю вам чашку чая, которую получится допить тёплой.',
    'Пусть приятные сюрпризы случаются чаще, чем изменения в расписании.',
    'Желаю сил для любимых дел — и времени на них после школы.',
    'Пусть техника слушается, а кнопка «Сохранить» всегда будет под рукой.',
    'Пусть рядом будут люди, которые заботятся о вас так же, как вы — о нас.',
  ];
  let wishIndex = 0;
  let cardAnimation;
  const wishText = document.querySelector('#wish-text');
  const wishCount = document.querySelector('#wish-count');
  const wishCard = document.querySelector('.sheet-front');
  document.querySelector('.wish-button').addEventListener('click', () => {
    wishIndex = (wishIndex + 1) % wishes.length;
    wishText.textContent = wishes[wishIndex];
    wishCount.textContent = `${String(wishIndex + 1).padStart(2, '0')} / 06`;
    wishCount.setAttribute('aria-label', `Пожелание ${wishIndex + 1} из 6`);
    if (!reducedMotion.matches && typeof wishCard.animate === 'function') {
      cardAnimation?.cancel();
      cardAnimation = wishCard.animate([
        { transform: 'rotate(2deg) translateY(0)' },
        { transform: 'rotate(-2deg) translateY(-10px)', offset: 0.45 },
        { transform: 'rotate(2deg) translateY(0)' },
      ], { duration: 380, easing: 'ease-out' });
    }
  });

  const dialog = document.querySelector('.letter-dialog');
  const envelopeButton = document.querySelector('.envelope-button');
  let originalOverflow = '';
  envelopeButton.addEventListener('click', () => {
    if (dialog.open) return;
    originalOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = originalOverflow;
    envelopeButton.focus({ preventScroll: true });
  });

  const confetti = document.querySelector('.confetti');
  dialog.append(confetti); // Keep the celebration in the dialog's top layer.
  const celebrateButton = document.querySelector('.celebrate-button');
  const celebrationMessage = document.querySelector('.celebration-message');
  let cleanupTimer;
  function clearConfetti() {
    window.clearTimeout(cleanupTimer);
    confetti.replaceChildren();
  }
  celebrateButton.addEventListener('click', () => {
    celebrationMessage.textContent = 'Пусть поводов для радости будет больше! ♡';
    clearConfetti();
    if (reducedMotion.matches) return;
    const fragment = document.createDocumentFragment();
    const colors = ['#f1d779', '#d6cee8', '#faf4df', '#c27491'];
    for (let i = 0; i < 65; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--left', `${Math.random() * 100}%`);
      piece.style.setProperty('--size', `${5 + Math.random() * 5}px`);
      piece.style.setProperty('--color', colors[i % colors.length]);
      piece.style.setProperty('--duration', `${2 + Math.random() * 1.5}s`);
      piece.style.setProperty('--delay', `${Math.random() * 0.3}s`);
      piece.style.setProperty('--drift', `${Math.random() * 150 - 75}px`);
      piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
      fragment.append(piece);
    }
    confetti.append(fragment);
    cleanupTimer = window.setTimeout(clearConfetti, 4000);
  });
  dialog.addEventListener('close', clearConfetti);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      document.documentElement.classList.remove('motion-ready');
      cardAnimation?.cancel();
      clearConfetti();
    }
  });
})();
