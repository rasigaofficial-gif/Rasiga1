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
    return `
      <div class="glass song-card page-enter" style="animation-delay: ${delay}s" onclick="RasigaApp.openSong('${song.id}')">
        <div class="sc-art" style="background: ${grad}">
          ${ini}
          <div class="sc-play-overlay">
            <button class="sc-play-btn">${Icons.get('play', {fill: 'currentColor'})}</button>
          </div>
        </div>
        <div class="sc-info">
          <div class="sc-title">${song.title}</div>
          <div class="sc-meta">${song.film || 'Indie'} &bull; ${song.year}</div>
          <div class="sc-rating" style="display:flex; gap:0.6rem; align-items:center;">
            <span style="display:flex; align-items:center; gap:0.2rem;">${Icons.get('star', {width: 14, height: 14, fill: 'currentColor', color: 'var(--accent-gold)'})} ${userRating !== null && userRating !== undefined ? userRating + ' (You)' : (song.total_ratings === 0 ? 'New' : song.avg_rating)}</span>
            ${reactionsObj && reactionsObj.likes > 0 ? `<span style="color:var(--accent-rose); display:flex; align-items:center; gap:0.2rem;" title="You liked ${reactionsObj.likes} review(s)">${Icons.get('heart', {width:14, height:14, fill:'currentColor'})} ${reactionsObj.likes}</span>` : ''}
            ${reactionsObj && reactionsObj.poops > 0 ? `<span style="color:#8b4513; display:flex; align-items:center; gap:0.2rem;" title="You disliked ${reactionsObj.poops} review(s)">${Icons.get('poop', {width:14, height:14, fill:'currentColor'})} ${reactionsObj.poops}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  BadgeCard: function(badge, isUnlocked) {
    const cls = isUnlocked ? 'unlocked' : 'locked';
    return `
      <div class="glass badge-card ${cls}">
        <div class="bc-icon">${Icons.get(badge.icon)}</div>
        <div class="bc-info">
          <div class="bc-name">${badge.name}</div>
          <div class="bc-desc">${badge.desc}</div>
        </div>
      </div>
    `;
  },

  ReviewCard: function(review) {
    const songObj = window.RasigaSeeds ? window.RasigaSeeds.find(s => s.title === review.song) : null;
    const link = songObj ? '#/song/' + songObj.id : '#/discover';
    return `
      <div class="glass review-card" style="cursor:pointer;" onclick="location.hash='${link}'">
        <div class="rc-header">
          <div class="rc-avatar" style="background: ${review.clr}">${review.name[0]}</div>
          <div class="rc-user-info">
            <div class="rc-name">${review.name}</div>
            <div class="rc-meta">Reviewed <b>${review.song}</b> &bull; ${Icons.get('star', {width:12, height:12, fill:'var(--accent-gold)', color:'var(--accent-gold)'})} ${review.rating}</div>
          </div>
        </div>
        <div class="rc-body">
          ${review.text}
          ${review.quote ? `<div class="rc-quote">${review.quote}</div>` : ''}
        </div>
        <div class="rc-actions" style="display:flex; align-items:center; gap:1rem; margin-top: 0.5rem;">
          <button class="btn-react btn-like" onclick="event.stopPropagation(); RasigaApp.toggleLike(this, ${review.likes})">
            ${Icons.get('heart', {width: 16, height: 16})}
            <span class="like-count" data-base="${review.likes}" style="font-size:0.8rem;">${review.likes}</span>
          </button>
          <button class="btn-react btn-poop" onclick="event.stopPropagation(); RasigaApp.togglePoop(this, ${review.name.length % 3})">
            ${Icons.get('poop', {width: 16, height: 16})}
            <span class="poop-count" data-base="${review.name.length % 3}" style="font-size:0.8rem;">${review.name.length % 3}</span>
          </button>
          <button class="btn-react" onclick="event.stopPropagation(); RasigaApp.shareComment('${songObj ? songObj.id : ''}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            <span style="font-size:0.8rem;">Share</span>
          </button>
        </div>
      </div>
    `;
  }
};
