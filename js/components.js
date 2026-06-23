window.RasigaComponents = {
  // Utility for gradients
  getGradient: function(title) {
    const p = [
      'linear-gradient(135deg, var(--accent-saffron), var(--accent-rose))',
      'linear-gradient(135deg, var(--accent-teal), #10b981)',
      'linear-gradient(135deg, #8b5cf6, var(--accent-rose))',
      'linear-gradient(135deg, var(--accent-gold), var(--accent-saffron))',
      'linear-gradient(135deg, #3b82f6, var(--accent-teal))'
    ];
    let sum = 0;
    for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i);
    return p[sum % p.length];
  },

  getInitials: function(title) {
    const w = title.split(' ');
    return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : title.substring(0, 2).toUpperCase();
  },

  // ── UI Components ──
  SongCard: function(song, delayIdx = 0, userRating = null, reactionsObj = null) {
    const grad = this.getGradient(song.title);
    const ini = this.getInitials(song.title);
    const delay = delayIdx * 0.05;
    
    const artHTML = song.album_art_url 
      ? `<img src="${song.album_art_url}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; position:absolute; top:0; left:0; z-index:0;" loading="lazy" alt="${song.title} Cover" />` 
      : ini;

    return `
      <div class="glass song-card page-enter" style="animation-delay: ${delay}s;" onclick="RasigaApp.openSong('${song.id}')">
        <button class="icon-btn sc-add-btn" onclick="event.stopPropagation(); RasigaApp.openListModal('${song.id}')" title="Add to List">
          ${Icons.get('plus', {width: 16, height: 16})}
        </button>
        <div class="sc-art" style="background: ${song.album_art_url ? '#1e293b' : grad}; position:relative;">
          ${artHTML}
          <div class="sc-play-overlay">
            <button class="sc-play-btn">${Icons.get('play', {fill: 'currentColor'})}</button>
          </div>
        </div>
        <div class="sc-info">
          <div class="sc-title">${song.title}</div>
          <div class="sc-meta">${song.film || 'Indie'} &bull; ${song.year}</div>
          <div class="sc-rating">
            <span class="sc-rating-main">${Icons.get('star', {width: 14, height: 14, fill: 'currentColor', color: 'var(--accent-gold)'})} ${userRating !== null && userRating !== undefined ? userRating + ' (You)' : (song.total_ratings === 0 ? 'New' : song.avg_rating)}</span>
            ${reactionsObj && reactionsObj.likes > 0 ? `<span class="sc-reaction sc-reaction-like" title="You liked ${reactionsObj.likes} review(s)">${Icons.get('heart', {width:14, height:14, fill:'currentColor'})} ${reactionsObj.likes}</span>` : ''}
            ${reactionsObj && reactionsObj.dislikes > 0 ? `<span class="sc-reaction sc-reaction-dislike" title="You disliked ${reactionsObj.dislikes} review(s)">${Icons.get('dislike', {width:14, height:14, fill:'currentColor'})} ${reactionsObj.dislikes}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  ListCard: function(list, delayIdx = 0, isOwner = false) {
    const delay = delayIdx * 0.05;
    const songCount = (list.list_songs || []).length;
    const firstLetters = list.name.substring(0, 2).toUpperCase();
    return `
      <div class="glass list-card page-enter" style="animation-delay: ${delay}s;" onclick="location.hash='#/list/${list.id}'">
        ${isOwner ? `<button class="icon-btn lc-delete-btn" onclick="event.stopPropagation(); RasigaApp.deleteList('${list.id}')" title="Delete List">${Icons.get('trash', {width: 16, height: 16})}</button>` : ''}
        <div class="lc-art">
          ${firstLetters}
        </div>
        <div class="lc-info">
          <h3 class="lc-title">${list.name}</h3>
          <div class="lc-meta">
            <span>${songCount} song${songCount !== 1 ? 's' : ''}</span>
            <span>&bull;</span>
            <span>${list.is_public ? 'Public' : `<span style="display:inline-flex;align-items:center;gap:0.2rem;">${Icons.get('lock', {width:12, height:12})} Private</span>`}</span>
          </div>
        </div>
      </div>
    `;
  },

  BadgeCard: function(badge, isUnlocked) {
    const cls = isUnlocked ? 'unlocked' : 'locked';
    return `
      <div class="badge-card page-enter ${cls}" onclick="this.classList.toggle('flipped')">
        <div class="bc-inner">
          <div class="bc-front glass">
            <div class="bc-icon">${Icons.get(badge.icon)}</div>
            <div class="bc-info">
              <div class="bc-name">${badge.name}</div>
            </div>
          </div>
          <div class="bc-back glass">
            <div class="bc-desc">${badge.desc}</div>
            <div style="font-size: 0.75rem; color: var(--accent-gold); margin-top: 0.5rem;">+${badge.xp || 0} XP</div>
          </div>
        </div>
      </div>
    `;
  },

  ReviewCard: function(review) {
    const songObj = window.RasigaSeeds ? window.RasigaSeeds.find(s => s.title === review.song) : null;
    const link = songObj ? '#/song/' + songObj.id : '#/discover';
    return `
      <div class="glass review-card page-enter" onclick="location.hash='${link}'">
        <div class="rc-header">
          <div class="rc-avatar" style="background: ${review.clr}; cursor: pointer;" onclick="if('${review.username}' && '${review.username}' !== 'undefined') { event.stopPropagation(); location.hash='#/user/${review.username}'; }">${escapeHTML(review.name[0])}</div>
          <div class="rc-user-info">
            <div class="rc-name" style="cursor: pointer;" onclick="if('${review.username}' && '${review.username}' !== 'undefined') { event.stopPropagation(); location.hash='#/user/${review.username}'; }">${escapeHTML(review.name)}</div>
            <div class="rc-meta">Reviewed <b>${escapeHTML(review.song)}</b> &bull; ${Icons.get('star', {width:12, height:12, fill:'var(--accent-gold)', color:'var(--accent-gold)'})} ${review.rating}</div>
          </div>
        </div>
        <div class="rc-body">
          ${escapeHTML(review.text)}
          ${review.quote ? `<div class="rc-quote">${escapeHTML(review.quote)}</div>` : ''}
        </div>
        <div class="rc-actions">
          <button class="btn-react btn-like" onclick="event.stopPropagation(); RasigaApp.toggleLike(this, ${review.likes})">
            ${Icons.get('heart', {width: 16, height: 16})}
            <span class="like-count" data-base="${review.likes}" style="font-size:0.8rem;">${review.likes}</span>
          </button>
          <button class="btn-react btn-dislike" onclick="event.stopPropagation(); RasigaApp.toggleDislike(this, ${review.name.length % 3})">
            ${Icons.get('dislike', {width: 16, height: 16})}
            <span class="dislike-count" data-base="${review.name.length % 3}" style="font-size:0.8rem;">${review.name.length % 3}</span>
          </button>
          <button class="btn-react" onclick="event.stopPropagation(); RasigaApp.shareComment('${songObj ? songObj.id : ''}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            <span style="font-size:0.8rem;">Share</span>
          </button>
        </div>
      </div>
    `;
  },

  EmptyState: function(iconName, title, message) {
    return `
      <div class="empty-state">
        <div class="es-icon">
          ${window.Icons ? window.Icons.get(iconName, {width:32, height:32}) : ''}
        </div>
        <h3 class="es-title">${title}</h3>
        <p class="es-message">${message}</p>
      </div>
    `;
  },

  confirmAction: function(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';
    
    overlay.innerHTML = `
      <div class="glass" style="max-width:400px; width:90%; padding:2rem; border-radius:var(--radius-lg); text-align:center;">
        <h3 style="margin-bottom:0.5rem; font-family:'DM Serif Display',serif; font-size:1.5rem;">${escapeHTML(title)}</h3>
        <p style="color:var(--text-muted); margin-bottom:1.5rem; line-height:1.5;">${escapeHTML(message)}</p>
        <div style="display:flex; gap:1rem; justify-content:center;">
          <button class="btn" id="confirm-cancel" style="flex:1;">Cancel</button>
          <button class="btn btn-primary" id="confirm-ok" style="flex:1;">Confirm</button>
        </div>
      </div>`;
    
    document.body.appendChild(overlay);
    
    overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-ok').onclick = () => { 
      overlay.remove(); 
      if (onConfirm) onConfirm(); 
    };
  },

  fireConfetti: function() {
    const colors = ['#f97316', '#e11d48', '#fbbf24', '#10b981', '#0ea5e9'];
    const maxConfetti = 50;
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    document.body.appendChild(container);
    
    for(let i=0; i<maxConfetti; i++) {
      const conf = document.createElement('div');
      conf.style.position = 'absolute';
      conf.style.width = Math.random() * 8 + 4 + 'px';
      conf.style.height = Math.random() * 8 + 4 + 'px';
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.top = '-10px';
      conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      conf.style.opacity = Math.random() + 0.5;
      
      const duration = Math.random() * 2 + 2;
      conf.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94), top ${duration}s ease-in, opacity ${duration}s ease-out`;
      
      container.appendChild(conf);
      
      setTimeout(() => {
        conf.style.top = '100vh';
        conf.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 200 - 100}px)`;
        conf.style.opacity = '0';
      }, 50);
    }
    
    setTimeout(() => container.remove(), 5000);
  },

  showOnboardingCarousel: function() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'var(--glass-bg-frosted)';
    overlay.style.backdropFilter = 'blur(24px)';
    overlay.style.zIndex = '100000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '2rem';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s ease';

    const slides = [
      { title: 'Welcome to Rasiga', desc: 'Your personal music journal and discovery platform.', icon: 'star' },
      { title: 'Rate & Review', desc: 'Keep track of songs you love. Share your thoughts with the community.', icon: 'user' },
      { title: 'Earn Badges', desc: 'Unlock achievements as you explore, rate, and engage with music.', icon: 'music' }
    ];

    let currentSlide = 0;

    const renderSlide = () => {
      const slide = slides[currentSlide];
      return `
        <div class="glass" style="max-width: 400px; width: 100%; padding: 2.5rem 2rem; text-align: center; border-radius: var(--radius-lg); position: relative;">
          <div style="color: var(--accent-saffron); margin-bottom: 1.5rem;">
            ${window.Icons ? window.Icons.get(slide.icon, {width: 64, height: 64}) : ''}
          </div>
          <h2 style="font-family: 'DM Serif Display', serif; font-size: 2rem; margin-bottom: 1rem;">${slide.title}</h2>
          <p style="color: var(--text-muted); margin-bottom: 2.5rem; line-height: 1.6;">${slide.desc}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 0.5rem;">
              ${slides.map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i === currentSlide ? 'var(--accent-saffron)' : 'var(--glass-border)'}; transition: background 0.3s;"></div>`).join('')}
            </div>
            <button id="carousel-next-btn" class="btn btn-primary" style="padding: 0.6rem 1.5rem;">
              ${currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      `;
    };

    overlay.innerHTML = renderSlide();
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => overlay.style.opacity = '1');

    const attachEvents = () => {
      const btn = overlay.querySelector('#carousel-next-btn');
      if (btn) {
        btn.onclick = () => {
          if (currentSlide < slides.length - 1) {
            currentSlide++;
            overlay.innerHTML = renderSlide();
            attachEvents();
          } else {
            localStorage.setItem('rasiga_onboarded_carousel', 'true');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 400);
          }
        };
      }
    };
    
    attachEvents();
  }
};
