// ── XSS Prevention Utility ──
window.escapeHTML = function(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
};

window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const icon = type === 'success' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
  toast.innerHTML = icon + '<span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
};

window.RasigaApp = {
  supabase: null,

  init: function () {
    // Initialize Supabase client
    if (window.supabase && window.supabase.createClient) {
      this.supabase = window.supabase.createClient(
        'https://jtqrwtynipzjybjvprdt.supabase.co',
        'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4'
      );
      console.log('Supabase client initialized');

      // Listen for auth state changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        if (session && session.user) {
          this._syncUserFromSupabase(session.user);
        } else if (event === 'SIGNED_OUT') {
          window.RasigaData.demoUser = null;
          localStorage.removeItem('rasiga_user');
          window.RasigaRouter.handleRoute();
        }
      });

      // Check if already logged in on page load
      this.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          this._syncUserFromSupabase(session.user);
        }
      });
    } else {
      console.error('Supabase JS library not loaded! Auth will not work.');
    }

    this.setupTheme();
    this.setupMusicCanvas();
    RasigaRouter.init();

    if (!localStorage.getItem('rasiga_onboarded_carousel') && window.RasigaComponents && window.RasigaComponents.showOnboardingCarousel) {
      setTimeout(() => window.RasigaComponents.showOnboardingCarousel(), 500);
    }

    // Load PWA features only if hosted
    if (window.location.protocol !== 'file:') {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = 'manifest.json';
      document.head.appendChild(manifestLink);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
          .then(() => console.log('Rasiga PWA Service Worker Registered'))
          .catch(err => console.log('Service Worker registration skipped/failed:', err));
      }
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.innerHTML = Icons.get('search');
    
    // Setup Native Google Sign In Callback
    window.handleGoogleLogin = (response) => {
      if (!this.supabase) return;
      if (response.credential) {
        this.supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential
        }).then(({ data, error }) => {
          if (error) {
            window.showToast('Google Login failed: ' + error.message, 'error');
          } else {
            console.log('Google login successful natively!');
          }
        });
      }
    };

    // Fetch initial data from Supabase
    this.fetchInitialData();
  },

  fetchInitialData: async function (silent = false) {
    if (!this.supabase) return;
    
    try {
      // Fetch songs
      const songsPromise = this.supabase.from('songs').select('*').order('total_ratings', { ascending: false });

      // Fetch recent reviews for community pulse (join ratings to get actual score)
      const reviewsPromise = this.supabase.from('reviews').select('*, users!reviews_user_id_fkey(display_name, username, avatar_url), songs(title), ratings(score)').order('created_at', { ascending: false }).limit(6);

      // Fetch suggestions (for admin)
      const suggestionsPromise = this.supabase.from('song_suggestions').select('*').order('created_at', { ascending: false });

      const [songsRes, reviewsRes, suggestionsRes] = await Promise.all([songsPromise, reviewsPromise, suggestionsPromise]);

      // Process Songs
      if (songsRes.error) {
        console.error('Error fetching songs:', songsRes.error);
        window.showToast('Failed to load songs from database! Please check your connection.', 'error');
      } else if (songsRes.data) {
        window.RasigaSeeds = songsRes.data;
        // MOCK: Add generated album art to a specific song for demonstration
        const lagJaGale = window.RasigaSeeds.find(s => s.title === 'Lag Ja Gale');
        if (lagJaGale) lagJaGale.album_art_url = 'data/art1.png';
      }

      // Process Reviews
      window.RasigaReviewsLoaded = true;
      if (reviewsRes.data) {
        window.RasigaReviews = reviewsRes.data.map(r => ({
          id: r.id,
          name: r.users?.display_name || r.users?.username || 'User',
          username: r.users?.username,
          clr: '#f97316',
          text: r.body,
          rating: r.ratings?.score || 0,
          song: r.songs?.title || 'Unknown Song',
          likes: r.likes_count || 0,
          dislikes: r.dislikes_count || 0,
          time: new Date(r.created_at).toLocaleDateString()
        }));
      } else {
        window.RasigaReviews = [];
      }

      // Process Suggestions
      if (suggestionsRes.data) {
        window.RasigaSuggestions = suggestionsRes.data.map(s => ({
          id: s.id,
          song: s.song_name,
          year: s.year,
          director: s.director,
          singer: s.singer,
          lyricist: s.lyricist,
          status: s.status,
          user_id: s.user_id,
          target_song_id: s.target_song_id,
          created_at: s.created_at
        }));
      }

      if (!silent && window.RasigaRouter) window.RasigaRouter.handleRoute();
    } catch (err) {
      console.error('Error in fetchInitialData:', err);
    }
  },

  _syncUserFromSupabase: async function (authUser) {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase.from('users').select('*').eq('id', authUser.id).single();

      if (data) {
        // User exists in our users table — fully onboarded
        window.RasigaData.demoUser = {
          id: data.id,
          email: authUser.email,
          displayName: data.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          username: data.username,
          bio: data.bio || '',
          avatar: data.display_name ? data.display_name[0].toUpperCase() : '?',
          onboarded: true,
          xp: data.xp || 0,
          joinedAt: data.joined_at,
          is_admin: data.is_admin || false,
          badges: [],
          streak: 1,
          stats: { ratings: 0, reviews: 0, languages: 0, daysListened: 1 }
        };
        localStorage.setItem('rasiga_user', JSON.stringify(window.RasigaData.demoUser));


        // Fetch independent data in parallel
        const [fRes, listRes, badgeRes, ratingsRes, reviewsRes] = await Promise.all([
          this.supabase.from('follows').select('users!follows_following_id_fkey(username)').eq('follower_id', data.id),
          this.supabase.from('lists').select('*, list_songs(song_id)').eq('user_id', data.id).order('created_at', { ascending: false }),
          this.supabase.from('user_badges').select('badge_id').eq('user_id', data.id),
          this.supabase.from('ratings').select('*').eq('user_id', data.id).order('rated_at', { ascending: false }),
          this.supabase.from('reviews').select('*').eq('user_id', data.id)
        ]);

        // Process following
        window.RasigaData.following = {};
        if (fRes.data) fRes.data.forEach(f => window.RasigaData.following[f.users.username] = true);

        // Process lists
        window.RasigaLists = listRes.data || [];

        // Process badges
        if (badgeRes.data) window.RasigaData.demoUser.badges = badgeRes.data.map(b => b.badge_id);

        // Process ratings & streak
        let streak = 0;
        if (!window.RasigaData.userRatings) window.RasigaData.userRatings = {};
        if (!window.RasigaData.userSubRatings) window.RasigaData.userSubRatings = {};
        const ratingsData = ratingsRes.data;
        
        if (ratingsData && ratingsData.length > 0) {
          ratingsData.forEach(r => {
            window.RasigaData.userRatings[r.song_id] = r.score;
            window.RasigaData.userSubRatings[r.song_id] = {
              comp_score: r.comp_score || 0,
              vocal_score: r.vocal_score || 0,
              lyric_score: r.lyric_score || 0,
              arr_score: r.arr_score || 0
            };
          });
          window.RasigaData.persistedRatings = new Set(ratingsData.map(r => r.song_id));
          window.RasigaData.demoUser.stats.ratings = ratingsData.length;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let uniqueDates = [...new Set(ratingsData.map(r => {
            const d = new Date(r.rated_at);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          }))];

          let firstDate = new Date(uniqueDates[0]);
          let diffDays = Math.round((today - firstDate) / 86400000);

          if (diffDays === 0 || diffDays === 1) {
            let expectedDate = new Date(firstDate);
            for (let i = 0; i < uniqueDates.length; i++) {
              let currDate = new Date(uniqueDates[i]);
              if (currDate.getTime() === expectedDate.getTime()) {
                streak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
              } else {
                break;
              }
            }
          }
          if (streak === 0) streak = 1;
        } else {
          streak = 1;
        }
        window.RasigaData.demoUser.streak = streak;

        // Process reviews
        if (!window.RasigaData.userComments) window.RasigaData.userComments = {};
        const reviewsData = reviewsRes.data;
        if (reviewsData && reviewsData.length > 0) {
          reviewsData.forEach(c => window.RasigaData.userComments[c.song_id] = { text: c.body, id: c.id });
          window.RasigaData.demoUser.stats.reviews = reviewsData.length;
        }

        // XP Sync/Recovery Logic
        let expectedXp = (window.RasigaData.demoUser.stats.ratings || 0) * 10 + (window.RasigaData.demoUser.stats.reviews || 0) * 20;
        if (window.RasigaData.demoUser.badges) {
          window.RasigaData.demoUser.badges.forEach(b => {
            const bDef = Object.values(window.RasigaBadges || {}).find(bd => bd.id === b);
            if (bDef && bDef.xp) expectedXp += bDef.xp;
          });
        }
        const currentXp = window.RasigaData.demoUser.xp || 0;
        if (currentXp < expectedXp && window.RasigaApp) {
          window.RasigaApp.addXP(expectedXp - currentXp);
        }

        // Retroactively award missed badges
        if (window.RasigaApp) {
          window.RasigaApp.checkAndAwardBadges();
        }

        localStorage.setItem('rasiga_user', JSON.stringify(window.RasigaData.demoUser));
        window.RasigaRouter.handleRoute();

      } else {
        // User authenticated but NOT in our users table yet — needs onboarding
        window.RasigaData.demoUser = {
          id: authUser.id,
          email: authUser.email,
          onboarded: false,
          xp: 0,
          joinedAt: new Date().toISOString().split('T')[0],
          badges: [],
          streak: 1,
          stats: { ratings: 0, reviews: 0, languages: 0, daysListened: 1 }
        };
        localStorage.setItem('rasiga_user', JSON.stringify(window.RasigaData.demoUser));
        window.RasigaRouter.handleRoute();
      }
    } catch (err) {
      console.error("Error syncing user data:", err);
    }
  },  hoverRating: function(event, songId) {
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    let rating = (x / rect.width) * 5;
    rating = Math.ceil(rating / 0.25) * 0.25;
    if (rating > 5) rating = 5;
    if (rating < 0) rating = 0;
    const fg = document.getElementById(`stars-fg-${songId}`);
    if (fg) fg.style.width = `${(rating / 5) * 100}%`;
  },
  leaveRating: function(songId) {
    let rating = RasigaData.userRatings && RasigaData.userRatings[songId] ? RasigaData.userRatings[songId] : 0;
    const fg = document.getElementById(`stars-fg-${songId}`);
    if (fg) fg.style.width = `${(rating / 5) * 100}%`;
  },
  clickRating: function(event, songId) {
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    let rating = (x / rect.width) * 5;
    rating = Math.ceil(rating / 0.25) * 0.25;
    if (rating > 5) rating = 5;
    if (rating < 0) rating = 0;
    this.setRatingInput(songId, rating);
  },
  setDirtyRating: function(songId) {
    const btn = document.getElementById(`submit-review-btn-${songId}`);
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  },
  sortReviews: function(songId, sortBy) {
    window.RasigaData.reviewSortBy = sortBy;
    this.renderReviewsFromState(songId);
  },
  loadMoreReviews: function(songId) {
    window.RasigaData.reviewLimit = (window.RasigaData.reviewLimit || 5) + 5;
    this.renderReviewsFromState(songId);
  },

  fetchSongReviews: async function (songId) {
    const reviewsContainer = document.getElementById('song-reviews-container');
    if (!reviewsContainer) return;

    if (!this.supabase) {
      reviewsContainer.innerHTML = '<p style="color:var(--text-muted)">Unable to load reviews.</p>';
      return;
    }

    try {
      // Fetch all reviews for this song
      const { data: reviews, error } = await this.supabase
        .from('reviews')
        .select('*, users!reviews_user_id_fkey(display_name, username), review_likes(reaction_type, user_id)')
        .eq('song_id', songId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch all ratings for this song separately since there's no FK between reviews and ratings
      const { data: ratingsData, error: ratingsError } = await this.supabase
        .from('ratings')
        .select('user_id, score')
        .eq('song_id', songId);
      
      if (ratingsError) throw ratingsError;
      
      const ratingsMap = {};
      (ratingsData || []).forEach(rt => { ratingsMap[rt.user_id] = rt.score; });

      let reviewsHTML = '';
      const user = RasigaData.demoUser;

      if (!RasigaData.userRatings) RasigaData.userRatings = {};
      if (!RasigaData.userComments) RasigaData.userComments = {};
      if (!RasigaData.userReactions) RasigaData.userReactions = {};

      if (user && user.onboarded) {
        // Check if current user has a rating/review
        const myReview = reviews.find(r => r.user_id === user.id);
        if (myReview) {
          RasigaData.userRatings[songId] = ratingsMap[user.id];
          RasigaData.userComments[songId] = myReview.body;
        } else {
          // If no review, check if they just have a rating
          if (ratingsMap[user.id]) {
            RasigaData.userRatings[songId] = ratingsMap[user.id];
          }
        }
      }

      window.RasigaData.currentReviews = reviews.filter(r => !user || r.user_id !== user.id);
      window.RasigaData.currentRatingsMap = ratingsMap;
      window.RasigaData.reviewSortBy = 'newest';
      window.RasigaData.reviewLimit = 5;

      if (reviews.length === 0) {
        reviewsContainer.innerHTML = window.RasigaComponents ? window.RasigaComponents.EmptyState('penTool', 'No Reviews Yet', 'Be the first to review this song and share your thoughts with the community!') : '<p style="color:var(--text-muted)">No reviews yet.</p>';
      } else {
        this.renderReviewsFromState(songId);
      }

      // Update the user's rating section if needed
      if (user && user.onboarded && RasigaData.userRatings[songId]) {
        RasigaApp.setRatingInput(songId, RasigaData.userRatings[songId]);
        if (RasigaData.userComments[songId]) {
          const urSection = document.getElementById('user-review-section');
          if (urSection) {
            urSection.innerHTML = `
              <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                <div style="display:flex; align-items:center;">
                  <div style="position:relative; display:inline-block; width:140px; height:28px;">
                    <div style="display:flex; position:absolute; top:0; left:0; pointer-events:none;">
                      ${Array(5).fill(0).map(() => `<span style="color:var(--text-muted); opacity:0.5; flex-shrink:0; display:flex;">${window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'none', color: 'currentColor' }) : ''}</span>`).join('')}
                    </div>
                    <div id="stars-fg-${songId}" style="display:flex; position:absolute; top:0; left:0; width:${(RasigaData.userRatings[songId] / 5) * 100}%; overflow:hidden; pointer-events:none; white-space:nowrap;">
                      ${Array(5).fill(0).map(() => `<span style="color:var(--accent-gold); flex-shrink:0; display:flex;">${window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'var(--accent-gold)', color: 'var(--accent-gold)' }) : ''}</span>`).join('')}
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.9rem; color: var(--text-muted);" id="user-rating-text-${songId}">${RasigaData.userRatings[songId]} Stars</span>
              </div>
              <p style="font-size:1rem; margin-bottom:1rem;">${escapeHTML(RasigaData.userComments[songId])}</p>
              <button onclick="RasigaApp.editComment('${songId}')" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Edit</button>
            `;
          }
        }
      }
    } catch (err) {
      console.error(err);
      reviewsContainer.innerHTML = '<p style="color:var(--text-muted)">Failed to load reviews.</p>';
    }
  },

  renderReviewsFromState: function(songId) {
    const reviewsContainer = document.getElementById('song-reviews-container');
    if (!reviewsContainer) return;

    let otherReviews = [...(window.RasigaData.currentReviews || [])];
    const ratingsMap = window.RasigaData.currentRatingsMap || {};
    const user = RasigaData.demoUser;

    const sortBy = window.RasigaData.reviewSortBy || 'newest';
    const limit = window.RasigaData.reviewLimit || 5;

    otherReviews.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'top_rated') {
        const likesA = (a.review_likes || []).filter(l => l.reaction_type === 'like').length;
        const likesB = (b.review_likes || []).filter(l => l.reaction_type === 'like').length;
        return likesB - likesA;
      }
      return 0;
    });

    const paginatedReviews = otherReviews.slice(0, limit);

    let reviewsHTML = '';
    paginatedReviews.forEach(r => {
      const clr = '#14b8a6';
      const time = new Date(r.created_at).toLocaleDateString();
      const score = ratingsMap[r.user_id] || '?';
      const name = escapeHTML(r.users?.display_name || r.users?.username || 'Anonymous');
      const username = escapeHTML(r.users?.username || (r.users?.display_name || 'anonymous').toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      const likes = (r.review_likes || []).filter(l => l.reaction_type === 'like').length;
      const dislikes = (r.review_likes || []).filter(l => l.reaction_type === 'dislike').length;
      
      let reaction = null;
      if (user && r.review_likes) {
        const myReaction = r.review_likes.find(l => l.user_id === user.id);
        if (myReaction) reaction = myReaction.reaction_type;
        if (reaction) RasigaData.userReactions[r.id] = reaction;
      }

      reviewsHTML += `
        <div class="glass" style="padding: 1.2rem; margin-bottom: 1rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom: 0.8rem;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: ${clr}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; cursor: pointer;" onclick="event.stopPropagation(); location.hash='#/user/${username}'">${name[0]}</div>
              <div>
                <a href="#/user/${username}" style="font-weight:600; font-size:0.95rem; text-decoration:none; color:inherit;">${name}</a>
                <div style="font-size:0.8rem; color:var(--text-muted);">${time}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.2rem; color:var(--accent-gold); font-size:0.9rem; font-weight:600;">
              ${window.Icons ? window.Icons.get('star', { width: 14, height: 14, fill: 'currentColor' }) : ''} ${score}
            </div>
          </div>
          <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">${escapeHTML(r.body)}</p>
          <div style="display:flex; align-items:center; gap: 1rem; margin-top: 1rem;">
            <button class="btn-react btn-like ${reaction === 'like' ? 'anim-heart-fill' : ''}" onclick="RasigaApp.toggleLike(this, ${likes - (reaction==='like'?1:0)}, '${r.id}')">
              ${window.Icons ? window.Icons.get('heart', { width: 16, height: 16 }) : ''}
              <span class="like-count" data-base="${likes - (reaction==='like'?1:0)}" style="font-size:0.8rem;">${likes}</span>
            </button>
            <button class="btn-react btn-dislike ${reaction === 'dislike' ? 'anim-dislike-fill' : ''}" onclick="RasigaApp.toggleDislike(this, ${dislikes - (reaction==='dislike'?1:0)}, '${r.id}')">
              ${window.Icons ? window.Icons.get('dislike', { width: 16, height: 16 }) : ''}
              <span class="dislike-count" data-base="${dislikes - (reaction==='dislike'?1:0)}" style="font-size:0.8rem;">${dislikes}</span>
            </button>
            <button class="btn-react" onclick="RasigaApp.shareComment('${songId}', '${r.id}')">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span style="font-size:0.8rem;">Share</span>
            </button>
          </div>
        </div>
      `;
    });

    reviewsContainer.innerHTML = reviewsHTML || '<p style="color:var(--text-muted)">No community reviews yet.</p>';

    const loadMoreBtn = document.getElementById('load-more-reviews-container');
    if (loadMoreBtn) {
      if (otherReviews.length > limit) loadMoreBtn.style.display = 'block';
      else loadMoreBtn.style.display = 'none';
    }
  },

  setupTheme: function () {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const currentTheme = localStorage.getItem('rasiga_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggle.innerHTML = currentTheme === 'dark' ? Icons.get('sun') : Icons.get('moon');

    const currentColor = localStorage.getItem('rasiga_theme_color') || 'orange';
    if (currentColor !== 'orange') document.documentElement.setAttribute('data-theme-color', currentColor);

    toggle.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('rasiga_theme', theme);
      toggle.innerHTML = theme === 'dark' ? Icons.get('sun') : Icons.get('moon');
    });
  },

  setChartFilter: function(lang) {
    const container = document.getElementById('page-container');
    if (container && window.RasigaPages && RasigaPages.renderCharts) {
      container.innerHTML = RasigaPages.renderCharts(lang);
    }
  },

  setColorTheme: function (color) {
    if (color === 'orange') {
      document.documentElement.removeAttribute('data-theme-color');
    } else {
      document.documentElement.setAttribute('data-theme-color', color);
    }
    localStorage.setItem('rasiga_theme_color', color);

    const sBody = document.getElementById('settings-body');
    if (sBody && window.RasigaPages && RasigaPages.renderSettingsContent) {
      sBody.innerHTML = RasigaPages.renderSettingsContent();
    }
  },

  showNotification: function (message) {
    const notif = document.createElement('div');
    notif.className = 'glass';
    notif.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: var(--accent-teal); color: white; padding: 1rem 2rem;
      border-radius: var(--radius-full); z-index: 10000; font-weight: bold;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); transition: opacity 0.3s;
    `;
    notif.innerText = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  },

  submitContact: function (event) {
    event.preventDefault();
    this.showNotification('Your message is sent.');
    location.hash = '#/';
  },

  openSettings: function () {
    let modal = document.getElementById('settings-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'settings-modal';
      modal.className = 'glass page-enter';
      modal.style.position = 'fixed';
      modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
      modal.style.zIndex = '1000';
      modal.style.display = 'flex'; modal.style.flexDirection = 'column';
      modal.style.padding = '2rem 1rem';
      modal.style.background = 'var(--bg-color)';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; max-width: 600px; margin: 0 auto; width: 100%;">
        <h2 style="font-family:'DM Serif Display',serif; font-size:2rem;">Settings</h2>
        <button onclick="RasigaApp.closeSettings()" class="icon-btn">${Icons.get('close')}</button>
      </div>
      <div id="settings-body" style="overflow-y:auto; flex:1; max-width: 600px; margin: 0 auto; width: 100%;">
        ${window.RasigaPages && RasigaPages.renderSettingsContent ? RasigaPages.renderSettingsContent() : ''}
      </div>
    `;
    modal.style.display = 'flex';
  },

  closeSettings: function () {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
  },

  openSuggestSongModal: function (songId = null) {
    let modal = document.getElementById('suggest-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'suggest-modal';
      modal.className = 'glass page-enter';
      modal.style.position = 'fixed';
      modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
      modal.style.zIndex = '1000';
      modal.style.display = 'flex'; modal.style.flexDirection = 'column';
      modal.style.padding = '2rem 1rem';
      modal.style.background = 'var(--bg-color)';
      document.body.appendChild(modal);
    }

    let songData = null;
    if (songId) {
      songData = RasigaSeeds.find(s => s.id === songId);
    }

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; max-width: 600px; margin: 0 auto; width: 100%;">
        <h2 style="font-family:'DM Serif Display',serif; font-size:2rem; margin:0;">${songData ? 'Suggest an Edit' : 'Suggest a Song'}</h2>
        <button class="icon-btn" onclick="RasigaApp.closeSuggestSongModal()" style="color:var(--text-main);">${window.Icons ? window.Icons.get('close') : 'X'}</button>
      </div>
      <div style="overflow-y:auto; flex:1; max-width: 600px; margin: 0 auto; width: 100%;">
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">${songData ? 'Help us fix any incorrect details below.' : 'Help us expand our musical diary! Fill out the details below.'}</p>
        <form onsubmit="event.preventDefault(); RasigaApp.submitSongSuggestion(this);" style="display:flex; flex-direction:column; gap:1rem;">
          ${songData ? `<input type="hidden" name="target_song_id" value="${songData.id}" />` : ''}
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Song Name</label>
            <input name="song" type="text" required value="${songData ? songData.title : ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Year</label>
            <input name="year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="e.g. 2026" required value="${songData ? songData.year : ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Music Director</label>
            <input name="director" type="text" required value="${songData ? songData.composer : ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Singer(s)</label>
            <input name="singer" type="text" required value="${songData ? songData.singer : ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Lyricist</label>
            <input name="lyricist" type="text" required value="${songData ? songData.lyricist : ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:1rem; padding:1rem; font-size:1.1rem; justify-content:center;" id="submit-suggestion-btn">Submit Suggestion</button>
        </form>
      </div>
    `;
    modal.style.display = 'flex';
  },

  closeSuggestSongModal: function () {
    const modal = document.getElementById('suggest-modal');
    if (modal) modal.style.display = 'none';
  },

  showToast: function(title, message, icon='star') {
    const toast = document.createElement('div');
    toast.className = 'glass';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '1rem';
    toast.style.boxShadow = '0 10px 40px rgba(0,0,0,0.5)';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    
    toast.innerHTML = `
      <div style="color:var(--accent-gold);">${window.Icons ? window.Icons.get(icon, {width: 24, height: 24}) : ''}</div>
      <div>
        <div style="font-weight:600; font-size:1rem; color:var(--text-main);">${title}</div>
        <div style="font-size:0.85rem; color:var(--text-muted);">${message}</div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger confetti for badges
    if (title === 'Badge Earned!' && window.RasigaComponents && window.RasigaComponents.fireConfetti) {
      window.RasigaComponents.fireConfetti();
    }
    
    void toast.offsetWidth;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  },

  addXP: async function(amount) {
    const user = window.RasigaData.demoUser;
    if (!user || !user.onboarded || !this.supabase) return;
    
    try {
      const { error: updateError } = await this.supabase
        .rpc('increment_xp', { user_uuid: user.id, amount: amount });
        
      if (updateError) throw updateError;
      
      user.xp = (user.xp || 0) + amount;
      localStorage.setItem('rasiga_user', JSON.stringify(user));
      
      if (window.RasigaRouter && location.hash === '#/profile') {
         window.RasigaRouter.handleRoute();
      }
    } catch(e) {
      console.error('Failed to sync XP', e);
    }
  },

  checkAndAwardBadges: async function() {
    const user = window.RasigaData.demoUser;
    if (!user || !user.onboarded || !this.supabase) return;
    
    const userBadges = new Set(user.badges || []);
    const newlyEarned = [];
    
    const { data: ratingsData } = await this.supabase.from('ratings').select('score, song_id, rated_at').eq('user_id', user.id);
    const { data: reviewsData } = await this.supabase.from('reviews').select('id, created_at').eq('user_id', user.id);
    
    const ratings = ratingsData || [];
    const reviews = reviewsData || [];
    
    if (ratings.length >= 1 && !userBadges.has('first_note')) newlyEarned.push('first_note');
    if (reviews.length >= 1 && !userBadges.has('wordsmith')) newlyEarned.push('wordsmith');
    if (ratings.length >= 5 && !userBadges.has('dawn_raga')) newlyEarned.push('dawn_raga');
    if (ratings.length >= 100 && !userBadges.has('century')) newlyEarned.push('century');
    if (ratings.some(r => r.score < 2.0) && !userBadges.has('critic')) newlyEarned.push('critic');
    if (ratings.length >= 50 && !userBadges.has('connoisseur')) newlyEarned.push('connoisseur');
    if (user.streak >= 3 && !userBadges.has('streak_starter')) newlyEarned.push('streak_starter');
    if (user.streak >= 7 && !userBadges.has('dedicated')) newlyEarned.push('dedicated');
    if (user.streak >= 30 && !userBadges.has('diamond')) newlyEarned.push('diamond');
    
    const ratedSongIds = ratings.map(r => r.song_id);
    const ratedSongs = (window.RasigaSeeds || []).filter(s => ratedSongIds.includes(s.id));
    const languages = new Set(ratedSongs.map(s => s.language));
    if (languages.size >= 3 && !userBadges.has('polyglot')) newlyEarned.push('polyglot');
    
    let moods = new Set();
    ratedSongs.forEach(s => { (s.mood || []).forEach(m => moods.add(m)); });
    if (moods.size >= 5 && !userBadges.has('mood_master')) newlyEarned.push('mood_master');
    
    const highRatings = ratings.filter(r => r.score >= 4.5);
    if (highRatings.length >= 10 && !userBadges.has('summit')) newlyEarned.push('summit');
    
    const hasNightOwl = ratings.some(r => {
      const h = new Date(r.rated_at).getHours();
      return h >= 0 && h < 4;
    });
    if (hasNightOwl && !userBadges.has('night_owl')) newlyEarned.push('night_owl');
    
    for (let badgeId of newlyEarned) {
      user.badges.push(badgeId);
      const badgeDef = window.RasigaData.BADGES.find(b => b.id === badgeId);
      if (badgeDef) {
        this.showToast('Badge Earned!', badgeDef.name, badgeDef.icon);
        await this.addXP(badgeDef.xp);
      }
      
      try {
        await this.supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badgeId
        });
      } catch(e) {
        console.error('Failed to insert badge', e);
      }
    }
    
    if (newlyEarned.length > 0) {
      localStorage.setItem('rasiga_user', JSON.stringify(user));
      if (location.hash === '#/profile' && window.RasigaRouter) {
        window.RasigaRouter.handleRoute();
      }
    }
  },

  submitSongSuggestion: async function (form) {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !this.supabase) {
      window.showToast("Please log in to submit suggestions.", 'error');
      return;
    }

    const btn = document.getElementById('submit-suggestion-btn');
    if (btn) btn.innerHTML = 'Submitting...';

    const targetSongId = form.target_song_id ? form.target_song_id.value : null;

    const payload = {
      user_id: me.id,
      song_name: form.song.value,
      year: parseInt(form.year.value) || 0,
      director: form.director.value,
      singer: form.singer.value,
      lyricist: form.lyricist.value,
      status: 'Pending'
    };

    if (targetSongId) {
      payload.target_song_id = targetSongId;
    }

    try {
      const { error } = await this.supabase.from('song_suggestions').insert(payload);
      if (error) throw error;
      
      this.closeSuggestSongModal();
      window.showToast(targetSongId ? 'Thank you! Your edit suggestion has been sent for review.' : 'Thank you! Your song suggestion has been sent for review.', 'success');
      
      // Refresh profile page if it's currently open
      if (location.hash === '#/profile' && window.RasigaRouter) {
        window.RasigaRouter.handleRoute();
      }
    } catch (err) {
      console.error(err);
      window.showToast("Failed to submit suggestion.", 'error');
      if (btn) btn.innerHTML = 'Submit Suggestion';
    }
  },

  deleteSuggestion: async function (id) {
    RasigaComponents.confirmAction('Delete Suggestion', 'Do you want to delete this suggestion?', async () => {
      if (!this.supabase) return;
      try {
        const { error } = await this.supabase.from('song_suggestions').delete().eq('id', id);
        if (error) throw error;
        
        // Refresh profile page
        if (location.hash === '#/profile' && window.RasigaRouter) {
          window.RasigaRouter.handleRoute();
        }
      } catch (err) {
        console.error(err);
        window.showToast("Failed to delete suggestion.", 'error');
      }
    });
  },

  mockOfflineError: function () {
    window.showToast("Please connect online to perform this action.", 'error');
  },

  referFriend: function () {
    const shareData = {
      title: 'Rasiga',
      text: 'Discover, rate, and review Indian music with me on Rasiga!',
      url: window.location.origin
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        window.showToast("App link copied to clipboard! You can now paste it to your friends.", 'success');
      });
    }
  },

  loginWith: function (provider) {
    if (!this.supabase) {
      window.showToast('Connection error. Please try again later.', 'error');
      return;
    }

    if (provider === 'google') {
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/#/profile'
        }
      }).then(({ error }) => {
        if (error) window.showToast('Google login failed: ' + error.message, 'error');
      });
    } else if (provider === 'email') {
      const emailInput = document.getElementById('login-email-input');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) { window.showToast('Please enter your email address.', 'error'); return; }

      this.supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/#/profile'
        }
      }).then(({ error }) => {
        if (error) {
          window.showToast('Login failed: ' + error.message, 'error');
        } else {
          window.showToast('Check your email! We sent you a magic login link.', 'success');
        }
      });
    }
  },

  submitOnboarding: function (form) {
    const displayName = form.displayName.value.trim();
    const username = form.username.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const themeColor = form.themeColor.value;

    if (!displayName || !username) {
      window.showToast('Please fill in all fields.', 'error');
      return;
    }

    const user = window.RasigaData.demoUser;
    if (!user || !user.id) { window.showToast('Auth error. Please try logging in again.', 'error'); return; }

    if (!this.supabase) { window.showToast('Connection error.', 'error'); return; }

    // Insert into Supabase users table
    this.supabase.from('users').insert({
      id: user.id,
      username: username,
      display_name: displayName
    }).then(({ error }) => {
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          window.showToast('That username is already taken. Please choose another.', 'error');
        } else {
          window.showToast('Error creating profile: ' + error.message, 'error');
        }
        return;
      }

      user.displayName = displayName;
      user.username = username;
      user.onboarded = true;
      user.avatar = displayName[0].toUpperCase();

      localStorage.setItem('rasiga_user', JSON.stringify(user));
      localStorage.setItem('rasiga_theme_color', themeColor);
      
      window.RasigaRouter.handleRoute();
    });
  },

  saveProfileChanges: function () {
    const displayNameInput = document.getElementById('edit-profile-display-name');
    const bioInput = document.getElementById('edit-profile-bio');
    
    if (!displayNameInput) return;

    const user = window.RasigaData.demoUser;
    if (!user) return;

    const newDisplayName = displayNameInput.value.trim();
    const newBio = bioInput ? bioInput.value.trim() : '';

    if (!newDisplayName) {
      window.showToast("Display Name cannot be empty.", 'error');
      return;
    }

    // Update locally
    user.displayName = newDisplayName;
    user.avatar = newDisplayName[0].toUpperCase();
    user.bio = newBio;
    localStorage.setItem('rasiga_user', JSON.stringify(user));

    // Update in Supabase
    if (this.supabase && user.id) {
      this.supabase.from('users').update({ display_name: newDisplayName, bio: newBio }).eq('id', user.id).then(({ error }) => {
        if (error) console.warn('Profile update error:', error.message);
      });
    }

    window.showToast("Profile changes saved successfully!", 'success');
    window.RasigaRouter.handleRoute();
  },

  logout: function () {
    const hideAdminLink = () => {
      const adminLink = document.getElementById('nav-admin-link');
      if (adminLink) adminLink.style.display = 'none';
    };

    if (this.supabase) {
      this.supabase.auth.signOut().then(() => {
        localStorage.removeItem('rasiga_user');
        window.RasigaData.demoUser = null;
        hideAdminLink();
        window.RasigaRouter.handleRoute();
      });
    } else {
      localStorage.removeItem('rasiga_user');
      window.RasigaData.demoUser = null;
      hideAdminLink();
      window.RasigaRouter.handleRoute();
    }
  },

  toggleFollow: async function(username) {
    if (!window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      RasigaComponents.confirmAction('Login Required', 'Please log in to follow users. Go to Login page?', () => {
        location.hash = '#/profile';
      });
      return;
    }

    const me = window.RasigaData.demoUser;
    
    try {
      // Look up target user ID from username
      const { data: targetUser, error: uErr } = await this.supabase.from('users').select('id').eq('username', username).single();
      if (uErr || !targetUser) throw new Error("User not found");

      if (!window.RasigaData.following) window.RasigaData.following = {};
      const isCurrentlyFollowing = window.RasigaData.following[username];

      if (isCurrentlyFollowing) {
        await this.supabase.from('follows').delete().match({ follower_id: me.id, following_id: targetUser.id });
        delete window.RasigaData.following[username];
      } else {
        await this.supabase.from('follows').insert({ follower_id: me.id, following_id: targetUser.id });
        window.RasigaData.following[username] = true;
      }

      // Re-fetch connections to update UI seamlessly if we are on the page
      if (location.hash.startsWith('#/user/')) {
        this.fetchPublicProfile(username);
      } else if (location.hash.startsWith('#/following') || location.hash.startsWith('#/followers')) {
        this.fetchConnections(location.hash.replace('#/', ''));
      } else {
        window.RasigaRouter.handleRoute();
      }
    } catch(err) {
      console.error("Follow error:", err);
      window.showToast("Failed to update follow status.", 'error');
    }
  },

  fetchPublicProfile: async function(username) {
    const container = document.getElementById('public-profile-container');
    if (!container) return;

    if (!this.supabase) {
      container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Database connection failed.</p>';
      return;
    }

    try {
      const { data: user, error } = await this.supabase.from('users').select('*, follows!follows_following_id_fkey(count)').eq('username', username).single();
      if (error || !user) {
        container.innerHTML = '<div style="text-align:center; padding:2rem;"><h2 class="section-title">User Not Found</h2></div>';
        return;
      }

      const followersCount = user.follows ? user.follows[0].count : 0;
      
      const { data: reviews } = await this.supabase.from('reviews').select('*, songs(title, film, year), ratings(score)').eq('user_id', user.id).order('created_at', { ascending: false });

      const xp = user.xp || 0;
      const level = window.RasigaData.getLevel ? window.RasigaData.getLevel(xp) : { name: 'Rasigan' };
      
      const isFollowing = window.RasigaData.following && window.RasigaData.following[username];
      const reviewerClr = '#8b5cf6';

      let reviewsHTML = '';
      (reviews || []).forEach(r => {
        const time = new Date(r.created_at).toLocaleDateString();
        const score = r.ratings?.score || '?';
        const songName = r.songs?.title || 'Unknown Song';
        const songFilm = r.songs?.film || 'Indie';
        const songYear = r.songs?.year || '';

        reviewsHTML += `
          <div class="glass page-enter" style="padding: 1.2rem; margin-bottom: 1rem; border-left: 2px solid ${reviewerClr}; animation-delay:0.2s;">
            <a href="#/song/${r.song_id}" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:0.5rem; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:var(--radius-sm); margin-bottom:0.8rem; border:1px solid var(--glass-border);">
              ${window.Icons ? window.Icons.get('music', {width:16, height:16}) : ''}
              <div>
                <div style="font-size:0.9rem; font-weight:bold;">${songName}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${songFilm} &bull; ${songYear}</div>
              </div>
            </a>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <div style="font-size:0.8rem; color:var(--text-muted);">${time}</div>
              <div style="color:var(--accent-gold); font-size:0.9rem; font-weight:600;">${window.Icons ? window.Icons.get('star', {width:14, height:14, fill:'currentColor'}) : ''} ${score}</div>
            </div>
            <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">${escapeHTML(r.body)}</p>
          </div>
        `;
      });

      if (!reviewsHTML) reviewsHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';

      const myUsername = (RasigaData.demoUser || {}).username;
      
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom: 2rem;">
          <button class="icon-btn" onclick="history.back()">${window.Icons ? window.Icons.get('close') : 'X'}</button>
          <h2 class="section-title" style="margin:0;">Profile</h2>
        </div>

        <div class="glass page-enter" style="padding: 2rem; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; animation-delay:0.1s;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: ${reviewerClr}; display: flex; align-items:center; justify-content:center; color: #fff; font-size:2rem; box-shadow: var(--glass-shadow); font-family:'DM Serif Display',serif; margin-bottom: 0.8rem;">
            ${(user.display_name || user.username)[0].toUpperCase()}
          </div>
          <div>
            <h2 style="font-family:'DM Serif Display',serif; font-size: 1.8rem; margin-bottom:0.2rem;">${user.display_name || user.username}</h2>
            <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.8rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
              @${username} &bull; <span style="color:var(--text-main); font-weight:600;">${followersCount} Followers</span>
            </div>
            
            <div style="display:flex; flex-direction:column; align-items:center; margin-bottom: 1.2rem;">
               <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1.5px; font-weight:600; margin-bottom:0.2rem;">Level</div>
               <div style="background: var(--gradient-brand); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family:'DM Serif Display',serif; font-size:1.3rem; font-weight:bold;">${level.name}</div>
            </div>
            
            ${myUsername !== username ? `
            <button class="btn ${isFollowing ? '' : 'btn-primary'}" onclick="RasigaApp.toggleFollow('${username}')" style="padding: 0.5rem 1.8rem; display:inline-flex; align-items:center; justify-content:center; gap:0.4rem; ${isFollowing ? 'background: rgba(0,0,0,0.1); border: 1px solid var(--glass-border); color: var(--text-main); box-shadow: none;' : ''}">
              ${isFollowing ? (window.Icons ? window.Icons.get('check', {width:16, height:16}) : '') + ' Following' : (window.Icons ? window.Icons.get('user', {width:16, height:16}) : '') + ' Follow'}
            </button>` : ''}
          </div>
        </div>
        
        <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom:0.5rem;">Reviews (${reviews ? reviews.length : 0})</h3>
        <div>
          ${reviewsHTML}
        </div>
      `;
    } catch(err) {
      console.error(err);
      container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Failed to load profile.</p>';
    }
  },

  fetchConnections: async function(type) {
    const container = document.getElementById('connections-container');
    if (!container || !this.supabase) return;
    
    const me = RasigaData.demoUser;
    if (!me || !me.id) {
      container.innerHTML = '<p style="text-align:center; padding:2rem;">Please log in.</p>';
      return;
    }

    try {
      let query;
      if (type === 'following') {
        // Find users I follow
        query = this.supabase.from('follows').select('following_id, users!follows_following_id_fkey(username, display_name)').eq('follower_id', me.id);
      } else {
        // Find users following me
        query = this.supabase.from('follows').select('follower_id, users!follows_follower_id_fkey(username, display_name)').eq('following_id', me.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 2rem; color:var(--text-muted);">You don't have any ${type} yet.</div>`;
        return;
      }

      let listHTML = data.map(d => {
        const u = d.users;
        const clr = '#14b8a6';
        return `
          <a href="#/user/${u.username}" style="display:flex; align-items:center; gap: 1rem; padding: 1rem; text-decoration:none; color:inherit; border-bottom: 1px solid var(--glass-border); background:rgba(0,0,0,0.05); border-radius: var(--radius-sm); margin-bottom: 0.5rem; transition: transform 0.2s;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: ${clr}; display: flex; align-items:center; justify-content:center; color: #fff; font-size:1.2rem; font-family:'DM Serif Display',serif;">
              ${(u.display_name || u.username)[0].toUpperCase()}
            </div>
            <div style="flex: 1;">
              <div style="font-weight:bold; font-size:1.1rem; font-family:'DM Serif Display',serif;">${escapeHTML(u.display_name || u.username)}</div>
              <div style="font-size:0.85rem; color:var(--text-muted);">@${escapeHTML(u.username)}</div>
            </div>
            <div style="color:var(--text-muted);">
              ${window.Icons ? window.Icons.get('chevron-right', {width:20, height:20}) : '&rarr;'}
            </div>
          </a>
        `;
      }).join('');
      
      container.innerHTML = listHTML;
    } catch(err) {
      console.error(err);
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted);">Failed to load connections.</p>';
    }
  },

  fetchMyProfileStats: async function() {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !this.supabase) return;

    try {
      const { count: followingCount } = await this.supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', me.id);
      const { count: followersCount } = await this.supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', me.id);

      const fElement = document.getElementById('profile-following-count');
      const followersElement = document.getElementById('profile-followers-count');
      
      if (fElement) fElement.textContent = followingCount || 0;
      if (followersElement) followersElement.textContent = followersCount || 0;
    } catch(err) {
      console.error(err);
    }
  },

  fetchMySuggestions: async function() {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !this.supabase) return;

    const container = document.getElementById('my-suggestions-container');
    if (!container) return;

    try {
      const { data, error } = await this.supabase.from('song_suggestions').select('*').eq('user_id', me.id).order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);">You haven't suggested any songs yet.</p>`;
        return;
      }

      container.innerHTML = data.map(sug => {
        let statusColor = 'var(--text-muted)';
        let xpBadge = '';
        if (sug.status === 'Approved') { statusColor = 'var(--accent-teal)'; xpBadge = '<span style="background:var(--gradient-brand); color:#fff; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:bold; margin-left:0.5rem;">+50 XP</span>'; }
        if (sug.status.startsWith('Rejected')) statusColor = 'var(--accent-rose)';
        
        const typeLabel = sug.target_song_id ? '<span style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; margin-left:0.5rem;">Edit Request</span>' : '';

        return `
          <div class="glass" style="padding:1rem; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;"
               oncontextmenu="event.preventDefault(); RasigaApp.deleteSuggestion('${sug.id}');"
               onpointerdown="this._longPressTimer = setTimeout(() => RasigaApp.deleteSuggestion('${sug.id}'), 800);"
               onpointerup="clearTimeout(this._longPressTimer);"
               onpointerleave="clearTimeout(this._longPressTimer);"
               onpointercancel="clearTimeout(this._longPressTimer);">
            <div style="flex:1;">
              <h4 style="font-size:1.1rem; margin-bottom:0.2rem; font-family:'DM Serif Display',serif;">${escapeHTML(sug.song_name)} <span style="font-size:0.8rem; color:var(--text-muted); font-family:'Inter',sans-serif;">(${escapeHTML(sug.year)})</span>${typeLabel}</h4>
              <p style="font-size:0.85rem; color:var(--text-muted);">${escapeHTML(sug.director)} • ${escapeHTML(sug.singer)}</p>
            </div>
            <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
              <button class="icon-btn" onclick="RasigaApp.deleteSuggestion('${sug.id}')" style="color:var(--text-muted); padding:0.2rem;" aria-label="Delete" title="Delete Suggestion">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div>
                <span style="color:${statusColor}; font-weight:bold; font-size:0.9rem;">${sug.status}</span>
                ${xpBadge}
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch(err) {
      console.error(err);
      container.innerHTML = '<p style="color:var(--accent-rose);">Failed to load suggestions.</p>';
    }
  },

  fetchAdminSuggestions: async function() {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !me.is_admin || !this.supabase) return;

    const container = document.getElementById('admin-suggestions-container');
    if (!container) return;

    try {
      const { data, error } = await this.supabase.from('song_suggestions').select('*, users(display_name)').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No suggestions found.</p>`;
        return;
      }

      container.innerHTML = data.map(sug => {
        let statusColor = 'var(--text-muted)';
        if (sug.status === 'Approved') statusColor = 'var(--accent-teal)';
        if (sug.status.startsWith('Rejected')) statusColor = 'var(--accent-rose)';
        
        const typeLabel = sug.target_song_id ? '<span style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; margin-left:0.5rem; color:var(--text-main);">Edit Request</span>' : '<span style="font-size:0.75rem; background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; margin-left:0.5rem; color:var(--text-main);">New Song</span>';
        
        const userName = sug.users?.display_name || 'Unknown User';

        let actionButtons = '';
        if (sug.status === 'Pending') {
          actionButtons = `
            <div style="display:flex; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">
              <button class="btn btn-primary" onclick="RasigaApp.updateSuggestionStatus('${sug.id}', 'Approved')" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Approve</button>
              <button class="btn" onclick="RasigaApp.openAdminEditModal('${sug.id}')" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--accent-gold); border-color:var(--accent-gold); color:#000;">Edit More</button>
              <button class="btn" onclick="RasigaApp.updateSuggestionStatus('${sug.id}', 'Rejected - Duplicate')" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--accent-rose); border-color:var(--accent-rose);">Duplicate</button>
              <button class="btn" onclick="RasigaApp.updateSuggestionStatus('${sug.id}', 'Rejected - Incorrect')" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:var(--accent-rose); border-color:var(--accent-rose);">Incorrect</button>
            </div>
          `;
        }

        let detailsHTML = '';
        if (sug.target_song_id) {
          const orig = (window.RasigaSeeds || []).find(s => s.id === sug.target_song_id);
          if (orig) {
            detailsHTML = `
              <div style="flex: 1 1 250px; min-width:0;">
                <h4 style="font-size:1.2rem; margin-bottom:0.5rem; font-family:'DM Serif Display',serif; white-space:normal; word-break:break-word;">Edit Request for: ${escapeHTML(orig.title)}${typeLabel}</h4>
                <div style="font-size:0.85rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:var(--radius-sm); width:100%; overflow-x:auto;">
                  <div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.5rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem; font-weight:bold;">
                    <div>Field</div>
                    <div style="color:var(--accent-rose);">Current</div>
                    <div style="color:var(--accent-teal);">Suggested</div>
                  </div>
                  ${orig.title !== sug.song_name ? `<div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.3rem;"><div>Title</div><div style="color:var(--text-muted); text-decoration:line-through; word-break:break-word;">${escapeHTML(orig.title)}</div><div style="color:var(--text-main); word-break:break-word;">${escapeHTML(sug.song_name)}</div></div>` : ''}
                  ${String(orig.year) !== String(sug.year) ? `<div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.3rem;"><div>Year</div><div style="color:var(--text-muted); text-decoration:line-through; word-break:break-word;">${escapeHTML(orig.year)}</div><div style="color:var(--text-main); word-break:break-word;">${escapeHTML(sug.year)}</div></div>` : ''}
                  ${orig.composer !== sug.director ? `<div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.3rem;"><div>Music</div><div style="color:var(--text-muted); text-decoration:line-through; word-break:break-word;">${escapeHTML(orig.composer)}</div><div style="color:var(--text-main); word-break:break-word;">${escapeHTML(sug.director)}</div></div>` : ''}
                  ${orig.singer !== sug.singer ? `<div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.3rem;"><div>Singer</div><div style="color:var(--text-muted); text-decoration:line-through; word-break:break-word;">${escapeHTML(orig.singer)}</div><div style="color:var(--text-main); word-break:break-word;">${escapeHTML(sug.singer)}</div></div>` : ''}
                  ${(orig.lyricist||'') !== (sug.lyricist||'') ? `<div style="display:grid; grid-template-columns: 80px 1fr 1fr; gap:0.5rem; margin-bottom:0.3rem;"><div>Lyricist</div><div style="color:var(--text-muted); text-decoration:line-through; word-break:break-word;">${escapeHTML(orig.lyricist||'-')}</div><div style="color:var(--text-main); word-break:break-word;">${escapeHTML(sug.lyricist||'-')}</div></div>` : ''}
                </div>
              </div>
            `;
          } else {
             detailsHTML = `<div style="flex: 1 1 250px; min-width:0;"><h4 style="font-size:1.2rem; margin-bottom:0.2rem; font-family:'DM Serif Display',serif; white-space:normal; word-break:break-word;">${escapeHTML(sug.song_name)}${typeLabel}</h4><p style="font-size:0.9rem; color:var(--accent-rose);">Error: Original song not found.</p></div>`;
          }
        } else {
          detailsHTML = `
            <div style="flex: 1 1 250px; min-width:0;">
              <h4 style="font-size:1.2rem; margin-bottom:0.2rem; font-family:'DM Serif Display',serif; white-space:normal; word-break:break-word;">${escapeHTML(sug.song_name)} <span style="font-size:0.9rem; color:var(--text-muted); font-family:'Inter',sans-serif;">(${escapeHTML(sug.year)})</span>${typeLabel}</h4>
              <p style="font-size:0.9rem; color:var(--text-muted);">${escapeHTML(sug.director)} • ${escapeHTML(sug.singer)}</p>
              <p style="font-size:0.9rem; color:var(--text-muted);">Lyricist: ${escapeHTML(sug.lyricist)}</p>
            </div>
          `;
        }

        return `
          <div class="glass" style="padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; gap:1rem; flex-wrap:wrap;">
              ${detailsHTML}
              <div style="text-align:right; margin-left:auto;">
                <span style="color:${statusColor}; font-weight:bold; font-size:0.9rem;">${sug.status}</span>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">By: ${escapeHTML(userName)}</p>
                <p style="font-size:0.75rem; color:var(--text-muted);">ID: ${sug.id.substring(0,8)}</p>
              </div>
            </div>
            ${actionButtons}
          </div>
        `;
      }).join('');
    } catch(err) {
      console.error(err);
      container.innerHTML = '<p style="color:var(--accent-rose); text-align:center;">Failed to load suggestions.</p>';
    }
  },

  updateSuggestionStatus: async function(id, newStatus) {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !me.is_admin || !this.supabase) return;

    RasigaComponents.confirmAction('Change Status', 'Are you sure you want to mark this as ' + newStatus + '?', async () => {

    try {
      // First fetch the suggestion details
      const { data: sugData, error: fetchError } = await this.supabase.from('song_suggestions').select('*').eq('id', id).single();
      if (fetchError) throw fetchError;

      // Update the suggestion status
      const { error: updateError } = await this.supabase.from('song_suggestions').update({ status: newStatus }).eq('id', id);
      if (updateError) throw updateError;

      // If approved, add or update the song in the songs table
      if (newStatus === 'Approved') {
        const songPayload = {
          title: sugData.song_name,
          year: sugData.year,
          singer: sugData.singer,
          composer: sugData.director,
          lyricist: sugData.lyricist,
          language: 'Tamil'
        };

        if (sugData.target_song_id) {
          // Update existing song
          const { error: songUpdateError } = await this.supabase.from('songs').update(songPayload).eq('id', sugData.target_song_id);
          if (songUpdateError) throw songUpdateError;
        } else {
          // Insert new song — let Supabase auto-generate the UUID
          const { error: songInsertError } = await this.supabase.from('songs').insert({
            ...songPayload,
            total_ratings: 0,
            avg_rating: 0,
            film: 'Indie'
          });
          if (songInsertError) throw songInsertError;
        }
      }

      window.showToast('Successfully marked as ' + newStatus, 'success');
      
      // Re-fetch all data so search and charts reflect the new song
      await this.fetchInitialData();
      
      // Refresh admin page
      if (location.hash === '#/admin' && window.RasigaRouter) {
        window.RasigaRouter.handleRoute();
      }
    } catch(err) {
      console.error(err);
      window.showToast('Failed to update suggestion status.', 'error');
    }
    });
  },

  openAdminEditModal: async function(sugId) {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !me.is_admin || !this.supabase) return;

    try {
      const { data: sug, error } = await this.supabase.from('song_suggestions').select('*').eq('id', sugId).single();
      if (error) throw error;

      let modal = document.getElementById('admin-edit-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-edit-modal';
        modal.className = 'glass page-enter';
        modal.style.position = 'fixed';
        modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
        modal.style.zIndex = '1000';
        modal.style.display = 'flex'; modal.style.flexDirection = 'column';
        modal.style.padding = '2rem 1rem';
        modal.style.background = 'var(--bg-color)';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; max-width: 600px; margin: 0 auto; width: 100%;">
          <h2 style="font-family:'DM Serif Display',serif; font-size:2rem; margin:0;">Edit Suggestion</h2>
          <button class="icon-btn" onclick="document.getElementById('admin-edit-modal').style.display='none'" style="color:var(--text-main);">${window.Icons ? window.Icons.get('close') : 'X'}</button>
        </div>
        <div style="overflow-y:auto; flex:1; max-width: 600px; margin: 0 auto; width: 100%;">
          <form onsubmit="event.preventDefault(); RasigaApp.submitAdminEdit(this);" style="display:flex; flex-direction:column; gap:1rem;">
            <input type="hidden" name="sug_id" value="${sug.id}" />
            <div>
              <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Song Name</label>
              <input name="song" type="text" required value="${escapeHTML(sug.song_name)}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
            </div>
            <div>
              <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Year</label>
              <input name="year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" required value="${escapeHTML(sug.year)}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
            </div>
            <div>
              <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Music Director</label>
              <input name="director" type="text" required value="${escapeHTML(sug.director)}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
            </div>
            <div>
              <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Singer(s)</label>
              <input name="singer" type="text" required value="${escapeHTML(sug.singer)}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
            </div>
            <div>
              <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Lyricist</label>
              <input name="lyricist" type="text" required value="${escapeHTML(sug.lyricist)}" style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:1rem; padding:1rem; font-size:1.1rem; justify-content:center; background:var(--accent-teal); border-color:var(--accent-teal);" id="admin-edit-submit-btn">Approve and Save</button>
          </form>
        </div>
      `;
      modal.style.display = 'flex';
    } catch(err) {
      console.error(err);
      window.showToast('Failed to load suggestion details.', 'error');
    }
  },

  submitAdminEdit: async function(form) {
    const me = RasigaData.demoUser;
    if (!me || !me.id || !me.is_admin || !this.supabase) return;

    const btn = document.getElementById('admin-edit-submit-btn');
    if (btn) btn.innerHTML = 'Saving...';

    const sugId = form.sug_id.value;
    const payload = {
      song_name: form.song.value,
      year: parseInt(form.year.value) || 0,
      director: form.director.value,
      singer: form.singer.value,
      lyricist: form.lyricist.value
    };

    try {
      // First update the suggestion with new values
      const { error: updateError } = await this.supabase.from('song_suggestions').update(payload).eq('id', sugId);
      if (updateError) throw updateError;

      // Then approve it, which will trigger the normal approval flow (updating/inserting song)
      document.getElementById('admin-edit-modal').style.display = 'none';
      await this.updateSuggestionStatus(sugId, 'Approved');
      
    } catch (err) {
      console.error(err);
      window.showToast("Failed to save and approve suggestion.", 'error');
      if (btn) btn.innerHTML = 'Approve and Save';
    }
  },

  fetchHomeStats: async function() {
    if (!this.supabase) return;

    try {
      // Fetch total ratings
      const { count: ratingsCount } = await this.supabase.from('ratings').select('*', { count: 'exact', head: true });
      
      // Fetch total users
      const { count: usersCount } = await this.supabase.from('users').select('*', { count: 'exact', head: true });

      // Languages: we already know the unique languages from RasigaSeeds
      const uniqueLanguages = new Set(window.RasigaSeeds.map(s => s.language)).size;

      const formatStat = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return Math.floor(num / 1000000) + 'M+';
        if (num >= 1000) return Math.floor(num / 1000) + 'K+';
        if (num >= 100) return Math.floor(num / 100) * 100 + '+';
        if (num >= 10) return Math.floor(num / 10) * 10 + '+';
        return num;
      };

      const rEl = document.getElementById('home-stat-ratings');
      const uEl = document.getElementById('home-stat-users');
      const lEl = document.getElementById('home-stat-languages');
      const sEl = document.getElementById('home-stat-songs');

      if (rEl) rEl.textContent = formatStat(ratingsCount);
      if (uEl) uEl.textContent = formatStat(usersCount);
      if (lEl) lEl.textContent = uniqueLanguages;
      if (sEl) sEl.textContent = formatStat(window.RasigaSeeds ? window.RasigaSeeds.length : 0);

    } catch (err) {
      console.error("Error fetching home stats:", err);
    }
  },

  setupMusicCanvas: function () {
    const canvas = document.getElementById('music-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const symbols = [
      '♪', '♫', '♬', '♩', // Music notes
      'स', 'रे', 'ग', 'म', 'प', 'ध', 'नि', // Hindi Sargam
      'ச', 'ரி', 'க', 'ம', 'ப', 'த', 'நி', // Tamil Sargam
      'స', 'రి', 'గ', 'మ', 'ప', 'ధ', 'ని', // Telugu Sargam
      '★★★', '★★★★', '★★★★★', '★' // Ratings
    ];

    const vibrantColors = ['#ec4899', '#f97316', '#14b8a6', '#8b5cf6', '#3b82f6'];

    // Create particles
    const numParticles = window.innerWidth < 768 ? 15 : 40;
    for (let i = 0; i < numParticles; i++) {
      let sym = symbols[Math.floor(Math.random() * symbols.length)];
      let type, color;

      if (sym.includes('★')) {
        type = 'star';
        color = '#fbbf24'; // Golden
      } else if (['♪', '♫', '♬', '♩'].includes(sym)) {
        type = 'music';
        color = '#ffffff'; // White
      } else {
        type = 'letter';
        color = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
      }

      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        sz: 24 + Math.random() * 45,
        spd: 0.1 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.2,
        rot: Math.random() * 6.28,
        rs: (Math.random() - 0.5) * 0.005,
        note: sym,
        type: type,
        color: color
      });
    }

    let animating = false;
    let animFrame = null;

    function draw() {
      if (!animating) return;
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.y -= p.spd;
        p.x += p.drift + Math.sin(p.y * 0.005) * 0.5;
        p.rot += p.rs;

        if (p.y < -50) { p.y = H + 50; p.x = Math.random() * W; }
        if (p.x < -50) { p.x = W + 50; }
        if (p.x > W + 50) { p.x = -50; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = 'bold ' + p.sz + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = p.color;

        if (p.type === 'music') {
          ctx.lineWidth = Math.max(2, p.sz * 0.06);
          ctx.strokeStyle = '#000000';
          ctx.strokeText(p.note, 0, 0);
          ctx.fillText(p.note, 0, 0);
        } else {
          ctx.fillText(p.note, 0, 0);
        }

        ctx.restore();
      });
      animFrame = requestAnimationFrame(draw);
    }
    
    let isIntersecting = true;
    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting && !document.hidden) {
        if (!animating) {
          animating = true;
          draw();
        }
      } else {
        animating = false;
        if (animFrame) cancelAnimationFrame(animFrame);
      }
    });
    observer.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        animating = false;
        if (animFrame) cancelAnimationFrame(animFrame);
      } else if (isIntersecting) {
        if (!animating) {
          animating = true;
          draw();
        }
      }
    });
  },

  currentFilter: 'all',

  selectFilter: function (val, text) {
    this.currentFilter = val;
    const selectedEl = document.getElementById('filter-selected-text');
    if (selectedEl) selectedEl.innerHTML = text;
    const opts = document.getElementById('filter-options');
    if (opts) opts.style.display = 'none';

    // re-trigger search if input has value
    const input = document.getElementById('search-input');
    if (input && input.value.trim()) {
      this.handleSearchInput({ target: input });
    }
  },

  _searchTimer: null,

  executeGlobalSearch: function (query, inputId) {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      const sug = document.getElementById('search-suggestions');
      if (!sug) return;
      const q = (query || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (q.length < 2) {
        sug.style.display = 'none';
        return;
      }
      const filter = this.currentFilter || 'all';

      const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      let matches = [];
      RasigaSeeds.forEach(s => {
        let match = false;
        const t = normalize(s.title);
        const si = normalize(s.singer);
        const c = normalize(s.composer);
        const f = normalize(s.film);

        if (filter === 'all' || filter === 'singer') match = match || si.includes(q);
        if (filter === 'all' || filter === 'film') match = match || f.includes(q);
        if (filter === 'all' || filter === 'composer') match = match || c.includes(q);
        if (filter === 'all') match = match || t.includes(q);

        if (match && !matches.find(m => m.id === s.id)) matches.push(s);
      });

      if (matches.length > 0) {
        sug.innerHTML = matches.slice(0, 5).map(m => `
          <div style="padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;" onclick="document.getElementById('search-input').value='${escapeHTML(m.title)}'; RasigaApp.executeSearch();">
            <div style="font-weight:bold; font-size:0.95rem;">${escapeHTML(m.title)}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(m.singer)} &bull; ${escapeHTML(m.film || 'Indie')}</div>
          </div>
        `).join('');
        sug.style.display = 'flex';
      } else {
        sug.innerHTML = '<div style="padding: 0.8rem 1rem; color:var(--text-muted); font-size:0.9rem;">No suggestions...</div>';
        sug.style.display = 'flex';
      }
    }, 250);
  },

  handleSearchInput: function (e) {
    this.executeGlobalSearch(e.target ? e.target.value : e, 'search-input');
  },

  executeSearch: function () {
    const rawQ = document.getElementById('search-input').value.trim();
    const q = rawQ.toLowerCase().replace(/[^a-z0-9]/g, '');
    document.getElementById('search-suggestions').style.display = 'none';
    if (!q && !rawQ) return;

    const filter = this.currentFilter || 'all';
    const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    let matches = [];
    RasigaSeeds.forEach(s => {
      let match = false;
      const t = normalize(s.title);
      const si = normalize(s.singer);
      const c = normalize(s.composer);
      const f = normalize(s.film);
      const lang = normalize(s.language);

      if (filter === 'all' || filter === 'singer') match = match || si.includes(q);
      if (filter === 'all' || filter === 'film') match = match || f.includes(q);
      if (filter === 'all' || filter === 'composer') match = match || c.includes(q);
      if (filter === 'all') match = match || t.includes(q) || lang.includes(q);
      if (match && !matches.find(m => m.id === s.id)) matches.push(s);
    });

    const c = document.getElementById('discover-results-container');
    if (c) {
      if (matches.length > 0) {
        c.innerHTML = '<div class="song-grid mt-4">' + matches.map((m, i) => window.RasigaComponents.SongCard(m, i)).join('') + '</div>';
      } else {
        c.innerHTML = '<div style="padding: 2rem; text-align:center; color:var(--text-muted);">No songs found matching your search.</div>';
      }
    }
  },

  _userSearchTimer: null,

  searchUsers: async function (query) {
    clearTimeout(this._userSearchTimer);
    this._userSearchTimer = setTimeout(async () => {
      const sug = document.getElementById('user-search-suggestions');
      if (!sug) return;
      const q = query.trim();
      if (q.length < 2) {
        sug.style.display = 'none';
        return;
      }

      if (!this.supabase) return;

      try {
        const { data, error } = await this.supabase
          .from('users')
          .select('username, display_name, avatar_url')
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
          .limit(5);

        if (error) throw error;

      if (data && data.length > 0) {
        sug.innerHTML = data.map(u => `
          <div style="padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer; display:flex; align-items:center; gap:0.8rem;" onclick="location.hash='#/user/${u.username}'">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-saffron); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:1rem;">
              ${(u.display_name || u.username)[0].toUpperCase()}
            </div>
            <div>
              <div style="font-weight:bold; font-size:0.95rem;">${escapeHTML(u.display_name || u.username)}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">@${escapeHTML(u.username)}</div>
            </div>
          </div>
        `).join('');
        sug.style.display = 'flex';
      } else {
        sug.innerHTML = '<div style="padding: 0.8rem 1rem; color:var(--text-muted); font-size:0.9rem;">No users found.</div>';
        sug.style.display = 'flex';
      }
    } catch (err) {
      console.error('User search error:', err);
    }
    }, 250);
  },

  fetchLeaderboards: async function() {
    const container = document.getElementById('leaderboards-container');
    if (!container || !this.supabase) return;

    // Use skeleton loader while fetching
    container.innerHTML = '<div class="skeleton skeleton-card" style="height: 400px; border-radius: var(--radius-lg);"></div>';

    try {
      // Fetch top users by XP
      const { data: topUsers, error } = await this.supabase
        .from('users')
        .select('username, display_name, xp, id')
        .order('xp', { ascending: false })
        .limit(10);

      if (error) throw error;

      let html = '';

      if (topUsers && topUsers.length > 0) {
        // Fetch review counts for context
        const { data: userReviews } = await this.supabase
          .from('reviews')
          .select('user_id')
          .in('user_id', topUsers.map(u => u.id));
          
        const reviewCounts = {};
        if (userReviews) {
          userReviews.forEach(r => {
            reviewCounts[r.user_id] = (reviewCounts[r.user_id] || 0) + 1;
          });
        }

        html += `
          <div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; color:var(--accent-saffron);">Top Rasigans (XP)</h3>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topUsers.map((u, i) => {
                const isTop3 = i < 3;
                let rankColor = 'var(--text-light)';
                let rankClass = '';
                if (i === 0) { rankColor = 'var(--accent-gold)'; rankClass = 'text-gradient-gold'; }
                if (i === 1) { rankColor = '#e2e8f0'; rankClass = 'text-gradient-silver'; }
                if (i === 2) { rankColor = '#fcd34d'; rankClass = 'text-gradient-bronze'; }
                const rCount = reviewCounts[u.id] || 0;
                
                return `
                <div style="display:flex; align-items:center; gap:1rem; cursor:pointer; padding: 0.5rem; border-radius: var(--radius-md); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" onclick="location.hash='#/user/${u.username}'">
                  <div class="${rankClass}" style="font-weight:bold; font-size:1.5rem; ${isTop3 ? '' : 'color:var(--text-light);'} width:30px; text-align:center;">${i + 1}</div>
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${rankColor}; display:flex; align-items:center; justify-content:center; color:${i<3?'#000':'#fff'}; font-weight:bold; font-size:1.2rem;">
                    ${(u.display_name || u.username)[0].toUpperCase()}
                  </div>
                  <div style="flex:1;">
                    <div style="font-weight:600; font-size:1.1rem; color:var(--text-main);">${escapeHTML(u.display_name || u.username)}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">@${escapeHTML(u.username)} &bull; ${rCount} Reviews</div>
                  </div>
                  <div style="font-weight:bold; color:var(--accent-teal); font-size:1.1rem; text-align:right;">
                    ${u.xp || 0} <span style="font-size:0.8rem; font-weight:normal;">XP</span>
                  </div>
                </div>
              `}).join('')}
            </div>
          </div>
        `;
      } else {
         html = '<p>No users found on leaderboard yet.</p>';
      }

      container.innerHTML = html;

    } catch(err) {
      console.error('Error fetching leaderboards:', err);
      container.innerHTML = '<p>Failed to load leaderboards.</p>';
    }
  },

  openSong: function (id) {
    location.hash = '#/song/' + id;
  },

  setRatingInput: function (id, val) {
    let rating = parseFloat(val);
    rating = Math.round(rating * 4) / 4; // Snap to 0.25
    if (!RasigaData.userRatings) RasigaData.userRatings = {};
    RasigaData.userRatings[id] = rating;

    const fg = document.getElementById(`stars-fg-${id}`);
    if (fg) fg.style.width = (rating / 5) * 100 + '%';

    const txt = document.getElementById(`user-rating-text-${id}`);
    if (txt) txt.textContent = rating > 0 ? rating + ' Stars' : 'Tap to rate';
    this.setDirtyRating(id);
  },

  saveRating: async function (id, val) {
    const isNewRating = !RasigaData.persistedRatings || !RasigaData.persistedRatings.has(id);
    if (!RasigaData.persistedRatings) RasigaData.persistedRatings = new Set();
    RasigaData.persistedRatings.add(id);

    this.setRatingInput(id, val);
    
    const rating = parseFloat(val);
    const user = RasigaData.demoUser;
    if (!user || !user.id || !this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('ratings')
        .upsert({ user_id: user.id, song_id: id, score: rating }, { onConflict: 'user_id, song_id' });
      
      if (!error) {
        window.showToast("Rating saved!");
        if (rating === 5 && window.RasigaComponents && window.RasigaComponents.fireConfetti) {
          window.RasigaComponents.fireConfetti();
        }
        
        if (isNewRating) {
          await this.addXP(10);
        }
        
        await this.fetchInitialData(true); // Refresh overall song stats quietly
        
        if (isNewRating) {
          await this.checkAndAwardBadges();
        }
      }
    } catch(e) {
      console.error('Failed to save rating', e);
    }
  },

  submitComment: async function (id) {
    const textEl = document.getElementById('review-textarea-' + id);
    const text = textEl ? textEl.value.trim() : '';

    const rating = RasigaData.userRatings && RasigaData.userRatings[id];
    if (!rating) {
      window.showToast("Please select a star rating first.", 'error');
      return;
    }

    const user = RasigaData.demoUser;
    if (!user || !user.id || !this.supabase) {
      window.showToast("You must be logged in.", 'error');
      return;
    }

    try {
      const subRatings = {};
      ['comp_score', 'vocal_score', 'lyric_score', 'arr_score'].forEach(key => {
        const el = document.getElementById(`input-${key}-${id}`);
        if (el && parseFloat(el.value) > 0) {
          subRatings[key] = parseFloat(el.value);
        }
      });

      if (!RasigaData.userSubRatings) RasigaData.userSubRatings = {};
      RasigaData.userSubRatings[id] = subRatings;

      const isNewRating = !RasigaData.persistedRatings || !RasigaData.persistedRatings.has(id);
      
      // 1. Upsert rating
      const ratingPayload = { user_id: user.id, song_id: id, score: rating, ...subRatings };
      const { data: ratingData, error: ratingError } = await this.supabase
        .from('ratings')
        .upsert(ratingPayload, { onConflict: 'user_id, song_id' })
        .select('id')
        .single();

      if (ratingError) throw ratingError;

      if (!RasigaData.persistedRatings) RasigaData.persistedRatings = new Set();
      RasigaData.persistedRatings.add(id);

      let isNewReview = false;

      // 2. Upsert review ONLY if text exists, otherwise delete it
      if (text) {
        const { error: reviewError } = await this.supabase
          .from('reviews')
          .upsert({ user_id: user.id, song_id: id, rating_id: ratingData.id, body: text }, { onConflict: 'user_id, song_id' });

        if (reviewError) throw reviewError;

        isNewReview = !RasigaData.userComments || !RasigaData.userComments[id];

        if (!RasigaData.userComments) RasigaData.userComments = {};
        RasigaData.userComments[id] = text;
      } else {
        // If text is empty, they are deleting their comment
        await this.supabase.from('reviews').delete().match({ user_id: user.id, song_id: id });
        if (RasigaData.userComments) delete RasigaData.userComments[id];
      }

      // Re-fetch initial data
      await this.fetchInitialData();

      let xpToAdd = 0;
      if (isNewRating) xpToAdd += 10;
      if (isNewReview && text) xpToAdd += 20;

      if (xpToAdd > 0) {
        await this.addXP(xpToAdd);
      }
      await this.checkAndAwardBadges();

      if (rating === 5 && window.RasigaComponents && window.RasigaComponents.fireConfetti) {
        window.RasigaComponents.fireConfetti();
      }

      window.showToast(text ? "Review submitted successfully!" : "Rating saved successfully!");
      window.RasigaData.editingReview = null;

      if (window.RasigaRouter) window.RasigaRouter.handleRoute();
    } catch (err) {
      console.error(err);
      window.showToast("Error submitting: " + err.message, 'error');
    }
  },

  editComment: function (id) {
    window.RasigaData.editingReview = id;
    if (window.RasigaRouter) window.RasigaRouter.handleRoute();
  },

  cancelEdit: function (id) {
    window.RasigaData.editingReview = null;
    if (window.RasigaRouter) window.RasigaRouter.handleRoute();
  },

  toggleLike: async function (btn, baseCount, reviewId) {
    if (!window.RasigaData || !window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to react. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }

    const user = RasigaData.demoUser;
    const isLiked = btn.classList.toggle('anim-heart-fill');
    btn.classList.remove('anim-heart-pop');

    void btn.offsetWidth; // trigger reflow
    if (!RasigaData.userReactions) RasigaData.userReactions = {};

    try {
      if (isLiked) {
        btn.classList.add('anim-heart-pop');
        btn.querySelector('.like-count').textContent = baseCount + 1;
        if (reviewId) RasigaData.userReactions[reviewId] = 'like';

        // If there was a dislike reaction on this review, remove it visually
        const dislikeBtn = btn.parentElement.querySelector('.btn-dislike');
        if (dislikeBtn && dislikeBtn.classList.contains('anim-dislike-fill')) {
          const dislikeBase = parseInt(dislikeBtn.querySelector('.dislike-count').getAttribute('data-base'));
          dislikeBtn.classList.remove('anim-dislike-fill', 'anim-dislike-pop');
          dislikeBtn.style.color = '';
          dislikeBtn.querySelector('.dislike-count').textContent = dislikeBase;
        }

        if (this.supabase && reviewId && !reviewId.includes('_')) { // avoid dummy ids like uuid_Name
          await this.supabase.from('review_likes').upsert({ user_id: user.id, review_id: reviewId, reaction_type: 'like' }, { onConflict: 'user_id, review_id' });
        }
      } else {
        btn.querySelector('.like-count').textContent = baseCount;
        if (reviewId && RasigaData.userReactions[reviewId] === 'like') delete RasigaData.userReactions[reviewId];
        
        if (this.supabase && reviewId && !reviewId.includes('_')) {
          await this.supabase.from('review_likes').delete().match({ user_id: user.id, review_id: reviewId });
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
    btn.blur();
  },

  toggleDislike: async function (btn, baseCount, reviewId) {
    if (!window.RasigaData || !window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to react. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }

    const user = RasigaData.demoUser;
    const isDisliked = btn.classList.toggle('anim-dislike-fill');
    btn.classList.remove('anim-dislike-pop');

    void btn.offsetWidth; // trigger reflow
    if (!RasigaData.userReactions) RasigaData.userReactions = {};

    try {
      if (isDisliked) {
        btn.classList.add('anim-dislike-pop');
        btn.querySelector('.dislike-count').textContent = baseCount + 1;
        if (reviewId) RasigaData.userReactions[reviewId] = 'dislike';

        // remove like if exists
        const likeBtn = btn.parentElement.querySelector('.btn-like');
        if (likeBtn && likeBtn.classList.contains('anim-heart-fill')) {
          likeBtn.classList.remove('anim-heart-fill');
          likeBtn.querySelector('.like-count').textContent = parseInt(likeBtn.querySelector('.like-count').getAttribute('data-base'));
        }

        if (this.supabase && reviewId && !reviewId.includes('_')) {
          await this.supabase.from('review_likes').upsert({ user_id: user.id, review_id: reviewId, reaction_type: 'dislike' }, { onConflict: 'user_id, review_id' });
        }
      } else {
        btn.querySelector('.dislike-count').textContent = baseCount;
        if (reviewId && RasigaData.userReactions[reviewId] === 'dislike') delete RasigaData.userReactions[reviewId];
        
        if (this.supabase && reviewId && !reviewId.includes('_')) {
          await this.supabase.from('review_likes').delete().match({ user_id: user.id, review_id: reviewId });
        }
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
    btn.blur();
  },

  shareComment: function (songId) {
    if (!songId) { window.showToast("Cannot share this review.", 'error'); return; }
    const url = window.location.origin + window.location.pathname + '#/song/' + songId;
    if (navigator.share) {
      navigator.share({
        title: 'Rasiga Review',
        text: 'Check out this review on Rasiga!',
        url: url
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => window.showToast('Link copied to clipboard!', 'success'));
    }
  },

  setSearchFilter: function(val, label, detailsId, inputId) {
    const details = document.getElementById(detailsId);
    if (details) {
      const summaryText = details.querySelector('.selected-text');
      if (summaryText) summaryText.textContent = label;
      details.classList.remove('open');
      details.dataset.value = val;
    }
    const inputEl = document.getElementById(inputId);
    if (inputEl && inputEl.value) {
      this.executeGlobalSearch(inputEl.value, inputId);
    }
  },

  _searchTimeout: null,
  executeGlobalSearch: function (query, triggerElementId = 'global-search-input') {
    if (this._searchTimeout) clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this._executeGlobalSearchSync(query, triggerElementId);
    }, 300);
  },

  _executeGlobalSearchSync: function (query, triggerElementId = 'global-search-input') {
    const resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) return;

    if (!query.trim()) {
      resultsContainer.classList.remove('active');
      return;
    }

    resultsContainer.classList.add('active');
    
    const lowerQ = query.toLowerCase();
    
    let filterType = 'all';
    if (triggerElementId === 'discover-search-input') {
      const f = document.getElementById('discover-search-filter');
      if (f) filterType = f.dataset.value || f.value || 'all';
    } else {
      const f = document.getElementById('global-search-filter');
      if (f) filterType = f.dataset.value || f.value || 'all';
    }
    
    // Find the active search input to position against
    let anchorEl = document.getElementById(triggerElementId);
    if (!anchorEl || anchorEl.offsetParent === null) {
      anchorEl = document.getElementById('global-search-input');
      if (!anchorEl || anchorEl.offsetParent === null) {
        anchorEl = document.getElementById('discover-search-input');
      }
    }
    
    // Dynamically position the results container
    if (anchorEl && anchorEl.offsetParent !== null) {
      if (anchorEl.value !== query) {
        anchorEl.value = query;
      }
      const rect = anchorEl.getBoundingClientRect();
      resultsContainer.style.top = (rect.bottom + 10) + 'px';
      
      const width = window.innerWidth <= 768 ? 260 : 300;
      let leftPos = rect.right - width;
      if (leftPos < 10) leftPos = 10; // Keep it on screen
      resultsContainer.style.left = leftPos + 'px';
    } else {
      // Fallback position if triggered by language pill on mobile without visible search box
      resultsContainer.style.top = '80px';
      const width = window.innerWidth <= 768 ? 260 : 300;
      resultsContainer.style.left = ((window.innerWidth - width) / 2) + 'px';
    }

    const songs = (window.RasigaSeeds || []).filter(s => {
      const matchTitle = (s.title || '').toLowerCase().includes(lowerQ);
      const matchFilm = (s.film || '').toLowerCase().includes(lowerQ);
      const matchLang = (s.language || '').toLowerCase().includes(lowerQ);
      const matchSinger = (s.singer || '').toLowerCase().includes(lowerQ);
      const matchComposer = (s.composer || '').toLowerCase().includes(lowerQ);

      if (filterType === 'artist') {
        return matchSinger || matchComposer;
      } else if (filterType === 'song') {
        return matchTitle || matchFilm || matchLang;
      }
      return matchTitle || matchFilm || matchLang || matchSinger || matchComposer;
    });

    let resultsHTML = '';
    
    // If searching for artists or all, extract matching artists
    if (filterType === 'artist' || filterType === 'all') {
      const allArtists = new Set();
      (window.RasigaSeeds || []).forEach(s => {
        if (s.singer) s.singer.split(',').map(x => x.trim()).forEach(a => allArtists.add(a));
        if (s.composer) s.composer.split(',').map(x => x.trim()).forEach(a => allArtists.add(a));
        if (s.lyricist) s.lyricist.split(',').map(x => x.trim()).forEach(a => allArtists.add(a));
      });
      
      const matchingArtists = Array.from(allArtists).filter(a => a.toLowerCase().includes(lowerQ)).slice(0, 3);
      
      if (matchingArtists.length > 0) {
        resultsHTML += matchingArtists.map(artist => `
          <div class="gs-result-item" onclick="location.hash='#/artist/${encodeURIComponent(artist)}'; document.getElementById('global-search-results').classList.remove('active'); document.getElementById('global-search-input').value='';">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--gradient-brand); display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0;">
              ${Icons.get('artist', {width: 20, height: 20})}
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${artist}</div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:2px;">Artist Profile</div>
            </div>
          </div>
        `).join('');
      }
    }
    
    if (filterType !== 'artist') {
      resultsHTML += songs.slice(0, 5).map(song => {
        const grad = window.RasigaComponents ? window.RasigaComponents.getGradient(song.title) : 'var(--gradient-brand)';
        const ini = window.RasigaComponents ? window.RasigaComponents.getInitials(song.title) : song.title[0];
        return `
        <div class="gs-result-item" onclick="location.hash='#/song/${song.id}'; document.getElementById('global-search-results').classList.remove('active'); document.getElementById('global-search-input').value='';">
          <div style="width: 40px; height: 40px; border-radius: 8px; background: ${grad}; display:flex; align-items:center; justify-content:center; color:#fff; font-family:'DM Serif Display',serif; flex-shrink:0;">
            ${ini}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:600; font-size:0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.film || 'Indie'} &bull; ${song.year}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              <span style="display:flex; align-items:center; gap:0.2rem;" title="Singer">${Icons.get('user', {width:10, height:10})} ${song.singer || 'Unknown'}</span>
              <span style="display:flex; align-items:center; gap:0.2rem;" title="Music Director">${Icons.get('music', {width:10, height:10})} ${song.composer || 'Unknown'}</span>
            </div>
          </div>
        </div>
        `}).join('');
    }
    
    if (!resultsHTML) {
      resultsContainer.innerHTML = '<div style="padding:1rem; color:var(--text-muted); text-align:center;">No results found</div>';
    } else {
      resultsContainer.innerHTML = resultsHTML;
    }
    resultsContainer.classList.add('active');
  },

  // ── Custom Lists Management ──
  openListModal: function(songId) {
    const user = RasigaData.demoUser;
    if (!user || !user.id) {
      window.showToast("Please log in to add songs to a list.", 'error');
      return;
    }
    const lists = window.RasigaLists || [];
    
    let modal = document.getElementById('list-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'list-modal';
      modal.className = 'glass page-enter';
      modal.style.position = 'fixed';
      modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
      modal.style.zIndex = '2000';
      modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';
      modal.style.background = 'rgba(0,0,0,0.6)';
      document.body.appendChild(modal);
    }

    let listsHTML = lists.length === 0 ? '<p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">You have no lists yet.</p>' : lists.map(l => {
      const hasSong = l.list_songs && l.list_songs.some(ls => ls.song_id === songId);
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; border:1px solid var(--glass-border); border-radius:var(--radius-sm); margin-bottom:0.5rem;">
          <div>
            <div style="font-weight:600; font-family:'DM Serif Display',serif; font-size:1.1rem;">${l.name} ${l.is_public ? '' : '🔒'}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${(l.list_songs||[]).length} songs</div>
          </div>
          <button class="btn ${hasSong ? '' : 'btn-primary'}" onclick="RasigaApp.${hasSong ? 'removeSongFromList' : 'addSongToList'}('${l.id}', '${songId}')" style="padding:0.4rem 0.8rem; font-size:0.8rem;">
            ${hasSong ? 'Added' : 'Add'}
          </button>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="glass" style="width:90%; max-width:400px; padding:2rem; border-radius:var(--radius-md); position:relative; max-height:80vh; display:flex; flex-direction:column; background:var(--bg-color);">
        <button class="icon-btn" onclick="document.getElementById('list-modal').style.display='none'" style="position:absolute; top:1rem; right:1rem; color:var(--text-main);">${window.Icons ? window.Icons.get('close') : 'X'}</button>
        <h3 style="margin-bottom:1.5rem; font-family:'Cinzel Decorative', serif; font-size:1.5rem; color:var(--accent-teal);">Add to List</h3>
        <div style="flex:1; overflow-y:auto; margin-bottom:1.5rem;">
          ${listsHTML}
        </div>
        <form onsubmit="event.preventDefault(); RasigaApp.createList(this.list_name.value, this.is_public.checked, '${songId}');" style="display:flex; flex-direction:column; gap:0.5rem; border-top:1px solid var(--glass-border); padding-top:1.5rem;">
          <input type="text" name="list_name" placeholder="New list name..." required style="padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:var(--text-muted);">
            <input type="checkbox" name="is_public" checked /> Make list public
          </label>
          <button type="submit" class="btn btn-primary" style="margin-top:0.5rem; padding:0.8rem; justify-content:center; background:var(--accent-teal); border-color:var(--accent-teal);">Create & Add</button>
        </form>
      </div>
    `;
    modal.style.display = 'flex';
  },

  createList: async function(name, isPublic, autoAddSongId = null) {
    const user = RasigaData.demoUser;
    if (!user || !this.supabase) return;

    try {
      const { data, error } = await this.supabase.from('lists').insert({
        user_id: user.id,
        name: name,
        is_public: isPublic
      }).select().single();

      if (error) throw error;

      if (!window.RasigaLists) window.RasigaLists = [];
      data.list_songs = [];
      window.RasigaLists.unshift(data);

      if (autoAddSongId) {
        await this.addSongToList(data.id, autoAddSongId);
      } else {
        window.showToast("List created successfully!", 'success');
        if (location.hash === '#/my-lists' && window.RasigaRouter) window.RasigaRouter.handleRoute();
      }
    } catch(err) {
      console.error(err);
      window.showToast("Failed to create list.", 'error');
    }
  },

  addSongToList: async function(listId, songId) {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.from('list_songs').insert({
        list_id: listId,
        song_id: songId
      });
      if (error && error.code !== '23505') throw error; // ignore duplicate key

      // Update local state
      const list = window.RasigaLists.find(l => l.id === listId);
      if (list) {
        if (!list.list_songs) list.list_songs = [];
        if (!list.list_songs.some(ls => ls.song_id === songId)) {
          list.list_songs.push({ song_id: songId });
        }
      }
      
      // Refresh modal
      this.openListModal(songId);
    } catch(err) {
      console.error(err);
      window.showToast("Failed to add song.", 'error');
    }
  },

  removeSongFromList: async function(listId, songId) {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase.from('list_songs').delete().match({ list_id: listId, song_id: songId });
      if (error) throw error;

      // Update local state
      const list = window.RasigaLists.find(l => l.id === listId);
      if (list && list.list_songs) {
        list.list_songs = list.list_songs.filter(ls => ls.song_id !== songId);
      }
      
      // Refresh UI based on context
      if (document.getElementById('list-modal') && document.getElementById('list-modal').style.display !== 'none') {
        this.openListModal(songId);
      } else if (window.RasigaRouter) {
        window.RasigaRouter.handleRoute();
      }
    } catch(err) {
      console.error(err);
      window.showToast("Failed to remove song.", 'error');
    }
  },

  deleteList: async function(listId) {
    RasigaComponents.confirmAction('Delete List', 'Are you sure you want to delete this list?', async () => {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;

      window.RasigaLists = window.RasigaLists.filter(l => l.id !== listId);
      if (location.hash === '#/my-lists' || location.hash.startsWith('#/list/')) {
        location.hash = '#/my-lists';
        if (window.RasigaRouter) window.RasigaRouter.handleRoute();
      }
    } catch(err) {
      console.error(err);
      window.showToast("Failed to delete list.", 'error');
    }
    });
  },

  initMarquee: function() {
    const container = document.getElementById('trending-marquee');
    const content = document.getElementById('trending-marquee-content');
    if (!container || !content) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollInterval;
    let isResetting = false;

    // The content width is half of the total width because the cards are duplicated
    const halfWidth = content.scrollWidth / 2;

    container.addEventListener('scroll', () => {
      if (isResetting) return;
      if (container.scrollLeft >= halfWidth) {
        isResetting = true;
        container.scrollLeft -= halfWidth;
        setTimeout(() => isResetting = false, 10);
      } else if (container.scrollLeft <= 0) {
        isResetting = true;
        container.scrollLeft += halfWidth;
        setTimeout(() => isResetting = false, 10);
      }
    });

    const startAutoScroll = () => {
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        container.scrollLeft += 1;
      }, 20); // 50fps smooth scroll
    };

    const stopAutoScroll = () => {
      clearInterval(autoScrollInterval);
    };

    // Initially start in the middle so dragging left works immediately
    isResetting = true;
    container.scrollLeft = halfWidth;
    setTimeout(() => {
      isResetting = false;
      startAutoScroll();
    }, 50);

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      stopAutoScroll();
    });

    container.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        container.style.cursor = 'grab';
      }
      startAutoScroll();
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.style.cursor = 'grab';
      startAutoScroll();
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // Drag speed multiplier
      container.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      stopAutoScroll();
    }, {passive: true});
    
    container.addEventListener('touchend', () => {
      isDown = false;
      startAutoScroll();
    });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    }, {passive: true});

    container.addEventListener('mouseenter', stopAutoScroll);
  }
};

document.addEventListener('DOMContentLoaded', () => RasigaApp.init());
