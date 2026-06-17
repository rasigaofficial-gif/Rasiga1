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
            alert('Google Login failed: ' + error.message);
          } else {
            console.log('Google login successful natively!');
          }
        });
      }
    };

    // Fetch initial data from Supabase
    this.fetchInitialData();
  },

  fetchInitialData: function () {
    if (!this.supabase) return;
    
    // Fetch songs
    this.supabase.from('songs').select('*').order('total_ratings', { ascending: false }).then(({ data, error }) => {
      if (error) {
        console.error('Error fetching songs:', error);
        alert('Failed to load songs from database! Please check your connection.');
        return;
      }
      if (data) {
        window.RasigaSeeds = data;
        // Re-render if we are on a page that needs songs (like home or discover)
        if (window.RasigaRouter) window.RasigaRouter.handleRoute();
      }
    });

    // Fetch recent reviews for community pulse
    this.supabase.from('reviews').select('*, users(display_name, avatar_url), songs(title)').order('created_at', { ascending: false }).limit(6).then(({ data, error }) => {
      if (data) {
        window.RasigaReviews = data.map(r => ({
          id: r.id,
          name: r.users?.display_name || 'User',
          clr: '#f97316', // Placeholder color, could be generated from name
          text: r.body,
          rating: r.rating_id ? 5 : null, // Would need a join on ratings
          song: r.songs?.title || 'Unknown Song',
          likes: r.likes_count || 0,
          time: new Date(r.created_at).toLocaleDateString()
        }));
        if (window.RasigaRouter && location.hash === '#/') window.RasigaRouter.handleRoute();
      }
    });

    // Fetch suggestions (for admin)
    this.supabase.from('song_suggestions').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (data) {
        window.RasigaSuggestions = data.map(s => ({
          id: s.id,
          song: s.song_name,
          year: s.year,
          director: s.director,
          singer: s.singer,
          lyricist: s.lyricist,
          status: s.status,
          timestamp: new Date(s.created_at).getTime()
        }));
      }
    });
  },

  // Sync Supabase auth user with our local RasigaData.demoUser
  _syncUserFromSupabase: function (authUser) {
    if (!this.supabase) return;

    this.supabase.from('users').select('*').eq('id', authUser.id).single().then(({ data, error }) => {
      if (data) {
        // User exists in our users table — fully onboarded
        window.RasigaData.demoUser = {
          id: data.id,
          email: authUser.email,
          displayName: data.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          username: data.username,
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
        
        // Fetch following list
        this.supabase.from('follows').select('users!follows_following_id_fkey(username)').eq('follower_id', data.id).then(({ data: fData }) => {
          window.RasigaData.following = {};
          if (fData) {
            fData.forEach(f => window.RasigaData.following[f.users.username] = true);
          }
          window.RasigaRouter.handleRoute();
        });

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
    });
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
        .select('*, users(display_name), ratings(score), review_likes(reaction_type, user_id)')
        .eq('song_id', songId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let reviewsHTML = '';
      const user = RasigaData.demoUser;

      if (!RasigaData.userRatings) RasigaData.userRatings = {};
      if (!RasigaData.userComments) RasigaData.userComments = {};
      if (!RasigaData.userReactions) RasigaData.userReactions = {};

      if (user && user.onboarded) {
        // Check if current user has a rating/review
        const myReview = reviews.find(r => r.user_id === user.id);
        if (myReview) {
          RasigaData.userRatings[songId] = myReview.ratings?.score;
          RasigaData.userComments[songId] = myReview.body;
        } else {
          // If no review, check if they just have a rating
          const { data: myRating } = await this.supabase.from('ratings').select('score').eq('user_id', user.id).eq('song_id', songId).single();
          if (myRating) {
            RasigaData.userRatings[songId] = myRating.score;
          }
        }
      }

      const otherReviews = reviews.filter(r => !user || r.user_id !== user.id);

      if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';
        return;
      }

      // Generate HTML for other reviews
      otherReviews.forEach(r => {
        const clr = '#14b8a6'; // placeholder
        const time = new Date(r.created_at).toLocaleDateString();
        const score = r.ratings?.score || '?';
        const name = r.users?.display_name || 'Anonymous';
        
        // Count likes/poops
        const likes = (r.review_likes || []).filter(l => l.reaction_type === 'like').length;
        const poops = (r.review_likes || []).filter(l => l.reaction_type === 'poop').length;
        
        let reaction = null;
        if (user && r.review_likes) {
          const myReaction = r.review_likes.find(l => l.user_id === user.id);
          if (myReaction) reaction = myReaction.reaction_type;
          if (reaction) RasigaData.userReactions[r.id] = reaction;
        }

        reviewsHTML += \`
          <div class="glass" style="padding: 1.2rem; margin-bottom: 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom: 0.8rem;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: \${clr}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">\${name[0]}</div>
                <div>
                  <a href="#/user/\${name.toLowerCase().replace(/[^a-z0-9]/g, '')}" style="font-weight:600; font-size:0.95rem; text-decoration:none; color:inherit;">\${name}</a>
                  <div style="font-size:0.8rem; color:var(--text-muted);">\${time}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.2rem; color:var(--accent-gold); font-size:0.9rem; font-weight:600;">
                \${window.Icons ? window.Icons.get('star', { width: 14, height: 14, fill: 'currentColor' }) : ''} \${score}
              </div>
            </div>
            <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">\${r.body}</p>
            <div style="display:flex; align-items:center; gap: 1rem; margin-top: 1rem;">
              <button class="btn-react btn-like \${reaction === 'like' ? 'anim-heart-fill' : ''}" onclick="RasigaApp.toggleLike(this, \${likes - (reaction==='like'?1:0)}, '\${r.id}')">
                \${window.Icons ? window.Icons.get('heart', { width: 16, height: 16 }) : ''}
                <span class="like-count" data-base="\${likes - (reaction==='like'?1:0)}" style="font-size:0.8rem;">\${likes}</span>
              </button>
              <button class="btn-react btn-poop \${reaction === 'poop' ? 'anim-poop-fill' : ''}" onclick="RasigaApp.togglePoop(this, \${poops - (reaction==='poop'?1:0)}, '\${r.id}')">
                \${window.Icons ? window.Icons.get('poop', { width: 16, height: 16 }) : ''}
                <span class="poop-count" data-base="\${poops - (reaction==='poop'?1:0)}" style="font-size:0.8rem;">\${poops}</span>
              </button>
              <button class="btn-react" onclick="RasigaApp.shareComment('\${songId}')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                <span style="font-size:0.8rem;">Share</span>
              </button>
            </div>
          </div>
        \`;
      });
      reviewsContainer.innerHTML = reviewsHTML;

      // Update the user's rating section if needed
      if (user && user.onboarded && RasigaData.userRatings[songId]) {
        RasigaApp.setRatingInput(songId, RasigaData.userRatings[songId]);
        if (RasigaData.userComments[songId]) {
          const urSection = document.getElementById('user-review-section');
          if (urSection) {
            urSection.innerHTML = \`
              <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                <div style="display:flex; align-items:center;">
                  <div style="position:relative; display:inline-block; width:140px; height:28px;">
                    <div style="display:flex; position:absolute; top:0; left:0; pointer-events:none;">
                      \${Array(5).fill(0).map(() => \`<span style="color:var(--text-muted); opacity:0.5; flex-shrink:0; display:flex;">\${window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'none', color: 'currentColor' }) : ''}</span>\`).join('')}
                    </div>
                    <div id="stars-fg-\${songId}" style="display:flex; position:absolute; top:0; left:0; width:\${(RasigaData.userRatings[songId] / 5) * 100}%; overflow:hidden; pointer-events:none; white-space:nowrap;">
                      \${Array(5).fill(0).map(() => \`<span style="color:var(--accent-gold); flex-shrink:0; display:flex;">\${window.Icons ? window.Icons.get('star', { width: 28, height: 28, viewBox: "2 1.5 20 20", fill: 'var(--accent-gold)', color: 'var(--accent-gold)' }) : ''}</span>\`).join('')}
                    </div>
                  </div>
                </div>
                <span style="font-size: 0.9rem; color: var(--text-muted);" id="user-rating-text-\${songId}">\${RasigaData.userRatings[songId]} Stars</span>
              </div>
              <p style="font-size:1rem; margin-bottom:1rem;">\${RasigaData.userComments[songId]}</p>
              <button onclick="RasigaApp.editComment('\${songId}')" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);">Edit</button>
            \`;
          }
        }
      }
    } catch (err) {
      console.error(err);
      reviewsContainer.innerHTML = '<p style="color:var(--text-muted)">Failed to load reviews.</p>';
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

  openSuggestSongModal: function () {
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
    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; max-width: 600px; margin: 0 auto; width: 100%;">
        <h2 style="font-family:'DM Serif Display',serif; font-size:2rem; margin:0;">Suggest a Song</h2>
        <button class="icon-btn" onclick="RasigaApp.closeSuggestSongModal()" style="color:var(--text-main);">${Icons.get('close')}</button>
      </div>
      <div style="overflow-y:auto; flex:1; max-width: 600px; margin: 0 auto; width: 100%;">
        <p style="color:var(--text-muted); margin-bottom:1.5rem;">Help us expand our musical diary! Fill out the details below.</p>
        <form onsubmit="event.preventDefault(); RasigaApp.submitSongSuggestion(this);" style="display:flex; flex-direction:column; gap:1rem;">
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Song Name</label>
            <input name="song" type="text" required style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Year</label>
            <input name="year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="e.g. 2026" required style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Music Director</label>
            <input name="director" type="text" required style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Singer(s)</label>
            <input name="singer" type="text" required style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <div>
            <label style="display:block; font-size:0.9rem; color:var(--text-muted); margin-bottom:0.3rem;">Lyricist</label>
            <input name="lyricist" type="text" required style="width:100%; padding:0.8rem; border-radius:var(--radius-sm); border:1px solid var(--glass-border); background:rgba(0,0,0,0.1); color:inherit; outline:none;" />
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top:1rem; padding:1rem; font-size:1.1rem; justify-content:center;">Submit Suggestion</button>
        </form>
      </div>
    `;
    modal.style.display = 'flex';
  },

  closeSuggestSongModal: function () {
    const modal = document.getElementById('suggest-modal');
    if (modal) modal.style.display = 'none';
  },

  submitSongSuggestion: function (form) {
    const newSug = {
      id: 'sug' + Date.now(),
      song: form.song.value,
      year: parseInt(form.year.value) || 0,
      director: form.director.value,
      singer: form.singer.value,
      lyricist: form.lyricist.value,
      status: 'Pending',
      timestamp: Date.now()
    };
    window.RasigaSuggestions.unshift(newSug);
    this.closeSuggestSongModal();
    alert('Thank you! Your song suggestion has been sent for review. You can track its status in your Profile.');
    
    // Refresh profile page if it's currently open
    if (location.hash === '#/profile' && window.RasigaRouter) {
      window.RasigaRouter.handleRoute();
    }
  },

  deleteSuggestion: function (id) {
    if (confirm('Do you want to delete this suggestion?')) {
      window.RasigaSuggestions = window.RasigaSuggestions.filter(s => s.id !== id);
      if (location.hash === '#/profile' && window.RasigaRouter) {
        window.RasigaRouter.handleRoute();
      }
    }
  },

  mockOfflineError: function () {
    alert("Please connect online to perform this action.");
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
        alert("App link copied to clipboard! You can now paste it to your friends.");
      });
    }
  },

  loginWith: function (provider) {
    if (!this.supabase) {
      alert('Connection error. Please try again later.');
      return;
    }

    if (provider === 'google') {
      this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/#/profile'
        }
      }).then(({ error }) => {
        if (error) alert('Google login failed: ' + error.message);
      });
    } else if (provider === 'email') {
      const emailInput = document.getElementById('login-email-input');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) { alert('Please enter your email address.'); return; }

      this.supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/#/profile'
        }
      }).then(({ error }) => {
        if (error) {
          alert('Login failed: ' + error.message);
        } else {
          alert('Check your email! We sent you a magic login link.');
        }
      });
    }
  },

  submitOnboarding: function (form) {
    const displayName = form.displayName.value.trim();
    const username = form.username.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const themeColor = form.themeColor.value;

    if (!displayName || !username) {
      alert('Please fill in all fields.');
      return;
    }

    const user = window.RasigaData.demoUser;
    if (!user || !user.id) { alert('Auth error. Please try logging in again.'); return; }

    if (!this.supabase) { alert('Connection error.'); return; }

    // Insert into Supabase users table
    this.supabase.from('users').insert({
      id: user.id,
      username: username,
      display_name: displayName
    }).then(({ error }) => {
      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          alert('That username is already taken. Please choose another.');
        } else {
          alert('Error creating profile: ' + error.message);
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
    
    if (!displayNameInput) return;

    const user = window.RasigaData.demoUser;
    if (!user) return;

    const newDisplayName = displayNameInput.value.trim();

    if (!newDisplayName) {
      alert("Display Name cannot be empty.");
      return;
    }

    // Update locally
    user.displayName = newDisplayName;
    user.avatar = newDisplayName[0].toUpperCase();
    localStorage.setItem('rasiga_user', JSON.stringify(user));

    // Update in Supabase
    if (this.supabase && user.id) {
      this.supabase.from('users').update({ display_name: newDisplayName }).eq('id', user.id).then(({ error }) => {
        if (error) console.warn('Profile update error:', error.message);
      });
    }

    alert("Profile changes saved successfully!");
    window.RasigaRouter.handleRoute();
  },

  logout: function () {
    if (this.supabase) {
      this.supabase.auth.signOut().then(() => {
        localStorage.removeItem('rasiga_user');
        window.RasigaData.demoUser = null;
        window.RasigaRouter.handleRoute();
      });
    } else {
      localStorage.removeItem('rasiga_user');
      window.RasigaData.demoUser = null;
      window.RasigaRouter.handleRoute();
    }
  },

  toggleFollow: async function(username) {
    if (!window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to follow users. Go to Login page?')) {
        location.hash = '#/profile';
      }
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
      alert("Failed to update follow status.");
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

      const xp = (reviews ? reviews.length * 50 : 0) + (user.xp || 0);
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
          <div class="glass" style="padding: 1.2rem; margin-bottom: 1rem; border-left: 2px solid ${reviewerClr};">
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
            <p style="font-size:0.95rem; line-height:1.5; color:var(--text-main);">${r.body}</p>
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

        <div class="glass" style="padding: 2rem; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative;">
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
              <div style="font-weight:bold; font-size:1.1rem; font-family:'DM Serif Display',serif;">${u.display_name || u.username}</div>
              <div style="font-size:0.85rem; color:var(--text-muted);">@${u.username}</div>
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
    for (let i = 0; i < 40; i++) {
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

    function draw() {
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
      requestAnimationFrame(draw);
    }
    draw();
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

  handleSearchInput: function (e) {
    const rawQ = e.target ? e.target.value.trim() : (e.value || '');
    const q = rawQ.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sug = document.getElementById('search-suggestions');
    if (!sug) return;
    if (q.length < 2 && rawQ.length < 2) {
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
        <div style="padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;" onclick="document.getElementById('search-input').value='${m.title}'; RasigaApp.executeSearch();">
          <div style="font-weight:bold; font-size:0.95rem;">${m.title}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${m.singer} &bull; ${m.film || 'Indie'}</div>
        </div>
      `).join('');
      sug.style.display = 'flex';
    } else {
      sug.innerHTML = '<div style="padding: 0.8rem 1rem; color:var(--text-muted); font-size:0.9rem;">No suggestions...</div>';
      sug.style.display = 'flex';
    }
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

      if (filter === 'all' || filter === 'singer') match = match || si.includes(q);
      if (filter === 'all' || filter === 'film') match = match || f.includes(q);
      if (filter === 'all' || filter === 'composer') match = match || c.includes(q);
      if (filter === 'all') match = match || t.includes(q);
      if (match && !matches.find(m => m.id === s.id)) matches.push(s);
    });

    const grid = document.getElementById('discover-grid');
    if (!grid) return;

    if (matches.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color:var(--text-muted);">No results found.</div>';
    } else {
      let html = '';
      matches.forEach((s, i) => html += window.RasigaComponents.SongCard(s, i));
      grid.innerHTML = html;
    }
  },

  openSong: function (id) {
    location.hash = '#/song/' + id;
  },

  setRatingInput: function (id, val) {
    const rating = parseFloat(val);
    if (!RasigaData.userRatings) RasigaData.userRatings = {};
    RasigaData.userRatings[id] = rating;

    const fg = document.getElementById(`stars-fg-${id}`);
    if (fg) fg.style.width = (rating / 5) * 100 + '%';

    const txt = document.getElementById(`user-rating-text-${id}`);
    if (txt) txt.textContent = rating > 0 ? rating + ' Stars' : 'Tap to rate';
  },

  submitComment: async function (id) {
    const textEl = document.getElementById('review-textarea-' + id);
    const text = textEl ? textEl.value.trim() : '';

    if (!text) {
      alert("A text comment is mandatory to submit your review.");
      return;
    }

    const rating = RasigaData.userRatings && RasigaData.userRatings[id];
    if (!rating) {
      alert("Please select a star rating before submitting your review.");
      return;
    }

    const user = RasigaData.demoUser;
    if (!user || !user.id || !this.supabase) {
      alert("You must be logged in to review.");
      return;
    }

    try {
      // 1. Upsert rating
      const { data: ratingData, error: ratingError } = await this.supabase
        .from('ratings')
        .upsert({ user_id: user.id, song_id: id, score: rating }, { onConflict: 'user_id, song_id' })
        .select('id')
        .single();

      if (ratingError) throw ratingError;

      // 2. Insert review
      const { error: reviewError } = await this.supabase
        .from('reviews')
        .insert({ user_id: user.id, song_id: id, rating_id: ratingData.id, body: text });

      if (reviewError) throw reviewError;

      // 3. Update local state for immediate UI reflection
      if (!RasigaData.userComments) RasigaData.userComments = {};
      RasigaData.userComments[id] = text;

      // Re-fetch initial data to get updated community pulse and song stats
      await this.fetchInitialData();

      RasigaRouter.handleRoute();
    } catch (err) {
      console.error(err);
      alert("Error submitting review: " + err.message);
    }
  },

  editComment: function (id) {
    const hasText = RasigaData.userComments && RasigaData.userComments[id];
    const hasRating = RasigaData.userRatings && RasigaData.userRatings[id];
    if (!hasText && !hasRating) return;

    const currentText = hasText ? RasigaData.userComments[id] : '';

    if (hasText) delete RasigaData.userComments[id];
    if (hasRating) delete RasigaData.userRatings[id]; // Optionally delete rating to force re-rating, or leave it. Let's leave rating intact so they can just edit text. Wait, if we want them to re-edit, they might want to change rating. The stars are always clickable anyway. But we must delete userComments so the textarea shows up!

    // Wait, if we delete userComments but KEEP userRatings, the UI will still think it's "submitted" because of `userComment || userRating` in pages.js!
    // So we must temporarily store the rating and delete it from data, OR add an `isEditing` state.
    // It's easier to just delete both and let them re-submit both.
    const currentRating = hasRating ? RasigaData.userRatings[id] : 0;
    if (hasRating) delete RasigaData.userRatings[id];

    RasigaRouter.handleRoute();

    setTimeout(() => {
      if (currentRating > 0) {
        RasigaApp.setRating(id, currentRating); // visually restore the stars
      }
      const ta = document.getElementById('review-textarea-' + id);
      if (ta) {
        ta.value = currentText;
        ta.focus();
      }
    }, 200);
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

        const poopBtn = btn.parentElement.querySelector('.btn-poop');
        if (poopBtn && poopBtn.classList.contains('anim-poop-fill')) {
          const poopBase = parseInt(poopBtn.querySelector('.poop-count').getAttribute('data-base'));
          poopBtn.classList.remove('anim-poop-fill', 'anim-poop-pop');
          poopBtn.style.color = '';
          poopBtn.querySelector('.poop-count').textContent = poopBase;
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

  togglePoop: async function (btn, baseCount, reviewId) {
    if (!window.RasigaData || !window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to react. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }

    const user = RasigaData.demoUser;
    const isPooped = btn.classList.toggle('anim-poop-fill');
    btn.classList.remove('anim-poop-pop');

    void btn.offsetWidth;
    if (!RasigaData.userReactions) RasigaData.userReactions = {};

    try {
      if (isPooped) {
        btn.classList.add('anim-poop-pop');
        btn.querySelector('.poop-count').textContent = baseCount + 1;
        if (reviewId) RasigaData.userReactions[reviewId] = 'poop';

        const likeBtn = btn.parentElement.querySelector('.btn-like');
        if (likeBtn && likeBtn.classList.contains('anim-heart-fill')) {
          const likeBase = parseInt(likeBtn.querySelector('.like-count').getAttribute('data-base'));
          likeBtn.classList.remove('anim-heart-fill', 'anim-heart-pop');
          likeBtn.style.color = '';
          likeBtn.querySelector('.like-count').textContent = likeBase;
        }

        if (this.supabase && reviewId && !reviewId.includes('_')) {
          await this.supabase.from('review_likes').upsert({ user_id: user.id, review_id: reviewId, reaction_type: 'poop' }, { onConflict: 'user_id, review_id' });
        }
      } else {
        btn.style.color = '';
        btn.querySelector('.poop-count').textContent = baseCount;
        if (reviewId && RasigaData.userReactions[reviewId] === 'poop') delete RasigaData.userReactions[reviewId];

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
    if (!songId) { alert("Cannot share this review."); return; }
    const url = window.location.origin + window.location.pathname + '#/song/' + songId;
    if (navigator.share) {
      navigator.share({
        title: 'Rasiga Review',
        text: 'Check out this review on Rasiga!',
        url: url
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
    }
  }
};

document.addEventListener('DOMContentLoaded', () => RasigaApp.init());
