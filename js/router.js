window.RasigaRouter = {
  routes: {
    '#/': 'renderHome',
    '#/discover': 'renderDiscover',
    '#/charts': 'renderCharts',
    '#/reviews': 'renderReviews',
    '#/my-reviews': 'renderMyReviews',
    '#/profile': 'renderProfile',
    '#/contact': 'renderContact',
    '#/donate': 'renderDonate',
    '#/privacy': 'renderPrivacy',
    '#/analytics': 'renderAnalytics',
    '#/leaderboards': 'renderLeaderboards',
    '#/admin': 'renderAdminPanel',
    '#/login': 'renderLogin',
    '#/my-lists': 'renderMyLists'
  },

  init: function() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Handle initial route
    if (!location.hash) location.hash = '#/';
    else this.handleRoute();
  },

  handleRoute: function() {
    let hash = location.hash;
    
    // Check if it's a dynamic route
    let routeFn = this.routes[hash] || this.routes['#/'];
    let params = null;

    if (hash.startsWith('#/song/')) {
      routeFn = 'renderSongPage';
      params = hash.replace('#/song/', '');
      this.injectDynamicNavIcon(hash, params);
    } else if (hash.startsWith('#/list/')) {
      routeFn = 'renderListDetails';
      params = hash.replace('#/list/', '');
      this.removeDynamicNavIcon();
    } else if (hash.startsWith('#/user/')) {
      routeFn = 'renderPublicProfile';
      params = hash.replace('#/user/', '');
      this.removeDynamicNavIcon();
    } else if (hash.startsWith('#/following')) {
      routeFn = 'renderConnections';
      params = 'following';
      this.removeDynamicNavIcon();
    } else if (hash.startsWith('#/followers')) {
      routeFn = 'renderConnections';
      params = 'followers';
      this.removeDynamicNavIcon();
    } else {
      this.removeDynamicNavIcon();
    }

    const container = document.getElementById('page-container');
    
    // Smooth transition
    container.style.opacity = '0';
    setTimeout(() => {
      container.innerHTML = params ? RasigaPages[routeFn](params) : RasigaPages[routeFn]();
      container.style.opacity = '1';
      window.scrollTo(0, 0);
      this.updateNavLinks(hash);
      
      // Inject dynamic hero copy on Home page load
      if ((hash === '#/' || hash === '') && typeof applyHeroCopy === 'function') {
        applyHeroCopy(getRandomCopy());
        if (window.RasigaApp && typeof RasigaApp.fetchHomeStats === 'function') {
          RasigaApp.fetchHomeStats();
        }
      }

      // Fetch dynamic reviews for song page
      if (routeFn === 'renderSongPage' && params) {
        RasigaApp.fetchSongReviews(params);
      }

      // Fetch dynamic public profile
      if (routeFn === 'renderPublicProfile' && params) {
        RasigaApp.fetchPublicProfile(params);
      }

      // Fetch dynamic connections
      if (routeFn === 'renderConnections' && params) {
        RasigaApp.fetchConnections(params);
      }

      // Fetch dynamic personal profile stats
      if (routeFn === 'renderProfile') {
        RasigaApp.fetchMyProfileStats();
      }

      if (routeFn === 'renderProfile' || routeFn === 'renderMyReviews') {
        RasigaApp.fetchMySuggestions();
      }

      // Fetch admin suggestions
      if (routeFn === 'renderAdminPanel') {
        RasigaApp.fetchAdminSuggestions();
      }

      // Explicitly render Google Sign-In button if it exists (since this is an SPA)
      if (document.getElementById('g_id_onload') && window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: document.getElementById('g_id_onload').getAttribute('data-client_id'),
          callback: window.handleGoogleLogin
        });
        window.google.accounts.id.renderButton(
          document.querySelector('.g_id_signin'),
          { theme: 'outline', size: 'large', type: 'standard', shape: 'pill', text: 'continue_with', width: 320 }
        );
      }
    }, 150);
  },

  updateNavLinks: function(hash) {
    document.querySelectorAll('.nav-link, .bnav-item').forEach(el => {
      if (el.getAttribute('href') === hash) el.classList.add('active');
      else el.classList.remove('active');
    });
  },

  injectDynamicNavIcon: function(hash, id) {
    const song = RasigaSeeds.find(s => s.id === id);
    if (!song) return;
    const title = song.title.length > 8 ? song.title.substring(0,8)+'...' : song.title;

    // Mobile Nav
    const mNav = document.getElementById('mobile-nav-container');
    if (mNav && !document.getElementById('m-dynamic-nav')) {
      const children = Array.from(mNav.children);
      const insertIdx = Math.floor(children.length / 2);
      const link = document.createElement('a');
      link.href = hash;
      link.id = 'm-dynamic-nav';
      link.className = 'bnav-item';
      link.innerHTML = `${Icons.get('guitar')}<span>${title}</span>`;
      mNav.insertBefore(link, mNav.children[insertIdx]);
    } else if (document.getElementById('m-dynamic-nav')) {
      const link = document.getElementById('m-dynamic-nav');
      link.href = hash;
      link.querySelector('span').innerText = title;
    }

    // Desktop Nav
    const dNav = document.querySelector('.nav-links');
    if (dNav && !document.getElementById('d-dynamic-nav')) {
      const children = Array.from(dNav.children);
      const insertIdx = Math.floor(children.length / 2);
      const link = document.createElement('a');
      link.href = hash;
      link.id = 'd-dynamic-nav';
      link.className = 'nav-link';
      link.innerHTML = `${Icons.get('guitar', {width: 16, height: 16, style: 'margin-right:4px; vertical-align:text-bottom;'})} ${title}`;
      dNav.insertBefore(link, dNav.children[insertIdx]);
    } else if (document.getElementById('d-dynamic-nav')) {
      const link = document.getElementById('d-dynamic-nav');
      link.href = hash;
      link.innerHTML = `${Icons.get('guitar', {width: 16, height: 16, style: 'margin-right:4px; vertical-align:text-bottom;'})} ${title}`;
    }
  },

  removeDynamicNavIcon: function() {
    const mLink = document.getElementById('m-dynamic-nav');
    if (mLink) mLink.remove();
    const dLink = document.getElementById('d-dynamic-nav');
    if (dLink) dLink.remove();
  }
};
