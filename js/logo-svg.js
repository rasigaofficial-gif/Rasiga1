window.RasigaLogoSVG = `
<svg viewBox="0 -6 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <style>
    .v-groove { fill: none; stroke: var(--bg-color); stroke-width: 2.5; stroke-linecap: round; }
    .logo-vinyl { transform-origin: 45px 45px; }
    @keyframes spinVinyl { 100% { transform: rotate(360deg); } }
    @keyframes popStars { 0%, 100% { transform: scale(0.65) translate(8px, 16px); } 50% { transform: scale(0.85) translate(-2px, 4px); } }
    
    /* Animation triggers only when loading-active class is present */
    .loading-active .logo-vinyl { animation: spinVinyl 1.5s linear infinite; }
    .loading-active .logo-stars { animation: popStars 1.5s ease-in-out infinite; }
    
    /* Vinyl color matches app theme with an outline */
    :root { --vinyl-fill: url(#vinyl-grad); }
  </style>

  <defs>
    <linearGradient id="vinyl-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--accent-saffron)" />
      <stop offset="100%" stop-color="var(--accent-rose)" />
    </linearGradient>
    <clipPath id="vinyl-clip">
      <circle cx="45" cy="45" r="39"/>
    </clipPath>
  </defs>

  <!-- VINYL -->
  <g class="logo-vinyl">
    <circle cx="45" cy="45" r="40" fill="var(--vinyl-fill)" stroke="var(--text-main)" stroke-width="2"/>
    
    <!-- Realistic Shine -->
    <g clip-path="url(#vinyl-clip)">
      <polygon points="45,45 15,-5 35,-5" fill="rgba(255,255,255,0.25)" />
      <polygon points="45,45 75,95 55,95" fill="rgba(255,255,255,0.15)" />
      <polygon points="45,45 95,15 95,35" fill="rgba(255,255,255,0.1)" />
      <polygon points="45,45 -5,75 -5,55" fill="rgba(255,255,255,0.1)" />
    </g>

    <path class="v-groove" d="M 20 45 A 25 25 0 0 1 45 20"/>
    <path class="v-groove" d="M 12 45 A 33 33 0 0 1 45 12"/>
    <path class="v-groove" d="M 4 45 A 41 41 0 0 1 45 4"/>
    <circle cx="45" cy="45" r="14" fill="var(--accent-gold)"/>
    <circle cx="45" cy="45" r="4" fill="var(--bg-color)"/>
  </g>

  <!-- GOLD BUBBLE -->
  <g transform="translate(40, 68)">
    <path d="M 10 0 L 70 0 C 75.5 0 80 4.5 80 10 L 80 22 C 80 27.5 75.5 32 70 32 L 50 32 L 42 42 L 36 32 L 10 32 C 4.5 32 0 27.5 0 22 L 0 10 C 0 4.5 4.5 0 10 0 Z" fill="var(--accent-gold)"/>
    <!-- STARS -->
    <g class="logo-stars" fill="var(--text-main)" transform="scale(0.65) translate(8, 16)">
      <path id="logo-star" d="M 10 2 L 12.5 7.5 L 18.5 8 L 14 12 L 15.5 18 L 10 15 L 4.5 18 L 6 12 L 1.5 8 L 7.5 7.5 Z"/>
      <use href="#logo-star" x="0" />
      <use href="#logo-star" x="18" />
      <use href="#logo-star" x="36" />
      <use href="#logo-star" x="54" />
      <use href="#logo-star" x="72" />
    </g>
  </g>
</svg>
`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject into top nav
  const navLogo = document.getElementById('nav-logo');
  if (navLogo) {
    navLogo.innerHTML = window.RasigaLogoSVG;
  }
  
  // Inject into startup loader
  const loader = document.querySelector('.logo-loader');
  if (loader) {
    loader.innerHTML = window.RasigaLogoSVG.replace('<svg ', '<svg class="loading-active" ');
    
    // Dismiss loader after minimum 1.5s to show off animation
    setTimeout(() => {
      const l = document.getElementById('startup-loader');
      if (l) {
        l.style.opacity = '0';
        setTimeout(() => l.remove(), 500);
      }
    }, 1500);
  }
});
