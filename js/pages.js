window.RasigaPages = {
  renderHome: function () {
    let trendingHTML = '';
    // Trending Logic: High ratings and high popularity
    const sorted = [...RasigaSeeds].sort((a, b) => ((Number(b.total_ratings || 0) * 2) + Number(b.avg_rating || 0)) - ((Number(a.total_ratings || 0) * 2) + Number(a.avg_rating || 0))).slice(0, 10);
    if (sorted.length === 0) {
      trendingHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); width:100%;">Loading songs...</div>';
    } else {
      let cards = '';
      sorted.forEach((s, i) => cards += RasigaComponents.SongCard(s, i));
      trendingHTML = `<div class="marquee-container"><div class="marquee-content">${cards}${cards}</div></div>`;
    }

    let reviewsHTML = '';
    if (RasigaReviews.length === 0) {
      if (window.RasigaReviewsLoaded) {
        reviewsHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); grid-column:1/-1;">No community activity yet. Be the first to leave a review!</div>';
      } else {
        reviewsHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); grid-column:1/-1;">Loading community pulse...</div>';
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
            <div class="hs-item"><h2 id="home-stat-ratings">--</h2><span>Ratings</span></div>
            <div class="hs-item"><h2 id="home-stat-languages">--</h2><span>Languages</span></div>
            <div class="hs-item"><h2 id="home-stat-users">--</h2><span>Rasigans</span></div>
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
      topRatedHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); width:100%;">Loading songs...</div>';
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
        ${langs.map(l => `<button class="filter-pill" onclick="document.getElementById('search-input').value='${l}'; RasigaApp.selectFilter('all', 'All'); RasigaApp.executeSearch();">${l}</button>`).join('')}
      </div>`;
    }

    return `
      <div class="page-discover">
        <h2 class="section-title">Explore</h2>
        
        <div class="glass page-enter" style="padding: 1rem; margin-bottom: 1.5rem; position: relative; z-index: 101; overflow: visible !important;">
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <div id="custom-filter-dropdown" tabindex="0" onblur="setTimeout(()=>document.getElementById('filter-options').style.display='none', 150)" style="position:relative; outline:none; min-width: 140px; z-index: 1000; font-family: 'Inter', sans-serif;">
              <div id="filter-selected" onclick="const el=document.getElementById('filter-options'); el.style.display=el.style.display==='none'?'flex':'none';" style="background: color-mix(in srgb, var(--bg-color) 30%, transparent); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: var(--radius-sm); padding: 0.8rem 2.5rem 0.8rem 1rem; outline: none; cursor: pointer; background-image: url('data:image/svg+xml;utf8,<svg fill=%22%23999%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/></svg>'); background-repeat: no-repeat; background-position: right 0.5rem center; height:100%; display:flex; align-items:center; font-size: 1rem;">
                <span id="filter-selected-text">All</span>
              </div>
              <div id="filter-options" class="glass" style="display:none; position:absolute; top: 100%; left:0; width:100%; flex-direction:column; margin-top: 0.3rem; border-radius: var(--radius-sm); z-index:1001; padding: 0.3rem; background: color-mix(in srgb, var(--bg-color) 90%, transparent); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <div onclick="RasigaApp.selectFilter('all', 'All')" style="padding: 0.8rem 1rem; cursor:pointer; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(150,150,150,0.2)'" onmouseout="this.style.background='transparent'">All</div>
                <div onclick="RasigaApp.selectFilter('singer', 'Singer')" style="padding: 0.8rem 1rem; cursor:pointer; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(150,150,150,0.2)'" onmouseout="this.style.background='transparent'">Singer</div>
                <div onclick="RasigaApp.selectFilter('composer', 'Music Director')" style="padding: 0.8rem 1rem; cursor:pointer; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(150,150,150,0.2)'" onmouseout="this.style.background='transparent'">Music Director</div>
                <div onclick="RasigaApp.selectFilter('film', 'Movie')" style="padding: 0.8rem 1rem; cursor:pointer; border-radius:4px; transition:background 0.2s;" onmouseover="this.style.background='rgba(150,150,150,0.2)'" onmouseout="this.style.background='transparent'">Movie</div>
              </div>
            </div>
            <div style="flex:1; position:relative;">
              <input type="text" id="search-input" placeholder="Search for songs, artists, movies..." autocomplete="off" style="width: 100%; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none; font-size: 1rem;" oninput="RasigaApp.handleSearchInput(event)" onkeydown="if(event.key==='Enter') RasigaApp.executeSearch()" />
              <div id="search-suggestions" class="glass" style="display:none; position:absolute; top: 100%; left:0; right:0; max-height: 250px; overflow-y:auto; z-index:999; flex-direction:column; margin-top: 0.5rem; background: color-mix(in srgb, var(--bg-color) 85%, transparent); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <!-- Suggestions injected here -->
              </div>
            </div>
            <button onclick="RasigaApp.executeSearch()" class="btn btn-primary" style="border-radius: var(--radius-sm); padding: 0.8rem 1.2rem;">
              ${window.Icons ? window.Icons.get('search') : 'Search'}
            </button>
          </div>
        </div>

        <div id="discover-results-container">
          <div class="page-enter" style="animation-delay: 0.2s;">
            <h3 style="margin-bottom: 1rem; font-family: 'Cinzel Decorative', serif; color: var(--accent-saffron);">Browse by Language</h3>
            ${languageHTML}

            <h3 style="margin-bottom: 1rem; font-family: 'Cinzel Decorative', serif; color: var(--accent-teal);">Highest Rated</h3>
            ${topRatedHTML}
            
            <h3 style="margin-bottom: 1rem; font-family: 'Cinzel Decorative', serif; color: var(--text-main);">Recently Added</h3>
            ${recentHTML}
          </div>
        </div>
      </div>
    `;
  },

  renderSongPage: function (id) {
    const song = RasigaSeeds.find(s => s.id === id);
    if (!song) return '<div class="page-entity page-enter"><div style="padding: 2rem; text-align: center; color: var(--text-muted);">Song not found.</div></div>';

    const grad = RasigaComponents.getGradient(song.title);
    const ini = RasigaComponents.getInitials(song.title);

    // Existing reviews logic + editable comment logic
    const reviews = RasigaReviews.filter(r => r.song === song.title);
    let reviewsHTML = '';

    if (!RasigaData.userComments) RasigaData.userComments = {};
    const userComment = RasigaData.userComments[id];
    const userReaction = (RasigaData.userReactions || {})[`${id}_user`];

    if (userComment && RasigaData.demoUser && RasigaData.demoUser.onboarded) {
      reviewsHTML += `
        <div class="glass" style="padding: 1.2rem; margin-bottom: 1rem; border: 1px solid var(--accent-saffron);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom: 0.8rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-brand); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">${(RasigaData.demoUser.displayName || 'U')[0].toUpperCase()}</div>
              <div>
                <div style="font-weight:600; font-size:0.95rem;">${RasigaData.demoUser.displayName || 'User'} (You)</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Just now</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.2rem; color:var(--accent-gold); font-size:0.9rem; font-weight:600;">
              ${window.Icons ? window.Icons.get('star', { width: 14, height: 14, fill: 'currentColor' }) : ''} ${RasigaData.userRatings && RasigaData.userRatings[id] ? RasigaData.userRatings[id] : 0}
            </div>
          </div>
          <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">${userComment}</p>
          <div style="display:flex; align-items:center; gap: 1rem; margin-top: 1rem;">
            <button class="btn-react btn-like ${userReaction === 'like' ? 'anim-heart-fill' : ''}" onclick="RasigaApp.toggleLike(this, 0, '${id}_user')">
              ${window.Icons ? window.Icons.get('heart', { width: 16, height: 16 }) : ''}
              <span class="like-count" data-base="0" style="font-size:0.8rem;">${userReaction === 'like' ? 1 : 0}</span>
            </button>
            <button class="btn-react btn-poop ${userReaction === 'poop' ? 'anim-poop-fill' : ''}" onclick="RasigaApp.togglePoop(this, 0, '${id}_user')">
              ${window.Icons ? window.Icons.get('poop', { width: 16, height: 16 }) : ''}
              <span class="poop-count" data-base="0" style="font-size:0.8rem;">${userReaction === 'poop' ? 1 : 0}</span>
            </button>
            <button class="btn-react" onclick="RasigaApp.shareComment('${id}')">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span style="font-size:0.8rem;">Share</span>
            </button>
          </div>
        </div>
      `;
    }

    if (reviews.length === 0 && !userComment) {
      reviewsHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';
    }

    if (!RasigaData.userRatings) RasigaData.userRatings = {};
    const userRating = RasigaData.userRatings[id] || 0;

    const starSvgEmpty = window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'none', color: 'currentColor' }) : '';
    const starSvgFilled = window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'var(--accent-gold)', color: 'var(--accent-gold)' }) : '';

    let ratingStarsHTML = `
      <div style="position:relative; display:inline-block; width:140px; height:28px;">
        <div style="display:flex; position:absolute; top:0; left:0; pointer-events:none;">
          ${Array(5).fill(0).map(() => `<span style="color:var(--text-muted); opacity:0.5; flex-shrink:0; display:flex;">${starSvgEmpty}</span>`).join('')}
        </div>
        <div id="stars-fg-${id}" style="display:flex; position:absolute; top:0; left:0; width:${(userRating / 5) * 100}%; overflow:hidden; pointer-events:none; white-space:nowrap;">
          ${Array(5).fill(0).map(() => `<span style="color:var(--accent-gold); flex-shrink:0; display:flex;">${starSvgFilled}</span>`).join('')}
        </div>
        <input type="range" min="0" max="5" step="0.25" value="${userRating}" 
               oninput="RasigaApp.setRatingInput('${id}', this.value)" 
               onchange="RasigaApp.setRatingInput('${id}', this.value)"
               style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; margin:0;" />
      </div>
    `;

    reviewsHTML = '<div id="song-reviews-container"><div style="padding:2rem; text-align:center; color:var(--text-muted);">Loading reviews...</div></div>';

    let userReviewSectionHTML = '';
    if (!RasigaData.demoUser || !RasigaData.demoUser.onboarded) {
      userReviewSectionHTML = `
        <div class="glass" style="padding: 1.5rem; margin-bottom: 2rem; text-align:center;" id="user-review-section">
          <p style="color:var(--text-muted); margin-bottom:1rem;">Please log in to leave a rating and review.</p>
          <button class="btn btn-primary" onclick="location.hash='#/profile'" style="display:inline-flex; align-items:center; gap:0.5rem; justify-content:center; padding: 0.8rem 1.5rem;">
            ${window.Icons ? window.Icons.get('user', {width:18, height:18}) : ''} Log In to Rate
          </button>
        </div>
      `;
    } else {
      userReviewSectionHTML = `
        <div class="glass" style="padding: 1.5rem; margin-bottom: 2rem;" id="user-review-section">
          <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
            <div style="display:flex; align-items:center;">
              ${ratingStarsHTML}
            </div>
            <span style="font-size: 0.9rem; color: var(--text-muted);" id="user-rating-text-${id}">${userRating > 0 ? userRating + ' Stars' : 'Tap to rate'}</span>
          </div>
          ${userComment ? `
             <p style="font-size:1rem; margin-bottom:1rem;">${userComment}</p>
             <button onclick="RasigaApp.editComment('${id}')" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Edit</button>
          ` : `
             <textarea id="review-textarea-${id}" placeholder="Write your review here... (Required)" style="width: 100%; height: 100px; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none; font-size: 1rem; font-family: inherit; resize: vertical; margin-bottom: 1rem;"></textarea>
             <button onclick="RasigaApp.submitComment('${id}')" class="btn btn-primary">Submit</button>
          `}
        </div>
      `;
    }

    return `
      <div class="page-entity page-enter">
        <div class="glass" style="padding: 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem; position: relative;">
          <div style="width: 100px; height: 100px; border-radius: 12px; background: ${grad}; display: flex; align-items:center; justify-content:center; color: #fff; font-size:2.5rem; box-shadow: var(--glass-shadow); font-family:'DM Serif Display',serif;">
             ${ini}
          </div>
          <div style="flex: 1;">
            <h2 style="font-family:'DM Serif Display',serif; font-size: 2.2rem; margin-bottom:0.2rem;">${song.title}</h2>
            <div style="color: var(--accent-saffron); font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 0.5rem;">${song.film || 'Indie'} &bull; ${song.year}</div>
            <div style="font-size: 0.95rem; color: var(--text-muted);">
               Singer: <span style="color:var(--text-main)">${song.singer}</span><br>
               Music: <span style="color:var(--text-main)">${song.composer}</span>
            </div>
            <button onclick="RasigaApp.openSuggestSongModal('${song.id}')" class="btn" style="margin-top:0.8rem; background:rgba(255,255,255,0.1); border:1px solid var(--glass-border); font-size:0.8rem; padding:0.4rem 0.8rem;">
              Suggest Edit
            </button>
          </div>
          <div style="text-align:right;">
             <div style="font-size:2rem; font-weight:bold; color:var(--accent-gold);">${song.avg_rating}</div>
             <div style="font-size:0.8rem; color:var(--text-muted);">${song.total_ratings} ratings</div>
          </div>
        </div>
        
        <h3 style="margin-bottom: 1rem;">Your Rating & Review</h3>
        ${userReviewSectionHTML}

        <h3 style="margin-bottom: 1rem;">Community Reviews</h3>
        <div>
          ${reviewsHTML}
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

    const approvedSuggestionsXP = (window.RasigaSuggestions || []).filter(s => s.status === 'Approved').length * 50;
    const totalXP = user.xp + approvedSuggestionsXP;

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
            <h2>${user.displayName}</h2>
            <p>@${user.username} &bull; Joined ${joinedStr}</p>
            <div style="display:flex; justify-content:center; gap: 1.5rem; margin-top: 0.8rem; font-weight:600; color:var(--text-main);">
              <a href="#/following" style="text-decoration:none; color:inherit;"><span id="profile-following-count">...</span> <span style="color:var(--text-muted); font-weight:normal; font-size:0.85rem;">Following</span></a>
              <a href="#/followers" style="text-decoration:none; color:inherit;"><span id="profile-followers-count">...</span> <span style="color:var(--text-muted); font-weight:normal; font-size:0.85rem;">Followers</span></a>
            </div>
            <div class="ph-level mt-2">
              <div class="phl-top">
                <span class="phl-name text-gradient">${level.name}</span>
                <span class="phl-xp">${totalXP} XP</span>
              </div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${xpPercent}%"></div></div>
              <div class="phl-bottom">Next: ${nextLevel.name}</div>
            </div>
          </div>
        </div>

        <div class="profile-stats mt-4 page-enter" style="animation-delay: 0.1s">
          <div class="glass stat-box" style="cursor:pointer;" onclick="location.hash='#/my-reviews'"><h3>${Object.keys(RasigaData.userRatings || {}).length}</h3><span>Ratings</span></div>
          <div class="glass stat-box" style="cursor:pointer;" onclick="location.hash='#/my-reviews'"><h3>${Object.keys(RasigaData.userComments || {}).length}</h3><span>Reviews</span></div>
          <div class="glass stat-box"><h3>${user.streak}</h3><span>Day Streak &#128293;</span></div>
        </div>

        <div class="mt-4 page-enter" style="animation-delay: 0.15s">
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3); margin-bottom: 1rem;" onclick="location.hash='#/my-lists'">
            ${Icons.get('list')} Manage My Lists
          </button>
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3); margin-bottom: 1rem;" onclick="RasigaApp.openSuggestSongModal()">
            ${Icons.get('music')} Suggest a Song
          </button>
          <button class="btn btn-primary" style="width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:1rem; font-size:1.1rem; box-shadow:0 8px 24px rgba(249, 115, 22, 0.3);" onclick="location.hash='#/analytics'">
            ${Icons.get('barChart')} View Advanced Analytics
          </button>
        </div>

        <section class="section mt-4 page-enter" style="animation-delay: 0.2s">
          <h2 class="section-title">My Public Lists</h2>
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${window.RasigaLists && window.RasigaLists.filter(l => l.is_public).length > 0 
              ? window.RasigaLists.filter(l => l.is_public).slice(0, 3).map((l, i) => RasigaComponents.ListCard(l, i)).join('')
              : '<p style="color:var(--text-muted); font-size:0.9rem;">No public lists yet.</p>'}
          </div>
        </section>

        <section class="section mt-4 page-enter" style="animation-delay: 0.25s">
          <h2 class="section-title">Badges & Achievements</h2>
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
      <div class="page-discover page-enter">
        <h2 class="section-title">Admin Panel</h2>
        <div class="glass" style="padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
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
          let likes = 0, poops = 0;
          Object.keys(userReactions).forEach(k => {
            if (k.startsWith(id + '_')) {
              if (userReactions[k] === 'like') likes++;
              if (userReactions[k] === 'poop') poops++;
            }
          });
          const reactionsObj = { likes, poops };

          gridHTML += RasigaComponents.SongCard(song, i, userRatings[id], reactionsObj);
        }
      });
    }

    return `
      <div class="page-my-reviews page-enter">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
          <button class="icon-btn" onclick="history.back()">${Icons.get('close')}</button>
          <h2 class="section-title" style="margin-bottom:0;">My Ratings & Reviews</h2>
        </div>
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">Click any song to view and edit your review.</p>
        <div class="song-grid mt-4">
          ${gridHTML}
        </div>

        <section class="section mt-4" style="margin-top: 3rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h2 class="section-title" style="margin:0;">My Suggestions</h2>
          </div>
          <div id="my-suggestions-container" style="display:flex; flex-direction:column; gap:1rem;">
            <p style="color:var(--text-muted); text-align:center;">Loading suggestions...</p>
          </div>
        </section>
      </div>
    `;
  },

  renderPublicProfile: function(username) {
    return `
      <div class="page-entity page-enter" id="public-profile-container">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom: 2rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title" style="margin:0;">Profile</h2>
        </div>
        <div style="text-align:center; padding: 2rem; color:var(--text-muted);">Loading profile...</div>
      </div>
    `;
  },

  renderConnections: function(type) {
    return `
      <div class="page-entity page-enter">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom: 2rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title" style="margin:0; text-transform:capitalize;">${type}</h2>
        </div>
        <div class="glass" style="padding: 1.5rem;" id="connections-container">
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
      <div class="page-discover page-enter" style="padding-bottom:3rem;">
        <h2 class="section-title" style="margin-bottom:0.5rem;">Charts</h2>
        
        <div class="filter-pills">
          ${languages.map(lang => `
            <button class="filter-pill ${langFilter === lang ? 'active' : ''}" onclick="RasigaApp.setChartFilter('${lang}')">${lang}</button>
          `).join('')}
        </div>
        
        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:1.5rem;">
          
          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Highest Rated Songs</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topRated.map((s, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:pointer;" onclick="location.hash='#/song/${s.id}'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${s.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${s.film} &bull; ${s.language}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${s.avg_rating} ${Icons.get('star')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Songs</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${mostPopular.map((s, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:pointer;" onclick="location.hash='#/song/${s.id}'">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${s.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${s.film}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${s.total_ratings >= 100 ? (s.total_ratings / 1000).toFixed(1) + 'k' : s.total_ratings || 0} ratings
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:2rem;">
          
          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Top Rated Singers</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topSingersRated.map((a, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:default;">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${a.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${a.avg_rating} ${Icons.get('star')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Singers</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topSingersPopular.map((a, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:default;">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${a.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${a.total_ratings >= 100 ? (a.total_ratings / 1000).toFixed(1) + 'k' : a.total_ratings || 0} ratings
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <div style="display:flex; flex-wrap:wrap; gap:2rem; margin-top:2rem;">
          
          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Top Rated Music Directors</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topComposersRated.map((a, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:default;">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${a.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.25rem; font-weight:bold; color:var(--accent-gold);">
                    ${a.avg_rating} ${Icons.get('star')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="glass" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-teal);">Most Popular Music Directors</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topComposersPopular.map((a, i) => `
                <div style="display:flex; align-items:center; gap:1rem; cursor:default;">
                  <div style="font-weight:bold; font-size:1.2rem; color:var(--text-light); width:20px;">${i + 1}</div>
                  <div class="ph-avatar vinyl-avatar" style="width:36px; height:36px; font-size:1rem; margin:0;"><span class="vinyl-text">${a.name.charAt(0)}</span></div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${a.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${a.song_count} song${a.song_count > 1 ? 's' : ''}</div>
                  </div>
                  <div style="font-weight:bold; color:var(--text-main); font-size:0.9rem;">
                    ${a.total_ratings >= 100 ? (a.total_ratings / 1000).toFixed(1) + 'k' : a.total_ratings || 0} ratings
                  </div>
                </div>
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
      <div class="page-leaderboards page-enter">
        <h2 class="section-title">Leaderboards & Community</h2>
        
        <div class="glass" style="padding: 1.5rem; margin-bottom: 2rem; border-radius: var(--radius-lg); z-index: 100; position:relative;">
          <h3 style="margin-bottom: 1rem;">Find Rasigans</h3>
          <div style="display:flex; gap:0.5rem; position:relative;">
            <input type="text" id="user-search-input" placeholder="Search users by name or username..." autocomplete="off" style="flex:1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none; font-size: 1rem;" oninput="RasigaApp.searchUsers(this.value)" />
            <div id="user-search-suggestions" class="glass" style="display:none; position:absolute; top: 100%; left:0; right:0; max-height: 250px; overflow-y:auto; z-index:999; flex-direction:column; margin-top: 0.5rem; background: color-mix(in srgb, var(--bg-color) 85%, transparent); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            </div>
          </div>
        </div>

        <div id="leaderboards-container" style="display:flex; flex-wrap:wrap; gap:2rem;">
           <div class="glass" style="flex:1; min-width:300px; padding:2rem; text-align:center;">
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
      colorHTML += `<div onclick="RasigaApp.setColorTheme('${c.id}')" style="width: 45px; height: 45px; border-radius: 50%; background: ${c.hex}; cursor: pointer; transition: all 0.2s; ${active}" title="${c.name}"></div>`;
    });

    return `
      <div style="display:flex; flex-direction:column; gap: 2rem;">
        
        <div class="glass" style="padding: 1.5rem;">
          <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Edit Profile</h3>
          <div style="display:flex; flex-direction:column; gap: 1rem;">
            <div>
              <label style="display:block; font-size:0.85rem; color:var(--text-muted); margin-bottom:0.3rem;">Display Name</label>
              <input id="edit-profile-display-name" type="text" value="${user.displayName}" style="width:100%; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); color: inherit; outline:none;" />
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
            <button onclick="if(confirm('Are you sure? This cannot be undone.')){ RasigaApp.logout(); }" class="btn" style="justify-content: center; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">
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
        <div class="page-analytics page-enter">
          <div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">
            <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
            <h2 class="section-title" style="margin:0;">My Analytics</h2>
          </div>
          <div class="glass" style="padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
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
      <div class="page-enter" style="padding-bottom:3rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <button class="icon-btn" onclick="history.back()">${Icons.get('close')}</button>
          <h2 class="section-title" style="margin-bottom:0;">Advanced Analytics</h2>
        </div>

        <!-- STAT CARDS ROW -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:1rem; margin-bottom:2rem;">
          <div class="glass" style="padding:1.2rem; text-align:center;">
            <div style="font-size:2rem; font-weight:700; background:linear-gradient(135deg,#f97316,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"><span class="stat-counter" data-target="${totalSongs}">0</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">Songs Rated</div>
          </div>
          <div class="glass" style="padding:1.2rem; text-align:center;">
            <div style="font-size:2rem; font-weight:700; background:linear-gradient(135deg,#8b5cf6,#0ea5e9); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"><span class="stat-counter" data-target="${avgRating}">0</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">Avg Rating</div>
          </div>
          <div class="glass" style="padding:1.2rem; text-align:center;">
            <div style="font-size:2rem; font-weight:700; background:linear-gradient(135deg,#10b981,#0ea5e9); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"><span class="stat-counter" data-target="${uniqueComposers}">0</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">Composers</div>
          </div>
          <div class="glass" style="padding:1.2rem; text-align:center;">
            <div style="font-size:2rem; font-weight:700; background:linear-gradient(135deg,#eab308,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"><span class="stat-counter" data-target="${uniqueLangs}">0</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">Languages</div>
          </div>
          <div class="glass" style="padding:1.2rem; text-align:center;">
            <div style="font-size:1.6rem; font-weight:700; background:linear-gradient(135deg,#e11d48,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">${oldestYear}\u2013${newestYear}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">Era Span</div>
          </div>
        </div>

        <!-- ROW 1: Musical DNA + Genre -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px,1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#f97316,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Musical DNA</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Your emotional fingerprint vs. the community.</p>
            <div style="position:relative; height:300px;"><canvas id="moodChart"></canvas></div>
          </div>
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#10b981,#0ea5e9); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Genre Universe</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">The sonic territory you explore.</p>
            <div style="position:relative; height:300px;"><canvas id="genreChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 2: Timeline + Regional -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px,1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#f97316,#eab308); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Time Machine</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Songs across the decades.</p>
            <div style="position:relative; height:250px;"><canvas id="decadeChart"></canvas></div>
          </div>
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#f43f5e,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Regional Palette</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Languages you gravitate towards.</p>
            <div style="position:relative; height:250px;"><canvas id="langChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 3: Maestros + Voices -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px,1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#ff6b6b,#feca57); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Top Maestros</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">The music directors who shape your taste.</p>
            <div style="position:relative; height:250px;"><canvas id="compChart"></canvas></div>
          </div>
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#818cf8,#e879f9); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Favorite Voices</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">The singers who define your sonic identity.</p>
            <div style="position:relative; height:280px;"><canvas id="singerChart"></canvas></div>
          </div>
        </div>

        <!-- ROW 4: Quality Index + Industry -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px,1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#f43f5e,#fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Quality Index</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Average rating by language &mdash; who tops your chart?</p>
            <div style="position:relative; height:250px;"><canvas id="ratingLangChart"></canvas></div>
          </div>
          <div class="glass" style="padding:1.5rem;">
            <h3 style="margin-bottom:0.3rem; font-family:'Cinzel Decorative', serif; background:linear-gradient(135deg,#e11d48,#10b981); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Industry Map</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Your exploration across film industries.</p>
            <div style="position:relative; height:280px;"><canvas id="industryChart"></canvas></div>
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
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title" style="margin:0;">My Lists</h2>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem;">
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
      <div class="page-list-details page-enter">
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:2rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <div style="flex:1;">
            <h2 class="section-title" style="margin:0;">${list.name}</h2>
            <div style="font-size:0.9rem; color:var(--text-muted); margin-top:0.2rem;">${list.is_public ? 'Public' : 'Private'} List &bull; ${songsInList.length} songs</div>
          </div>
        </div>
        <div class="discover-grid">
          ${songCardsHTML}
        </div>
      </div>
    `;
  }
};

