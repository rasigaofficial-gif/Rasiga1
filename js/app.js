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
          displayName: data.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          username: data.username,
          avatar: (data.display_name || 'U')[0].toUpperCase(),
          onboarded: true,
          xp: data.xp || 0,
          joinedAt: data.joined_at,
          is_admin: data.is_admin || false,
          badges: [],
          streak: 1,
          stats: { ratings: 0, reviews: 0, languages: 0, daysListened: 1 }
        };
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
    });
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

  toggleFollow: function(username) {
    if (!window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to follow users. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }
    
    if (!window.RasigaData.following) window.RasigaData.following = {};
    if (window.RasigaData.following[username]) {
      delete window.RasigaData.following[username];
    } else {
      window.RasigaData.following[username] = true;
    }
    
    // Refresh the public profile page to show updated button
    window.RasigaRouter.handleRoute();
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

  submitComment: function (id) {
    const textEl = document.getElementById('review-textarea-' + id);
    const text = textEl ? textEl.value.trim() : '';

    if (!text) {
      alert("A text comment is mandatory to submit your review.");
      return;
    }

    if (!RasigaData.userComments) RasigaData.userComments = {};
    RasigaData.userComments[id] = text;

    RasigaRouter.handleRoute();
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

  toggleLike: function (btn, baseCount, reviewId) {
    if (!window.RasigaData || !window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to react. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }

    const isLiked = btn.classList.toggle('anim-heart-fill');
    btn.classList.remove('anim-heart-pop');

    void btn.offsetWidth; // trigger reflow
    if (!RasigaData.userReactions) RasigaData.userReactions = {};

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
    } else {
      btn.querySelector('.like-count').textContent = baseCount;
      if (reviewId && RasigaData.userReactions[reviewId] === 'like') delete RasigaData.userReactions[reviewId];
    }
    btn.blur();
  },

  togglePoop: function (btn, baseCount, reviewId) {
    if (!window.RasigaData || !window.RasigaData.demoUser || !window.RasigaData.demoUser.onboarded) {
      if (confirm('Please log in to react. Go to Login page?')) {
        location.hash = '#/profile';
      }
      return;
    }

    const isPooped = btn.classList.toggle('anim-poop-fill');
    btn.classList.remove('anim-poop-pop');

    void btn.offsetWidth;
    if (!RasigaData.userReactions) RasigaData.userReactions = {};

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
    } else {
      btn.style.color = '';
      btn.querySelector('.poop-count').textContent = baseCount;
      if (reviewId && RasigaData.userReactions[reviewId] === 'poop') delete RasigaData.userReactions[reviewId];
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
