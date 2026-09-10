// Petite lightbox réutilisable pour les photos affichées dans les popups
// (avions, bateaux, ...). Un seul overlay est créé et réutilisé pour toute
// l'app. Le déclenchement se fait par délégation d'événements sur
// `document`, ce qui permet de fonctionner même si les popups sont générées
// dynamiquement via innerHTML (pas besoin d'attacher un listener par popup).

const TRIGGER_CLASS = 'popup-photo-img';

let initialized = false;
let overlay: HTMLDivElement | null = null;
let imgEl: HTMLImageElement | null = null;
let captionEl: HTMLDivElement | null = null;

function ensureOverlay(): void {
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.className = 'photo-lightbox-overlay';

  imgEl = document.createElement('img');
  imgEl.className = 'photo-lightbox-img';
  overlay.appendChild(imgEl);

  captionEl = document.createElement('div');
  captionEl.className = 'photo-lightbox-caption';
  overlay.appendChild(captionEl);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'photo-lightbox-close';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  overlay.appendChild(closeBtn);

  // Clic n'importe où sur l'overlay (sauf sur l'image elle-même) = fermeture
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.body.appendChild(overlay);
}

function openLightbox(src: string, caption = ''): void {
  ensureOverlay();
  if (!overlay || !imgEl || !captionEl) return;

  imgEl.src = src;
  captionEl.textContent = caption;
  overlay.classList.add('photo-lightbox-overlay--open');
}

function closeLightbox(): void {
  overlay?.classList.remove('photo-lightbox-overlay--open');
}

/**
 * À appeler UNE SEULE FOIS au démarrage de l'app (ex: dans index.tsx).
 * Ensuite, toute <img class="popup-photo-img"> injectée dans une popup
 * MapLibre (avions, bateaux, etc.) devient cliquable pour s'agrandir.
 */
export function setupPhotoLightbox(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList?.contains(TRIGGER_CLASS)) {
      const img = target as HTMLImageElement;
      openLightbox(img.currentSrc || img.src, img.alt ?? '');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}