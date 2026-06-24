window.RasigaPages = {
  renderHome: function () {
    let trendingHTML = '';
    // Trending Logic: High ratings and high popularity
    const sorted = [...RasigaSeeds].sort((a, b) => ((Number(b.total_ratings || 0) * 2) + Number(b.avg_rating || 0)) - ((Number(a.total_ratings || 0) * 2) + Number(a.avg_rating || 0))).slice(0, 10);
    if (sorted.length === 0) {
      trendingHTML = '<div class="horizontal-scroll"><div class="skeleton skeleton-card" style="min-width:180px;"></div><div class="skeleton skeleton-card" style="min-width:180px;"></div><div class="skeleton skeleton-card" style="min-width:180px;"></div></div>';
    } else {
      let cards = '';
      sorted.forEach((s, i) => cards += RasigaComponents.SongCard(s, i));
      trendingHTML = `<div class="marquee-container" id="trending-marquee"><div class="marquee-content" id="trending-marquee-content">${cards}${cards}</div></div>`;
    }

    let reviewsHTML = '';
    if (RasigaReviews.length === 0) {
      if (window.RasigaReviewsLoaded) {
        reviewsHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); grid-column:1/-1;">No community activity yet. Be the first to leave a review!</div>';
      } else {
        reviewsHTML = '<div class="grid-reviews" style="width:100%;"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div>';
      }
    } else {
      RasigaReviews.forEach(r => reviewsHTML += RasigaComponents.ReviewCard(r));
    }

    return `
      <div class="page-home">
        <header class="hero glass page-enter">
          <div class="hero-content">
            <h1 class="hero-title">Every <span class="text-gradient">Raga.</span><br/>Every <span class="text-gradient">Voice.</span></h1>
            <p class="hero-sub">The premium musical diary for the greatest Indian songs.</p>
            <button id="cta-btn" class="btn btn-primary" onclick="location.hash='#/discover'">Start Exploring ${Icons.get('compass', { width: 18, height: 18 })}</button>
          </div>
          <div class="hero-stats">
            <div class="hs-item" onclick="location.hash='#/discover'" tabindex="0" role="button" aria-label="View Songs"><h2 id="home-stat-songs">--</h2><span>Songs</span></div>
            <div class="hs-item" onclick="location.hash='#/charts'" tabindex="0" role="button" aria-label="View Ratings"><h2 id="home-stat-ratings">--</h2><span>Ratings</span></div>
            <div class="hs-item" onclick="location.hash='#/charts'" tabindex="0" role="button" aria-label="View Languages"><h2 id="home-stat-languages">--</h2><span>Languages</span></div>
            <div class="hs-item" onclick="location.hash='#/leaderboards'" tabindex="0" role="button" aria-label="View Rasigans"><h2 id="home-stat-users">--</h2><span>Rasigans</span></div>
          </div>
        </header>

        <section class="section">
          <h2 class="section-title">Trending Now</h2>
          ${trendingHTML}
        </section>

        <section class="section">
          <h2 class="section-title">Community Pulse</h2>
          <div class="grid-reviews">${reviewsHTML}</div>
        </section>
      </div>
    `;
  },

  renderDiscover: function () {
    let topRatedHTML = '';
    let recentHTML = '';
    let languageHTML = '';
    
    if (RasigaSeeds.length === 0) {
      topRatedHTML = '<div class="horizontal-scroll" style="margin-bottom:2rem;"><div class="skeleton skeleton-card" style="min-width:180px;"></div><div class="skeleton skeleton-card" style="min-width:180px;"></div></div>';
    } else {
      // Top Rated
      const topRated = [...RasigaSeeds].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0)).slice(0, 10);
      let trCards = '';
      topRated.forEach((s, i) => trCards += RasigaComponents.SongCard(s, i));
      topRatedHTML = `<div class="horizontal-scroll" style="padding-bottom: 1rem; margin-bottom: 2rem;">${trCards}</div>`;
      
      // Recently Added
      const recent = [...RasigaSeeds].slice(-10).reverse();
      let rCards = '';
      recent.forEach((s, i) => rCards += RasigaComponents.SongCard(s, i));
      recentHTML = `<div class="horizontal-scroll" style="padding-bottom: 1rem; margin-bottom: 2rem;">${rCards}</div>`;
      
      // Languages
      const langs = ['Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada', 'Bengali', 'Punjabi'];
      languageHTML = `<div class="filter-pills" style="margin-bottom: 2rem;">
        ${langs.map(l => `<button class="filter-pill" onclick="if(window.RasigaApp && RasigaApp.executeGlobalSearch) RasigaApp.executeGlobalSearch('${l}')">${l}</button>`).join('')}
      </div>`;
    }

    return `
      <div class="page-discover">
        <h2 class="section-title">Explore</h2>
        
        <div style="position: relative; margin-bottom: 2rem; z-index: 50;">
          <div class="glass page-enter" style="padding: 1.5rem; animation-delay: 0.05s;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 class="section-title" style="margin: 0; color: var(--text-main);">Search Songs</h3>
            </div>
            <input type="text" id="discover-search-input" class="glass-input" style="width: 100%;" placeholder="Search songs..." aria-label="Search songs" oninput="if(window.RasigaApp && RasigaApp.executeGlobalSearch) RasigaApp.executeGlobalSearch(this.value, 'discover-search-input')">
          </div>

          <div id="discover-search-filter" class="custom-dropdown-container page-enter" data-value="all" style="position: absolute; top: 1.25rem; right: 1.5rem; animation-delay: 0.05s;">
            <button class="custom-dropdown-selected custom-dropdown-btn" onclick="this.parentElement.classList.toggle('open')" aria-haspopup="listbox" aria-expanded="false">
              <span class="selected-text">All</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="custom-dropdown-menu" role="listbox">
              <button class="custom-dropdown-item custom-dropdown-opt" role="option" onclick="event.stopPropagation(); RasigaApp.setSearchFilter('all', 'All', 'discover-search-filter', 'discover-search-input'); this.closest('.custom-dropdown-container').classList.remove('open');">All</button>
              <button class="custom-dropdown-item custom-dropdown-opt" role="option" onclick="event.stopPropagation(); RasigaApp.setSearchFilter('artist', 'Artist', 'discover-search-filter', 'discover-search-input'); this.closest('.custom-dropdown-container').classList.remove('open');">Artist</button>
              <button class="custom-dropdown-item custom-dropdown-opt" role="option" onclick="event.stopPropagation(); RasigaApp.setSearchFilter('song', 'Song', 'discover-search-filter', 'discover-search-input'); this.closest('.custom-dropdown-container').classList.remove('open');">Song</button>
            </div>
          </div>
        </div>
        
        <div id="discover-results-container">
          <div>
            <h3 class="section-title page-enter" style="color: var(--accent-saffron); font-size:1.8rem; font-family:'Cinzel Decorative', serif; animation-delay: 0.1s;">Browse by Language</h3>
            ${languageHTML}

            <h3 class="section-title page-enter" style="color: var(--accent-teal); font-size:1.8rem; font-family:'Cinzel Decorative', serif; animation-delay: 0.2s;">Highest Rated</h3>
            ${topRatedHTML}
            
            <h3 class="section-title page-enter" style="color: var(--text-main); font-size:1.8rem; font-family:'Cinzel Decorative', serif; animation-delay: 0.3s;">Recently Added</h3>
            ${recentHTML}
          </div>
        </div>
      </div>
    `;
  },

  renderSongPage: function (id) {
    const song = RasigaSeeds.find(s => s.id === id);
    if (!song) return '<div class="page-entity page-enter"><div class="card text-center text-muted">Song not found.</div></div>';

    const grad = RasigaComponents.getGradient(song.title);
    const ini = RasigaComponents.getInitials(song.title);

    const createArtistLinks = (artistsStr) => {
      if (!artistsStr) return '';
      return artistsStr.split(',').map(a => {
        const name = a.trim();
        return `<a href="#/artist/${encodeURIComponent(name)}" class="artist-link" style="color:var(--text-main); text-decoration:underline; text-decoration-color:rgba(255,255,255,0.2); text-underline-offset:2px; transition:color 0.2s;" onmouseover="this.style.color='var(--accent-saffron)'" onmouseout="this.style.color='var(--text-main)'">${escapeHTML(name)}</a>`;
      }).join(', ');
    };

    // Existing reviews logic + editable comment logic
    const reviews = RasigaReviews.filter(r => r.song === song.title && r.username !== RasigaData.demoUser?.username);
    let reviewsHTML = '';

    if (!RasigaData.userComments) RasigaData.userComments = {};
    const userComment = RasigaData.userComments[id];
    const userReaction = (RasigaData.userReactions || {})[`${id}_user`];

    if (userComment && RasigaData.demoUser && RasigaData.demoUser.onboarded) {
      reviewsHTML += `
        <div class="card glass page-enter" style="border: 1px solid var(--accent-saffron); animation-delay: 0.2s;">
          <div class="flex-between" style="align-items:flex-start;">
            <div class="flex-start gap-1 mb-1">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-brand); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">${(RasigaData.demoUser.displayName || 'U')[0].toUpperCase()}</div>
              <div>
                <div style="font-weight:600; font-size:0.95rem;">${RasigaData.demoUser.displayName || 'User'} (You)</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Just now</div>
              </div>
            </div>
            <div class="flex-center gap-05" style="color:var(--accent-gold); font-size:0.9rem; font-weight:600;">
              ${window.Icons ? window.Icons.get('star', { width: 14, height: 14, fill: 'currentColor' }) : ''} ${RasigaData.userRatings && RasigaData.userRatings[id] ? RasigaData.userRatings[id] : 0}
            </div>
          </div>
          <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">${escapeHTML(userComment)}</p>
          <div style="display:flex; align-items:center; gap: 1rem; margin-top: 1rem;">
            <button class="btn-react btn-like ${userReaction === 'like' ? 'anim-heart-fill' : ''}" onclick="RasigaApp.toggleLike(this, 0, '${id}_user')" aria-label="Like this review">
              ${window.Icons ? window.Icons.get('heart', { width: 16, height: 16 }) : ''}
              <span class="like-count" data-base="0" style="font-size:0.8rem;">${userReaction === 'like' ? 1 : 0}</span>
            </button>
            <button class="btn-react btn-dislike ${userReaction === 'dislike' ? 'anim-dislike-fill' : ''}" onclick="RasigaApp.toggleDislike(this, 0, '${id}_user')" aria-label="Dislike this review">
              ${window.Icons ? window.Icons.get('dislike', { width: 16, height: 16 }) : ''}
              <span class="dislike-count" data-base="0" style="font-size:0.8rem;">${userReaction === 'dislike' ? 1 : 0}</span>
            </button>
            <button class="btn-react" onclick="RasigaApp.shareComment('${id}')" aria-label="Share this review">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span style="font-size:0.8rem;">Share</span>
            </button>
          </div>
        </div>
      `;
    }

    if (reviews.length === 0 && !userComment) {
      reviewsHTML = '<p class="text-muted">No reviews yet.</p>';
    }

    if (!RasigaData.userRatings) RasigaData.userRatings = {};
    let userRating = RasigaData.userRatings[id] || 0;
    userRating = Math.round(userRating * 4) / 4; // Snap to 0.25 increments

    const starSvgEmpty = window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'none', color: 'currentColor' }) : '';
    const starSvgFilled = window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'var(--accent-gold)', color: 'transparent' }) : '';

    let ratingStarsHTML = `
      <div style="position:relative; display:inline-block; width:140px; height:28px;" class="interactive-stars" 
           onmousemove="RasigaApp.hoverRating(event, '${id}')" 
           onmouseleave="RasigaApp.leaveRating('${id}')" 
           onclick="RasigaApp.clickRating(event, '${id}')">
        <div style="display:flex; position:absolute; top:0; left:0; pointer-events:none;">
          ${Array(5).fill(0).map(() => `<span style="color:var(--text-muted); opacity:0.5; flex-shrink:0; display:flex;">${starSvgEmpty}</span>`).join('')}
        </div>
        <div id="stars-fg-${id}" style="display:flex; position:absolute; top:0; left:0; width:${(userRating / 5) * 100}%; overflow:hidden; pointer-events:none; white-space:nowrap;">
          ${Array(5).fill(0).map(() => `<span style="color:var(--accent-gold); flex-shrink:0; display:flex;">${starSvgFilled}</span>`).join('')}
        </div>
        <input type="range" min="0" max="5" step="0.25" value="${userRating}" 
               oninput="RasigaApp.setRatingInput('${id}', this.value)" 
               id="rating-slider-${id}"
               class="mobile-only-slider"
               aria-label="Rate this song from 0 to 5 stars"
               style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; margin:0;" />
      </div>
    `;

    reviewsHTML = '<div id="song-reviews-container"><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div></div>';

    let userReviewSectionHTML = '';
    if (!RasigaData.demoUser || !RasigaData.demoUser.onboarded) {
      userReviewSectionHTML = `
        <div class="card glass page-enter text-center" style="animation-delay: 0.1s;" id="user-review-section">
          <p class="text-muted mb-1">Please log in to leave a rating and review.</p>
          <button class="btn btn-primary flex-center gap-05" onclick="location.hash='#/profile'" style="padding: 0.8rem 1.5rem; margin: 0 auto;">
            ${window.Icons ? window.Icons.get('user', {width:18, height:18}) : ''} Log In to Rate
          </button>
        </div>
      `;
    } else {
      const subComponents = [
        { key: 'comp_score', label: 'Composition' },
        { key: 'vocal_score', label: 'Vocals' },
        { key: 'lyric_score', label: 'Lyrics' },
        { key: 'arr_score', label: 'Arrangement' }
      ];
      let subRatings = (RasigaData.userSubRatings && RasigaData.userSubRatings[id]) ? RasigaData.userSubRatings[id] : {};
      
      let subHTML = `<div style="display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; padding: 1rem; background:rgba(255,255,255,0.02); border-radius:var(--radius-md);">` + subComponents.map(sc => {
        let val = subRatings[sc.key] || 0;
        return `
          <div style="flex:1; min-width:120px;">
            <label style="font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between;">
              ${sc.label} <span id="val-${sc.key}-${id}">${val > 0 ? val : '-'}</span>
            </label>
            <input type="range" id="input-${sc.key}-${id}" min="0" max="5" step="0.5" value="${val}" style="width:100%; height:4px; accent-color:var(--accent-gold);" oninput="document.getElementById('val-${sc.key}-${id}').innerText = this.value > 0 ? this.value : '-'; RasigaApp.setDirtyRating('${id}');" />
          </div>
        `;
      }).join('') + `</div>`;

      const isEditing = window.RasigaData.editingReview === id;
      userReviewSectionHTML = `
        <div class="card glass page-enter" style="animation-delay: 0.1s;" id="user-review-section">
          <div class="flex-start gap-1 mb-1">
            <div class="flex-center">
              ${ratingStarsHTML}
            </div>
            <span style="font-size: 0.9rem; color: var(--text-muted);" id="user-rating-text-${id}">${userRating > 0 ? userRating + ' Stars' : 'Tap to rate'}</span>
          </div>
          ${userComment && !isEditing ? `
             <p class="mb-1" style="font-size:1rem;">${escapeHTML(userComment)}</p>
             ${subHTML}
             <button onclick="RasigaApp.editComment('${id}')" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Edit</button>
          ` : `
             ${subHTML}
             <textarea id="review-textarea-${id}" class="glass-input mb-1" placeholder="Write your review here... (Optional)" style="height: 100px; resize: vertical;" oninput="RasigaApp.setDirtyRating('${id}')">${isEditing && userComment ? escapeHTML(userComment) : ''}</textarea>
             <div style="display:flex; gap:0.5rem; align-items:center;">
               <button id="submit-review-btn-${id}" onclick="RasigaApp.submitComment('${id}')" class="btn btn-primary" ${isEditing ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>${isEditing ? 'Save Changes' : 'Save Rating'}</button>
               ${isEditing ? `<button onclick="RasigaApp.cancelEdit('${id}')" class="btn" style="background:rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Cancel</button>` : ''}
             </div>
          `}
        </div>
      `;
    }

    let listenLinkHTML = song.spotify_id ? `
      <div style="margin-top:1.5rem;">
        <iframe src="https://open.spotify.com/embed/track/${song.spotify_id}?utm_source=generator&theme=0" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>
    ` : `
      <div style="margin-top:1.5rem;">
        <a href="https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + (song.film || ''))}" target="_blank" class="btn" style="background:#1DB954; color:#fff; border:none; padding:0.5rem 1rem; border-radius:var(--radius-full); font-size:0.85rem; display:inline-flex; align-items:center; gap:0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          Listen on Spotify
        </a>
      </div>
    `;

    return `
      <div class="page-entity">
        <a href="#/discover" class="breadcrumb" onclick="window.history.back(); return false;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </a>
        <div class="glass song-header page-enter" style="animation-delay: 0s;">
          <div class="sh-art" style="background: ${song.album_art_url ? '#1e293b' : grad}; position:relative; overflow:hidden;">
             ${song.album_art_url ? `<img src="${song.album_art_url}" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; z-index:0;" alt="Cover" />` : ini}
          </div>
          <div class="sh-info">
            <h2 class="sh-title">${song.title}</h2>
            <div class="sh-meta">${song.film || 'Indie'} &bull; ${song.year}</div>
            <div class="sh-credits">
               Singer: <span>${createArtistLinks(song.singer)}</span><br>
               Music: <span>${createArtistLinks(song.composer)}</span>
               ${song.lyricist ? `<br>Lyricist: <span>${createArtistLinks(song.lyricist)}</span>` : ''}
               <div style="margin-top: 0.6rem;">
                 <button onclick="RasigaApp.openSuggestSongModal('${song.id}')" style="background:none; border:none; color:var(--text-muted); font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem; padding:0; cursor:pointer; font-family:inherit;">
                   ${window.Icons ? window.Icons.get('edit', {width: 12, height: 12}) : '✎'} Suggest Edit
                 </button>
               </div>
            </div>
            ${listenLinkHTML}
          </div>
          <div class="sh-stats">
             <div class="sh-avg">${song.avg_rating}</div>
             <div class="sh-count">${song.total_ratings} ratings</div>
          </div>
        </div>
        
        <div class="song-grid-layout">
          <div>
            <h3 class="mb-1">Your Rating & Review</h3>
            ${userReviewSectionHTML}
          </div>
          <div>
            <div class="flex-between mb-1">
              <h3 style="margin:0;">Community Reviews</h3>
              <select id="review-sort-select" onchange="RasigaApp.sortReviews('${id}', this.value)" class="glass-input" style="padding: 0.3rem 0.5rem; font-size:0.85rem; border-radius:var(--radius-sm); max-width: 150px;">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top_rated">Top Rated</option>
              </select>
            </div>
            <div>
              ${reviewsHTML}
            </div>
            <div id="load-more-reviews-container" class="text-center" style="margin-top:1rem; display:none;">
              <button class="btn" onclick="RasigaApp.loadMoreReviews('${id}')" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Load More</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderProfile: function () {
    const user = RasigaData.demoUser;

    if (!user) {
      return this.renderLogin();
    }
    if (!user.onboarded) {
      return this.renderOnboarding();
    }

    const totalXP = user.xp || 0;

    const level = RasigaData.getLevel(totalXP);
    const nextLevel = RasigaData.getNextLevel(totalXP);
    const xpPercent = Math.min(100, Math.floor((totalXP - level.minXP) / (nextLevel.minXP - level.minXP) * 100));

    let badgesHTML = '';
    RasigaData.BADGES.forEach(b => {
      badgesHTML += RasigaComponents.BadgeCard(b, user.badges.includes(b.id));
    });

    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      const getOrd = n => n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
      const mos = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${getOrd(d.getDate())} ${mos[d.getMonth()]} ${d.getFullYear()}`;
    };
    const joinedStr = formatDate(user.joinedAt);

    return `
      <div class="page-profile">
        <div class="glass profile-header page-enter" style="position:relative;">
          <button class="icon-btn" style="position:absolute; top:1rem; right:1rem;" onclick="RasigaApp.openSettings()" aria-label="Settings" title="Settings">
            ${Icons.get('settings')}
          </button>
          <div class="ph-avatar vinyl-avatar"><span class="vinyl-text">${user.avatar}</span></div>
          <div class="ph-info">
            <h2>${escapeHTML(user.displayName)}</h2>
            <p>@${user.username} &bull; Joined ${joinedStr}</p>
            ${user.bio ? `<p style="margin-top:0.5rem; font-size:0.9rem; color:var(--text-main); font-style:italic;">${escapeHTML(user.bio)}</p>` : ''}
            <div style="display:flex; justify-content:center; gap: 1.5rem; margin-top: 0.8rem; font-weight:600; color:var(--text-main);">
              <a href="#/following" style="text-decoration:none; color:inherit;"><span id="profile-following-count">...</span> <span style="color:var(--text-muted); font-weight:normal; font-size:0.85rem;">Following</span></a>
              <a href="#/followers" style="text-decoration:none; color:inherit;"><span id="profile-followers-count">...</span> <span style="color:var(--text-muted); font-weight:normal; font-size:0.85rem;">Followers</span></a>
            </div>
            <div class="ph-level mt-2">
              <div class="phl-top">
                <span class="phl-name text-gradient" style="display:flex; align-items:center; gap:0.25rem;">${level.id === 6 ? Icons.get('crown', {width:16, height:16, color:'var(--accent-gold)'}) : ''} ${level.name}</span>
                <span class="phl-xp">${totalXP} XP</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${xpPercent}%"></div></div>
              <div class="phl-bottom">Next: ${nextLevel.name}</div>
            </div>
          </div>
        </div>

        <div class="profile-stats mt-4">
          <div class="glass stat-box page-enter" style="cursor:pointer; animation-delay: 0.1s;" onclick="location.hash='#/my-reviews'"><h3>${Object.keys(RasigaData.userRatings || {}).length || user.stats?.ratings || 0}</h3><span>Ratings</span></div>
          <div class="glass stat-box page-enter" style="cursor:pointer; animation-delay: 0.15s;" onclick="location.hash='#/my-reviews'"><h3>${Object.keys(RasigaData.userComments || {}).length || user.stats?.reviews || 0}</h3><span>Reviews</span></div>
          <div class="glass stat-box page-enter" style="animation-delay: 0.2s;"><h3>${user.streak || 1}</h3><span style="display:flex; align-items:center; gap:0.25rem;">Day Streak ${Icons.get('flame', {width:14, height:14, color:'var(--accent-saffron)'})}</span></div>
        </div>

        <div class="mt-4 page-enter" style="animation-delay: 0.15s">
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3); margin-bottom: 1rem;" onclick="location.hash='#/my-lists'">
            ${Icons.get('list')} Manage My Lists
          </button>
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3); margin-bottom: 1rem;" onclick="RasigaApp.openSuggestSongModal()">
            ${Icons.get('music')} Suggest a Song
          </button>
          ${user.is_admin ? `
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; background:var(--gradient-brand-alt); border:none; margin-bottom: 1rem;" onclick="location.hash='#/admin'">
            ${Icons.get('shield')} Admin Panel
          </button>
          ` : ''}
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3);" onclick="location.hash='#/analytics'">
            ${Icons.get('barChart')} View Advanced Analytics
          </button>
        </div>

        <section class="section mt-4">
          <h2 class="section-title page-enter" style="animation-delay: 0.2s">My Public Lists</h2>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${window.RasigaLists && window.RasigaLists.filter(l => l.is_public).length > 0 
              ? window.RasigaLists.filter(l => l.is_public).slice(0, 3).map((l, i) => RasigaComponents.ListCard(l, i)).join('')
              : '<p style="color:var(--text-muted); font-size:0.9rem;">No public lists yet.</p>'}
          </div>
        </section>

        <section class="section mt-4">
          <h2 class="section-title page-enter" style="animation-delay: 0.25s">Badges & Achievements</h2>
          <div class="badges-grid">${badgesHTML}</div>
        </section>
      </div>
    `;
  },

  renderAdminPanel: function () {
    const user = RasigaData.demoUser;
    if (!user || !user.is_admin) {
      return `<div class="page-placeholder glass page-enter"><h2 class="section-title">Unauthorized</h2><p>You do not have permission to view this page.</p></div>`;
    }

    return `
      <div class="page-discover">
        <h2 class="section-title page-enter" style="animation-delay: 0s;">Admin Panel</h2>
        <div class="glass page-enter" style="padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; animation-delay: 0.1s;">
          <h3 style="margin-bottom: 1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Song Suggestions</h3>
          <div id="admin-suggestions-container" style="display:flex; flex-direction:column; gap:1rem;">
            <p style="color:var(--text-muted); text-align:center;">Loading suggestions...</p>
          </div>
        </div>
      </div>
    `;
  },

  renderLogin: function () {
    return `
      <div class="page-enter" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; padding:2rem; text-align:center;">
        <div style="width:80px; height:80px; background:var(--gradient-brand); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; color:#fff;">
          ${Icons.get('music', {width:40, height:40})}
        </div>
        <h1 style="font-family:'DM Serif Display',serif; font-size:2.5rem; margin-bottom:1rem;">Welcome to Rasiga</h1>
        <p style="color:var(--text-muted); margin-bottom:2.5rem; max-width:400px;">Join our community to rate, review, and discover the magic of Indian music.</p>
        
        <div style="display:flex; flex-direction:column; gap:1rem; width:100%; max-width:320px;">
          <!-- Google Identity Services Native Button -->
          <div id="g_id_onload"
            data-client_id="529749343576-93se8nni2ai4qgdc150bpc8ptac89ot4.apps.googleusercontent.com"
            data-context="signin"
            data-ux_mode="popup"
            data-callback="handleGoogleLogin"
            data-auto_prompt="false">
          </div>
          <div class="g_id_signin"
            data-type="standard"
            data-shape="pill"
            data-theme="outline"
            data-text="continue_with"
            data-size="large"
            data-logo_alignment="center"
            data-width="320">
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem; color:var(--text-muted);">
            <div style="flex:1; height:1px; background:var(--glass-border);"></div>
            <span style="font-size:0.85rem;">or</span>
            <div style="flex:1; height:1px; background:var(--glass-border);"></div>
          </div>

          <input id="login-email-input" type="email" placeholder="Enter your email" style="width:100%; padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none; font-size:1rem;" />
          <button class="btn btn-primary" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; font-weight:600; padding:1rem;" onclick="RasigaApp.loginWith('email')">
            ${Icons.get('mail')} Send Magic Link
          </button>
        </div>
      </div>
    `;
  },

  renderOnboarding: function () {
    return `
      <div class="page-enter" style="display:flex; flex-direction:column; align-items:center; min-height:60vh; padding:2rem;">
        <h1 style="font-family:'DM Serif Display',serif; font-size:2rem; margin-bottom:0.5rem;">Setup Your Profile</h1>
        <p style="color:var(--text-muted); margin-bottom:2rem; text-align:center;">Just a few details to personalize your experience.</p>
        
        <form onsubmit="event.preventDefault(); RasigaApp.submitOnboarding(this);" style="display:flex; flex-direction:column; gap:1.5rem; width:100%; max-width:400px;">
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Display Name</label>
            <input name="displayName" type="text" required placeholder="e.g. John Doe" style="width:100%; padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none; font-size:1rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Username</label>
            <input name="username" type="text" required placeholder="e.g. johndoe" style="width:100%; padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none; font-size:1rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.8rem;">Favorite Theme Color</label>
            <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
              <label style="cursor:pointer;"><input type="radio" name="themeColor" value="orange" checked style="position:absolute; opacity:0;" onchange="document.documentElement.setAttribute('data-theme-color', 'orange')"><div style="width:40px; height:40px; border-radius:50%; background:#f97316; border:2px solid var(--text-main);" onclick="this.parentElement.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='var(--text-main)';"></div></label>
              <label style="cursor:pointer;"><input type="radio" name="themeColor" value="red" style="position:absolute; opacity:0;" onchange="document.documentElement.setAttribute('data-theme-color', 'red')"><div style="width:40px; height:40px; border-radius:50%; background:#ef4444; border:2px solid transparent;" onclick="this.parentElement.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='var(--text-main)';"></div></label>
              <label style="cursor:pointer;"><input type="radio" name="themeColor" value="green" style="position:absolute; opacity:0;" onchange="document.documentElement.setAttribute('data-theme-color', 'green')"><div style="width:40px; height:40px; border-radius:50%; background:#10b981; border:2px solid transparent;" onclick="this.parentElement.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='var(--text-main)';"></div></label>
              <label style="cursor:pointer;"><input type="radio" name="themeColor" value="blue" style="position:absolute; opacity:0;" onchange="document.documentElement.setAttribute('data-theme-color', 'blue')"><div style="width:40px; height:40px; border-radius:50%; background:#3b82f6; border:2px solid transparent;" onclick="this.parentElement.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='var(--text-main)';"></div></label>
              <label style="cursor:pointer;"><input type="radio" name="themeColor" value="yellow" style="position:absolute; opacity:0;" onchange="document.documentElement.setAttribute('data-theme-color', 'yellow')"><div style="width:40px; height:40px; border-radius:50%; background:#eab308; border:2px solid transparent;" onclick="this.parentElement.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent'); this.style.borderColor='var(--text-main)';"></div></label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:1rem; padding:1rem; font-size:1.1rem; justify-content:center;">Complete Profile</button>
        </form>
      </div>
    `;
  },

  renderMyReviews: function () {
    let gridHTML = '';
    const userComments = RasigaData.userComments || {};
    const userRatings = RasigaData.userRatings || {};
    const userReactions = RasigaData.userReactions || {};

    // Extract song IDs from the reviewId keys (format: songId_reviewName)
    const reactedSongIds = Object.keys(userReactions).map(k => k.split('_')[0]);

    const reviewedIds = Array.from(new Set([
      ...Object.keys(userComments),
      ...Object.keys(userRatings),
      ...reactedSongIds
    ]));

    if (reviewedIds.length === 0) {
      gridHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">You haven\'t reviewed or reacted to any songs yet.</p>';
    } else {
      reviewedIds.forEach((id, i) => {
        const song = RasigaSeeds.find(s => s.id === id);
        if (song) {
          let likes = 0, dislikes = 0;
          Object.keys(userReactions).forEach(k => {
            if (k.startsWith(id + '_')) {
              if (userReactions[k] === 'like') likes++;
              if (userReactions[k] === 'dislike') dislikes++;
            }
          });
          const reactionsObj = { likes, dislikes };

          gridHTML += RasigaComponents.SongCard(song, i, userRatings[id], reactionsObj);
        }
      });
    }

    return `
      <div class="page-my-reviews">
        <div class="page-enter page-header">
          <button class="icon-btn" onclick="history.back()">${Icons.get('close')}</button>
          <h2 class="section-title page-header-title">My Ratings & Reviews</h2>
        </div>
        <p class="page-enter page-header-desc" style="animation-delay:0.1s;">Click any song to view and edit your review.</p>
        <div class="song-grid mt-4 page-enter" style="animation-delay:0.2s;">
          ${gridHTML}
        </div>

        <section class="section mt-4 page-enter" style="margin-top: 3rem; animation-delay:0.3s;">
          <div class="page-header" style="justify-content: space-between; margin-bottom: 1.5rem;">
            <h2 class="section-title page-header-title">My Suggestions</h2>
          </div>
          <div id="my-suggestions-container" class="flex-col-gap-1">
            <p style="color:var(--text-muted); text-align:center;">Loading suggestions...</p>
          </div>
        </section>
      </div>
    `;
  },

  renderPublicProfile: function(username) {
    return `
      <div class="page-entity" id="public-profile-container">
        <div class="page-enter page-header">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title page-header-title">Profile</h2>
        </div>
        <div style="text-align:center; padding: 2rem; color:var(--text-muted);">Loading profile...</div>
      </div>
    `;
  },

  renderConnections: function(type) {
    return `
      <div class="page-entity">
        <div class="page-enter page-header">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title page-header-title" style="text-transform:capitalize;">${type}</h2>
        </div>
        <div class="glass page-enter" style="padding: 1.5rem; animation-delay:0.1s;" id="connections-container">
          <div style="text-align:center; padding: 2rem; color:var(--text-muted);">Loading connections...</div>
        </div>
      </div>
    `;
  },

  renderCharts: function (langFilter = 'All') {
    let songs = [...window.RasigaSeeds || RasigaData.songs || []];
    if (songs.length === 0) return `<div class="page-placeholder glass page-enter"><h2 class="section-title">Charts</h2><p>Data loading...</p></div>`;

    // Get unique languages for filter pills
    const languages = ['All', 'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada', 'Bengali', 'Punjabi'];

    // Filter songs if a language is selected
    if (langFilter !== 'All') {
      songs = songs.filter(s => s.language.toLowerCase() === langFilter.toLowerCase());
    }

    // Top 5 Highest Rated
    const topRated = [...songs].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0)).slice(0, 5);

    // Top 5 Most Popular
    const mostPopular = [...songs].sort((a, b) => Number(b.total_ratings || 0) - Number(a.total_ratings || 0)).slice(0, 5);

    // Compute Singer and Composer Stats based on filtered songs
    const singerStats = {};
    const composerStats = {};

    songs.forEach(s => {
      if (s.singer) {
        const singers = s.singer.split(',').map(x => x.trim());
        singers.forEach(artist => {
          if (!singerStats[artist]) {
            singerStats[artist] = { total_ratings: 0, rating_sum: 0, song_count: 0 };
          }
          singerStats[artist].total_ratings += s.total_ratings;
          singerStats[artist].rating_sum += s.avg_rating; // simple sum for average stars
          singerStats[artist].song_count += 1;
        });
      }
      if (s.composer) {
        const composers = s.composer.split(',').map(x => x.trim());
        composers.forEach(artist => {
          if (!composerStats[artist]) {
            composerStats[artist] = { total_ratings: 0, rating_sum: 0, song_count: 0 };
          }
          composerStats[artist].total_ratings += s.total_ratings;
          composerStats[artist].rating_sum += s.avg_rating; // simple sum for average stars
          composerStats[artist].song_count += 1;
        });
      }
    });

    const formatStats = (statsObj) => Object.keys(statsObj).map(name => {
      const stat = statsObj[name];
      return {
        name,
        total_ratings: stat.total_ratings,
        avg_rating: stat.song_count > 0 ? (stat.rating_sum / stat.song_count).toFixed(1) : 0,
        song_count: stat.song_count
      };
    });

    const singersArr = formatStats(singerStats);
    const composersArr = formatStats(composerStats);

    const topSingersRated = [...singersArr]
      .sort((a, b) => b.avg_rating - a.avg_rating || b.total_ratings - a.total_ratings)
      .slice(0, 5);

    const topSingersPopular = [...singersArr]
      .sort((a, b) => b.total_ratings - a.total_ratings)
      .slice(0, 5);

    const topComposersRated = [...composersArr]
      .sort((a, b) => b.avg_rating - a.avg_rating || b.total_ratings - a.total_ratings)
      .slice(0, 5);

    const topComposersPopular = [...composersArr]
      .sort((a, b) => b.total_ratings - a.total_ratings)
      .slice(0, 5);

    let html = `
      <div class="page-discover" style="padding-bottom:3rem;">
        <h2 class="section-title page-enter" style="margin-bottom:0.5rem; animation-delay:0s;">Charts</h2>
        
        <div class="filter-pills page-enter" style="animation-delay:0.1s;">
          ${languages.map(lang => `
            <button class="filter-pill ${langFilter === lang ? 'active' : ''}" onclick="RasigaApp.setChartFilter('${lang}')">${lang}</button>
          `).join('')}
        </div>
        
        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:1.5rem;">
          
          <div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg); animation-delay:0.2s;">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Highest Rated Songs</h3>
            <div class="chart-grid">
              ${topRated.map((s, i) => {
                const isTop3 = i < 3;
                let rankClass = '';
                if (i === 0) { rankClass = 'text-gradient-gold'; }
                if (i === 1) { rankClass = 'text-gradient-silver'; }
                if (i === 2) { rankClass = 'text-gradient-bronze'; }
                const grad = RasigaComponents.getGradient(s.title);
                const ini = RasigaComponents.getInitials(s.title);
                return `
                <a href="#/song/${s.id}" class="song-card" style="background:transparent; border:none; box-shadow:none; padding:0; align-items:center; text-decoration:none;">
                  <div class="${rankClass}" style="font-weight:bold; font-size:1.2rem; ${isTop3 ? '' : 'color:var(--text-light);'} width:20px; text-align:center;">${i + 1}</div>
                  <div class="sc-art" style="background: ${grad};">
                    ${ini}
                  </div>
                  <div class="sc-info" style="flex:1;">
                    <div class="sc-title">${s.title}</div>
                    <div class="sc-meta">${s.film} &bull; ${s.language}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${s.avg_rating} ${Icons.get('star')}
                  </div>
                </a>
              `}).join('')}
            </div>
          </div>

          <div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg); animation-delay:0.3s;">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Songs</h3>
            <div class="chart-grid">
              ${mostPopular.map((s, i) => {
                const grad = RasigaComponents.getGradient(s.title);
                const ini = RasigaComponents.getInitials(s.title);
                return `
                <a href="#/song/${s.id}" class="song-card" style="background:transparent; border:none; box-shadow:none; padding:0; align-items:center; text-decoration:none;">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px; text-align:center;">${i + 1}</div>
                  <div class="sc-art" style="background: ${grad};">
                    ${ini}
                  </div>
                  <div class="sc-info" style="flex:1;">
                    <div class="sc-title">${escapeHTML(s.title)}</div>
                    <div class="sc-meta">${escapeHTML(s.film)}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${s.total_ratings >= 100 ? (s.total_ratings / 1000).toFixed(1) + 'k' : s.total_ratings || 0} ratings
                  </div>
                </a>
              `}).join('')}
            </div>
          </div>

        </div>

        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:2rem;">
          
          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Top Rated Singers</h3>
            <div class="chart-grid">
              ${topSingersRated.map((a, i) => `
                <a href="#/artist/${encodeURIComponent(a.name)}" style="display:flex; align-items:center; gap:1rem; cursor:pointer; transition: transform 0.2s; text-decoration:none;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHTML(a.name)}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${a.avg_rating} ${Icons.get('star')}
                  </div>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Singers</h3>
            <div class="chart-grid">
              ${topSingersPopular.map((a, i) => `
                <a href="#/artist/${encodeURIComponent(a.name)}" style="display:flex; align-items:center; gap:1rem; cursor:pointer; transition: transform 0.2s; text-decoration:none;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHTML(a.name)}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${a.total_ratings >= 100 ? (a.total_ratings / 1000).toFixed(1) + 'k' : a.total_ratings || 0} ratings
                  </div>
                </a>
              `).join('')}
            </div>
          </div>

        </div>

        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:2rem;">
          
          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Top Rated Music Directors</h3>
            <div class="chart-grid">
              ${topComposersRated.map((a, i) => `
                <a href="#/artist/${encodeURIComponent(a.name)}" style="display:flex; align-items:center; gap:1rem; cursor:pointer; transition: transform 0.2s; text-decoration:none;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHTML(a.name)}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${a.avg_rating} ${Icons.get('star')}
                  </div>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Music Directors</h3>
            <div class="chart-grid">
              ${topComposersPopular.map((a, i) => `
                <a href="#/artist/${encodeURIComponent(a.name)}" style="display:flex; align-items:center; gap:1rem; cursor:pointer; transition: transform 0.2s; text-decoration:none;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${escapeHTML(a.name)}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${a.total_ratings >= 100 ? (a.total_ratings / 1000).toFixed(1) + 'k' : a.total_ratings || 0} ratings
                  </div>
                </a>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    `;
    return html;
  },

  renderLeaderboards: function () {
    // We will render a shell and fetch the data dynamically
    setTimeout(() => {
      if (window.RasigaApp && RasigaApp.fetchLeaderboards) {
        RasigaApp.fetchLeaderboards();
      }
    }, 50);

    return `
      <div class="page-leaderboards">
        <h2 class="section-title page-enter">Leaderboards & Community</h2>
        
        <div class="glass page-enter" style="padding: 1.5rem; margin-bottom: 2rem; border-radius: var(--radius-lg); z-index: 100; position:relative; animation-delay: 0.1s;">
          <h3 style="margin-bottom: 1rem;">Find Rasigans</h3>
          <div style="display:flex; gap:0.5rem; position:relative;">
            <input type="text" id="user-search-input" class="glass-input" placeholder="Search users by name or username..." autocomplete="off" oninput="RasigaApp.searchUsers(this.value)" />
            <div id="user-search-suggestions" class="glass" style="display:none; position:absolute; top: 100%; left:0; right:0; max-height: 250px; overflow-y:auto; z-index:999; flex-direction:column; margin-top: 0.5rem; background: var(--glass-bg-frosted); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            </div>
          </div>
        </div>

        <div id="leaderboards-container" style="display:flex; flex-wrap:wrap; gap:2rem;">
           <div class="glass page-enter" style="flex:1; min-width:300px; padding:2rem; text-align:center; animation-delay: 0.2s;">
             Loading leaderboards...
           </div>
        </div>
      </div>
    `;
  },

  renderContact: function () {
    return `
      <div class="page-discover page-enter">
        <h2 class="section-title">Contact Us</h2>
        <div class="glass" style="max-width:600px; margin: 0 auto; padding: 2rem; border-radius: var(--radius-lg);">
          <form onsubmit="window.RasigaApp.submitContact(event)" style="display:flex; flex-direction:column; gap:1.5rem;">
            <div>
              <label style="display:block; margin-bottom:0.5rem; color:var(--text-muted); font-weight:600;">Subject</label>
              <input type="text" required style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:var(--radius-md); color:var(--text-main); outline:none;" placeholder="What is this regarding?">
            </div>
            <div>
              <label style="display:block; margin-bottom:0.5rem; color:var(--text-muted); font-weight:600;">Content</label>
              <textarea required rows="6" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:var(--radius-md); color:var(--text-main); outline:none; resize:vertical;" placeholder="Write your message here..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="justify-content:center; padding:1rem; font-size:1.1rem; border:none;">
              Send Message
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderDonate: function () {
    return `<div class="page-placeholder glass page-enter"><h2 class="section-title">Donate</h2><p>Support Rasiga. Donation integration coming soon...</p></div>`;
  },

  renderPrivacy: function () {
    return `<div class="page-placeholder glass page-enter"><h2 class="section-title">Privacy Policy</h2><p>Your data is yours. Privacy policy document coming soon...</p></div>`;
  },

  renderSettingsContent: function () {
    const user = RasigaData.demoUser;
    const currentColor = localStorage.getItem('rasiga_theme_color') || 'orange';

    const colors = [
      { id: 'orange', name: 'Saffron', hex: '#f97316' },
      { id: 'red', name: 'Rose', hex: '#ef4444' },
      { id: 'green', name: 'Emerald', hex: '#10b981' },
      { id: 'blue', name: 'Sapphire', hex: '#3b82f6' },
      { id: 'yellow', name: 'Gold', hex: '#eab308' }
    ];

    let colorHTML = '';
    colors.forEach(c => {
      const active = currentColor === c.id ? 'border: 3px solid var(--text-main); transform: scale(1.1);' : 'border: 2px solid transparent;';
      colorHTML += `<button onclick="RasigaApp.setColorTheme('${c.id}')" aria-label="Set theme color to ${c.name}" style="width: 45px; height: 45px; border-radius: 50%; background: ${c.hex}; cursor: pointer; transition: all 0.2s; ${active}" title="${c.name}"></button>`;
    });

    return `
      <div style="display:flex; flex-direction:column; gap: 2rem;">
        
        <div class="glass" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Edit Profile</h3>
          <div style="display:flex; flex-direction:column; gap: 1rem;">
            <div>
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.3rem;">Display Name</label>
              <input id="edit-profile-display-name" type="text" value="${escapeHTML(user.displayName)}" style="width:100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none;" />
            </div>
            <div>
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.3rem;">Bio / About Me</label>
              <textarea id="edit-profile-bio" style="width:100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none; min-height: 80px; resize: vertical;" placeholder="Tell us about your musical taste...">${user.bio ? escapeHTML(user.bio) : ''}</textarea>
            </div>
            <div>
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.3rem;">Username</label>
              <input id="edit-profile-username" type="text" value="@${user.username}" style="width:100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none; opacity: 0.7; cursor: not-allowed;" disabled />
            </div>
            <button onclick="RasigaApp.saveProfileChanges()" class="btn btn-primary" style="align-self: flex-start; margin-top: 0.5rem;">Save Changes</button>
          </div>
        </div>

        <div class="glass" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Theme Colors</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Choose your app's accent color:</p>
                    <div style="display:flex; gap: 1rem; flex-wrap: wrap;">
            ${colorHTML}
          </div>
        </div>

        <div class="glass" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(236,72,153,0.15), rgba(249,115,22,0.15)); border: 1px solid rgba(236,72,153,0.2);">
          <h3 style="margin-bottom: 0.5rem; font-family: 'DM Serif Display', serif; display: flex; align-items: center; gap: 0.5rem;">Refer Friends ${Icons.get('heart', { width: 20, height: 20 })}</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">Invite your friends to Rasiga and share the joy of discovering Indian music!</p>
          <button onclick="RasigaApp.referFriend()" class="btn" style="background: var(--text-main); color: var(--bg-color);">Refer Friends</button>
        </div>

        <div class="glass" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Account Options</h3>
          <div style="display:flex; flex-direction:column; gap: 0.8rem;">
            <button onclick="RasigaApp.mockOfflineError()" class="btn glass" style="justify-content: center; color: var(--accent-saffron); border-color: rgba(249, 115, 22, 0.3);">
              ${Icons.get('heart', { width: 16, height: 16, fill: 'currentColor' })} Donate to Rasiga
            </button>
            <button onclick="RasigaApp.logout()" class="btn glass" style="justify-content: center; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
              Log Out
            </button>
            <button onclick="RasigaComponents.confirmAction('Delete Account', 'Are you sure? This cannot be undone.', () => RasigaApp.logout())" class="btn" style="justify-content: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">
              Delete Account
            </button>
          </div>
        </div>

      </div>
    `;
  },

  renderAnalytics: function () {
    const allSongs = [...window.RasigaSeeds || []];
    const userRatings = RasigaData.userRatings || {};
    const ratedSongIds = Object.keys(userRatings);
    
    const songs = allSongs.filter(s => ratedSongIds.includes(s.id));
    
    if (songs.length === 0) {
      return `
        <div class="page-analytics">
          <div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">
            <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
            <h2 class="section-title" style="margin:0;">My Analytics</h2>
          </div>
          <div class="glass page-enter" style="padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
            You haven't rated any songs yet!<br/><br/>Rate some songs to see your personalized listening analytics here.
          </div>
        </div>
      `;
    }

    const userRatingsCount = songs.length;

    // Moods
    const moodCounts = {};
    songs.forEach(s => { (s.mood || []).forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1; }); });
    const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const moodLabels = topMoods.map(m => m[0]);
    const moodData = topMoods.map(m => m[1]);
    
    // Community Mood Data based on actual song stats
    const communityMoodTotals = {};
    let totalCommunityMoodRatings = 0;
    allSongs.forEach(s => { 
      if (s.total_ratings > 0) {
        (s.mood || []).forEach(m => { 
          communityMoodTotals[m] = (communityMoodTotals[m] || 0) + s.total_ratings; 
          totalCommunityMoodRatings += s.total_ratings;
        });
      }
    });

    const communityMoodData = moodLabels.map(m => {
      if (totalCommunityMoodRatings === 0) return 1;
      const relativePop = (communityMoodTotals[m] || 0) / totalCommunityMoodRatings;
      return Math.max(1, Math.round(relativePop * userRatingsCount * 1.5));
    });

    // Genres
    const genreCounts = {};
    songs.forEach(s => { (s.genre || []).forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }); });
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const genreLabels = topGenres.map(g => g[0]);
    const genreData = topGenres.map(g => g[1]);

    // Languages
    const langCounts = {};
    songs.forEach(s => { langCounts[s.language] = (langCounts[s.language] || 0) + 1; });
    const topLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
    const langLabels = topLangs.map(l => l[0]);
    const langData = topLangs.map(l => l[1]);

    // Composers
    const compCounts = {};
    songs.forEach(s => { if (s.composer) compCounts[s.composer] = (compCounts[s.composer] || 0) + 1; });
    const topComp = Object.entries(compCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const compLabels = topComp.map(c => c[0]);
    const compData = topComp.map(c => c[1]);

    // Singers
    const singerCounts = {};
    songs.forEach(s => {
      if (s.singer) s.singer.split(',').forEach(sing => {
        let name = sing.trim();
        singerCounts[name] = (singerCounts[name] || 0) + 1;
      });
    });
    const topSingers = Object.entries(singerCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const singerLabels = topSingers.map(c => c[0]);
    const singerData = topSingers.map(c => c[1]);

    // Decade distribution
    const decadeCounts = {};
    songs.forEach(s => {
      const decade = Math.floor(s.year / 10) * 10;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    const decadeSorted = Object.entries(decadeCounts).sort((a, b) => a[0] - b[0]);
    const decadeLabels = decadeSorted.map(d => d[0] + 's');
    const decadeData = decadeSorted.map(d => d[1]);

    // Avg rating by language
    const langRatingSum = {};
    const langRatingCnt = {};
    songs.forEach(s => {
      langRatingSum[s.language] = (langRatingSum[s.language] || 0) + s.avg_rating;
      langRatingCnt[s.language] = (langRatingCnt[s.language] || 0) + 1;
    });
    const langAvgLabels = Object.keys(langRatingSum);
    const langAvgData = langAvgLabels.map(l => +(langRatingSum[l] / langRatingCnt[l]).toFixed(2));

    // Industry breakdown
    const industryCounts = {};
    songs.forEach(s => { if (s.industry) industryCounts[s.industry] = (industryCounts[s.industry] || 0) + 1; });
    const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1]);
    const industryLabels = topIndustry.map(i => i[0]);
    const industryData = topIndustry.map(i => i[1]);

    // Summary stats
    const totalSongs = songs.length;
    const avgRating = (songs.reduce((s, c) => s + c.avg_rating, 0) / totalSongs).toFixed(1);
    const uniqueComposers = new Set(songs.map(s => s.composer).filter(Boolean)).size;
    const uniqueLangs = new Set(songs.map(s => s.language)).size;
    const oldestYear = Math.min(...songs.map(s => s.year));
    const newestYear = Math.max(...songs.map(s => s.year));

    // Chart initialization
    setTimeout(() => {
      if (typeof Chart === 'undefined') return;

      let charts = [];
      let themeObserver = null;

      const getThemeColors = () => {
        const dummy = document.createElement('div');
        dummy.style.color = 'var(--text-main)';
        dummy.style.backgroundColor = 'var(--bg-color)';
        document.body.appendChild(dummy);
        const cs = getComputedStyle(dummy);
        const tc = cs.color || '#666';
        const bg = cs.backgroundColor || '#020617';
        document.body.removeChild(dummy);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const tooltipBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        const tooltipText = isDark ? '#f8fafc' : '#0f172a';
        const mutedC = isDark ? '#94a3b8' : '#475569';
        const gridC = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        return { tc, bg, tooltipBg, tooltipText, mutedC, gridC };
      };

      const drawCharts = () => {
        charts.forEach(c => c.destroy());
        charts = [];

        const { tc, tooltipBg, tooltipText, mutedC, gridC } = getThemeColors();

        Chart.defaults.color = tc;
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 12;

        const jewel = ['#e11d48', '#f97316', '#eab308', '#10b981', '#0ea5e9', '#8b5cf6'];
        const neon = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
        const warm = ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee'];
        const cool = ['#818cf8', '#6366f1', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'];

        function makeGrad(ctx, c1, c2, vertical) {
          const g = vertical
            ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
            : ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          g.addColorStop(0, c1);
          g.addColorStop(1, c2);
          return g;
        }

        const commonTooltip = { backgroundColor: tooltipBg, titleColor: tooltipText, bodyColor: tooltipText, padding: 12, cornerRadius: 8 };

        // 1. MOOD RADAR
        const moodEl = document.getElementById('moodChart');
        if (moodEl) {
          charts.push(new Chart(moodEl, {
            type: 'radar',
            data: {
              labels: moodLabels,
              datasets: [{
                label: 'You',
                data: moodData,
                backgroundColor: 'rgba(249,115,22,0.15)',
                borderColor: '#f97316',
                borderWidth: 2.5,
                pointBackgroundColor: '#f97316',
                pointBorderColor: tooltipBg,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
              }, {
                label: 'Community',
                data: communityMoodData,
                backgroundColor: 'rgba(139,92,246,0.1)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: tooltipBg,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7
              }]
            },
            options: {
              scales: {
                r: {
                  angleLines: { color: gridC },
                  grid: { color: gridC, circular: true },
                  pointLabels: { color: tc, font: { size: 13, weight: '600' } },
                  ticks: { display: false },
                  suggestedMin: 0
                }
              },
              plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12 } } },
                tooltip: { ...commonTooltip, titleFont: { size: 14 }, bodyFont: { size: 13 } }
              },
              maintainAspectRatio: false,
              animation: { duration: 1200, easing: 'easeOutQuart' }
            }
          }));
        }

        // 2. GENRE POLAR AREA
        const genreEl = document.getElementById('genreChart');
        if (genreEl) {
          charts.push(new Chart(genreEl, {
            type: 'polarArea',
            data: {
              labels: genreLabels,
              datasets: [{
                data: genreData,
                backgroundColor: jewel.map(c => c + '99'),
                borderColor: jewel,
                borderWidth: 2
              }]
            },
            options: {
              scales: { r: { grid: { color: gridC }, ticks: { display: false } } },
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 14, font: { size: 12 } } },
                tooltip: commonTooltip
              },
              maintainAspectRatio: false,
              animation: { animateRotate: true, animateScale: true, duration: 1400 }
            }
          }));
        }

        // 3. REGIONAL PALETTE
        const langEl = document.getElementById('langChart');
        if (langEl) {
          const gradPairs = [['#f43f5e', '#fb923c'], ['#8b5cf6', '#ec4899'], ['#0ea5e9', '#10b981'], ['#eab308', '#f97316'], ['#6366f1', '#818cf8'], ['#14b8a6', '#22d3ee'], ['#e11d48', '#f472b6']];
          charts.push(new Chart(langEl, {
            type: 'bar',
            data: {
              labels: langLabels,
              datasets: [{
                data: langData,
                backgroundColor: langLabels.map((_, i) => {
                  const p = gradPairs[i % gradPairs.length];
                  return langEl.getContext('2d') ? makeGrad(langEl.getContext('2d'), p[0], p[1], false) : p[0];
                }),
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 28
              }]
            },
            options: {
              indexAxis: 'y',
              scales: {
                x: { display: false },
                y: { grid: { display: false }, ticks: { color: tc, font: { size: 13, weight: '500' } } }
              },
              plugins: { legend: { display: false }, tooltip: commonTooltip },
              maintainAspectRatio: false,
              animation: { duration: 1000, easing: 'easeOutQuart' }
            }
          }));
        }

        // 4. TOP MAESTROS
        const compEl = document.getElementById('compChart');
        if (compEl) {
          charts.push(new Chart(compEl, {
            type: 'bar',
            data: {
              labels: compLabels,
              datasets: [{
                data: compData,
                backgroundColor: neon.slice(0, compLabels.length),
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 28
              }]
            },
            options: {
              indexAxis: 'y',
              scales: {
                x: { display: false },
                y: { grid: { display: false }, ticks: { color: tc, font: { size: 13, weight: '500' } } }
              },
              plugins: { legend: { display: false }, tooltip: commonTooltip },
              maintainAspectRatio: false,
              animation: { duration: 1100, easing: 'easeOutQuart' }
            }
          }));
        }

        // 5. FAVORITE VOICES
        const singerEl = document.getElementById('singerChart');
        if (singerEl) {
          charts.push(new Chart(singerEl, {
            type: 'doughnut',
            data: {
              labels: singerLabels,
              datasets: [{
                data: singerData,
                backgroundColor: cool,
                borderWidth: 0,
                hoverOffset: 12
              }]
            },
            options: {
              cutout: '65%',
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 12 } } },
                tooltip: commonTooltip
              },
              maintainAspectRatio: false,
              animation: { animateRotate: true, duration: 1300 }
            },
            plugins: [{
              id: 'centerText',
              afterDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.font = "bold 22px 'Inter', sans-serif";
                ctx.fillStyle = tc;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const cX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const cY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                ctx.fillText(singerLabels.length, cX, cY - 10);
                ctx.font = "11px 'Inter', sans-serif";
                ctx.fillStyle = mutedC;
                ctx.fillText('Artists', cX, cY + 12);
                ctx.restore();
              }
            }]
          }));
        }

        // 6. DECADE TIMELINE
        const decadeEl = document.getElementById('decadeChart');
        if (decadeEl) {
          const dCtx = decadeEl.getContext('2d');
          const areaGrad = dCtx.createLinearGradient(0, 0, 0, dCtx.canvas.height);
          areaGrad.addColorStop(0, 'rgba(249,115,22,0.4)');
          areaGrad.addColorStop(1, 'rgba(249,115,22,0.02)');
          charts.push(new Chart(decadeEl, {
            type: 'line',
            data: {
              labels: decadeLabels,
              datasets: [{
                label: 'Songs',
                data: decadeData,
                fill: true,
                backgroundColor: areaGrad,
                borderColor: '#f97316',
                borderWidth: 3,
                pointBackgroundColor: '#f97316',
                pointBorderColor: tooltipBg,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9,
                tension: 0.4
              }]
            },
            options: {
              scales: {
                y: { display: false },
                x: { grid: { display: false }, ticks: { color: tc, font: { size: 12, weight: '500' } } }
              },
              plugins: { legend: { display: false }, tooltip: commonTooltip },
              maintainAspectRatio: false,
              animation: { duration: 1500, easing: 'easeOutQuart' }
            }
          }));
        }

        // 7. AVG RATING BY LANGUAGE
        const ratingLangEl = document.getElementById('ratingLangChart');
        if (ratingLangEl) {
          charts.push(new Chart(ratingLangEl, {
            type: 'bar',
            data: {
              labels: langAvgLabels,
              datasets: [{
                data: langAvgData,
                backgroundColor: warm.slice(0, langAvgLabels.length),
                borderRadius: 20,
                borderSkipped: false,
                barThickness: 18
              }]
            },
            options: {
              indexAxis: 'y',
              scales: {
                x: { min: 4, max: 5, grid: { color: gridC }, ticks: { color: mutedC, stepSize: 0.2 } },
                y: { grid: { display: false }, ticks: { color: tc, font: { size: 13, weight: '500' } } }
              },
              plugins: { legend: { display: false }, tooltip: commonTooltip },
              maintainAspectRatio: false,
              animation: { duration: 1200, easing: 'easeOutQuart' }
            }
          }));
        }

        // 8. INDUSTRY PIE
        const industryEl = document.getElementById('industryChart');
        if (industryEl) {
          charts.push(new Chart(industryEl, {
            type: 'pie',
            data: {
              labels: industryLabels,
              datasets: [{
                data: industryData,
                backgroundColor: jewel.slice(0, industryLabels.length),
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.3)',
                hoverOffset: 10
              }]
            },
            options: {
              plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 11 } } },
                tooltip: commonTooltip
              },
              maintainAspectRatio: false,
              animation: { animateRotate: true, animateScale: true, duration: 1400 }
            }
          }));
        }
      };

      drawCharts();

      themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.attributeName === 'data-theme') {
            if (!document.getElementById('moodChart')) {
              themeObserver.disconnect();
              return;
            }
            drawCharts();
          }
        });
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      // Animate stat counters
      document.querySelectorAll('.stat-counter').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const isDecimal = String(target).includes('.');
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        }, 30);
      });

    }, 300);

    return `
      <div style="padding-bottom:3rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <button class="icon-btn" onclick="history.back()">${Icons.get('close')}</button>
          <h2 class="section-title" style="margin-bottom:0;">Advanced Analytics</h2>
        </div>

        <!-- STAT CARDS ROW -->
        <div class="stat-card-row">
          <div class="glass page-enter stat-card">
            <div class="stat-value bg-grad-orange-pink"><span class="stat-counter" data-target="${totalSongs}">0</span></div>
            <div class="stat-label">Songs Rated</div>
          </div>
          <div class="glass page-enter stat-card">
            <div class="stat-value bg-grad-purple-blue"><span class="stat-counter" data-target="${avgRating}">0</span></div>
            <div class="stat-label">Avg Rating</div>
          </div>
          <div class="glass page-enter stat-card">
            <div class="stat-value bg-grad-green-blue"><span class="stat-counter" data-target="${uniqueComposers}">0</span></div>
            <div class="stat-label">Composers</div>
          </div>
          <div class="glass page-enter stat-card">
            <div class="stat-value bg-grad-yellow-orange"><span class="stat-counter" data-target="${uniqueLangs}">0</span></div>
            <div class="stat-label">Languages</div>
          </div>
          <div class="glass page-enter stat-card">
            <div class="stat-value bg-grad-red-orange" style="font-size:1.6rem;">${oldestYear}\u2013${newestYear}</div>
            <div class="stat-label">Era Span</div>
          </div>
        </div>

        <!-- ROW 1: Musical DNA + Genre -->
        <div class="grid-2">
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-orange-pink">Musical DNA</h3>
            <p class="chart-desc">Your emotional fingerprint vs. the community.</p>
            <div class="chart-container-lg"><canvas id="moodChart"></canvas></div>
          </div>
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-green-cyan">Genre Universe</h3>
            <p class="chart-desc">The sonic territory you explore.</p>
            <div class="chart-container-lg"><canvas id="genreChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 2: Timeline + Regional -->
        <div class="grid-2">
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-yellow-orange">Time Machine</h3>
            <p class="chart-desc">Songs across the decades.</p>
            <div class="chart-container"><canvas id="decadeChart"></canvas></div>
          </div>
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-red-purple">Regional Palette</h3>
            <p class="chart-desc">Languages you gravitate towards.</p>
            <div class="chart-container"><canvas id="langChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 3: Maestros + Voices -->
        <div class="grid-2">
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-pink-yellow">Top Maestros</h3>
            <p class="chart-desc">The music directors who shape your taste.</p>
            <div class="chart-container"><canvas id="compChart"></canvas></div>
          </div>
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-pink-purple">Favorite Voices</h3>
            <p class="chart-desc">The singers who define your sonic identity.</p>
            <div class="chart-container-md"><canvas id="singerChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 4: Quality Index + Industry -->
        <div class="grid-2">
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-red-yellow">Quality Index</h3>
            <p class="chart-desc">Average rating by language &mdash; who tops your chart?</p>
            <div class="chart-container"><canvas id="ratingLangChart"></canvas></div>
          </div>
          <div class="glass page-enter card-glass">
            <h3 class="chart-title bg-grad-red-green">Industry Map</h3>
            <p class="chart-desc">Your exploration across film industries.</p>
            <div class="chart-container-md"><canvas id="industryChart"></canvas></div>
          </div>
        </div>

      </div>
    `;
  },

  renderMyLists: function () {
    const user = RasigaData.demoUser;
    if (!user || !user.onboarded) {
      return this.renderLogin();
    }
    const lists = window.RasigaLists || [];
    let listsHTML = lists.length === 0 ? RasigaComponents.EmptyState('list', 'No Lists Yet', 'You haven\'t created any custom lists. Go to any song and click the + button to start curating!') : lists.map((l, i) => RasigaComponents.ListCard(l, i, true)).join('');

    return `
      <div class="page-lists page-enter">
        <div class="page-header" style="justify-content: space-between; margin-bottom: 1rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title page-header-title">My Lists</h2>
        </div>
        <div class="flex-col-gap-1">
          ${listsHTML}
        </div>
      </div>
    `;
  },

  renderListDetails: function (listId) {
    const list = (window.RasigaLists || []).find(l => l.id === listId);
    if (!list) return `<div class="page-placeholder glass page-enter"><h2 class="section-title">List Not Found</h2></div>`;
    
    const allSongs = window.RasigaSeeds || [];
    const listSongIds = (list.list_songs || []).map(ls => ls.song_id);
    const songsInList = allSongs.filter(s => listSongIds.includes(s.id));

    const songCardsHTML = songsInList.length === 0 
      ? RasigaComponents.EmptyState('music', 'List is Empty', 'There are no songs in this list yet.')
      : songsInList.map((song, i) => {
          const userRating = RasigaData.userRatings && RasigaData.userRatings[song.id] ? RasigaData.userRatings[song.id] : null;
          return `
            <div style="position:relative;">
              ${RasigaComponents.SongCard(song, i, userRating)}
              ${list.user_id === RasigaData.demoUser?.id ? `<button class="icon-btn" style="position:absolute; top:0.5rem; right:2.5rem; color:var(--accent-rose); z-index:10; background:var(--glass-bg); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 1px solid var(--glass-border);" onclick="event.stopPropagation(); RasigaApp.removeSongFromList('${list.id}', '${song.id}')" title="Remove from List">${window.Icons ? window.Icons.get('trash', {width:14, height:14}) : '🗑️'}</button>` : ''}
            </div>
          `;
        }).join('');

    return `
      <div class="page-list-details">
        <div class="page-enter page-header" style="animation-delay: 0s;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <div style="flex:1;">
            <h2 class="section-title page-header-title">${list.name}</h2>
            <div style="font-size:0.9rem; color:var(--text-muted); margin-top:0.2rem;">${list.is_public ? 'Public' : 'Private'} List &bull; ${songsInList.length} songs</div>
          </div>
        </div>
        <div class="discover-grid">
          ${songCardsHTML}
        </div>
      </div>
    `;
  },

  renderArtistPage: function (name) {
    if (!name) return `<div class="page-placeholder glass page-enter"><h2 class="section-title">Artist Not Found</h2></div>`;
    
    const allSongs = window.RasigaSeeds || [];
    const lowerName = name.toLowerCase();
    
    // Filter songs where artist is singer, composer, or lyricist
    const artistSongs = allSongs.filter(s => {
      const isSinger = s.singer && s.singer.toLowerCase().includes(lowerName);
      const isComposer = s.composer && s.composer.toLowerCase().includes(lowerName);
      const isLyricist = s.lyricist && s.lyricist.toLowerCase().includes(lowerName);
      return isSinger || isComposer || isLyricist;
    });

    if (artistSongs.length === 0) {
      return `
        <div class="page-list-details">
          <div class="page-enter page-header">
            <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
            <h2 class="section-title page-header-title">${escapeHTML(name)}</h2>
          </div>
          ${RasigaComponents.EmptyState('user', 'No Songs Found', 'We could not find any songs credited to this artist.')}
        </div>
      `;
    }

    // Compute stats
    const totalSongs = artistSongs.length;
    let totalRatings = 0;
    let ratingSum = 0;
    
    artistSongs.forEach(s => {
      if (s.avg_rating && s.total_ratings) {
        totalRatings += s.total_ratings;
        ratingSum += (s.avg_rating * s.total_ratings);
      }
    });
    
    const avgRating = totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 0;

    const songCardsHTML = artistSongs.map((song, i) => {
      const userRating = RasigaData.userRatings && RasigaData.userRatings[song.id] ? RasigaData.userRatings[song.id] : null;
      return RasigaComponents.SongCard(song, i, userRating);
    }).join('');

    return `
      <div class="page-list-details">
        <a href="#/discover" class="breadcrumb" onclick="window.history.back(); return false;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </a>
        <div class="glass song-header page-enter" style="animation-delay: 0s;">
          <div class="sh-art" style="background: linear-gradient(135deg, var(--accent-saffron), var(--accent-rose)); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; color:white;">
            ${window.Icons ? window.Icons.get('artist', {width: 48, height: 48}) : ''}
          </div>
          <div class="sh-info">
            <h2 class="sh-title" style="margin-bottom:0.5rem;">${escapeHTML(name)}</h2>
            <div style="font-size:0.9rem; color:var(--text-light); margin-bottom: 1rem;">
              Artist Profile
            </div>
            <div style="display: flex; gap: 2rem;">
              <div>
                <div style="font-size:1.5rem; font-family:'Cinzel Decorative', serif; font-weight:bold; color:var(--text-main);">${totalSongs}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Songs</div>
              </div>
              <div>
                <div style="font-size:1.5rem; font-family:'Cinzel Decorative', serif; font-weight:bold; color:var(--accent-gold);">${avgRating}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        <h3 class="section-title page-enter" style="margin-bottom:1.5rem; animation-delay: 0.1s;">Credited Songs</h3>
        <div class="discover-grid page-enter" style="animation-delay: 0.15s;">
          ${songCardsHTML}
        </div>
      </div>
    `;
  }
};

