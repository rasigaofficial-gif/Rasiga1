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
    } else if (hash.startsWith('#/artist/')) {
      routeFn = 'renderArtistPage';
      params = decodeURIComponent(hash.replace('#/artist/', ''));
      this.injectDynamicNavIcon(hash, params, 'artist');
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
        if (window.RasigaApp && typeof RasigaApp.initMarquee === 'function') {
          RasigaApp.initMarquee();
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

  injectDynamicNavIcon: function(hash, id, type = 'song') {
    let title = '';
    let iconName = 'guitar';
    
    if (type === 'song') {
      const song = RasigaSeeds.find(s => s.id === id);
      if (!song) return;
      title = song.title.length > 8 ? song.title.substring(0,8)+'...' : song.title;
    } else if (type === 'artist') {
      title = id.length > 8 ? id.substring(0,8)+'...' : id;
      iconName = 'artist';
    }

    // Mobile Nav
    const mNav = document.getElementById('mobile-nav-container');
    if (mNav && mNav.children.length >= 3) {
      const centerNav = mNav.children[2];
      
      if (!centerNav.hasAttribute('data-original-href')) {
        centerNav.setAttribute('data-original-href', centerNav.getAttribute('href') || '');
        centerNav.setAttribute('data-original-html', centerNav.innerHTML);
      }
      
      centerNav.setAttribute('href', hash);
      centerNav.innerHTML = `${Icons.get(iconName)}`;
      centerNav.id = 'm-dynamic-nav'; // mark it as dynamic so updateNavLinks can style it
    }

    // Desktop Nav
    const dNav = document.querySelector('.nav-links');
    if (dNav) {
      let dynNavD = document.getElementById('d-dynamic-nav');
      if (!dynNavD) {
        dynNavD = document.createElement('a');
        dynNavD.id = 'd-dynamic-nav';
        dynNavD.className = 'nav-link';
        dNav.appendChild(dynNavD);
      }
      dynNavD.href = hash;
      dynNavD.innerHTML = `${Icons.get(iconName, { width: 18, height: 18 })} ${title}`;
      dynNavD.style.display = '';
    }
  },

  removeDynamicNavIcon: function() {
    const mNav = document.getElementById('mobile-nav-container');
    if (mNav && mNav.children.length >= 3) {
      const centerNav = mNav.children[2];
      if (centerNav.hasAttribute('data-original-href')) {
        centerNav.setAttribute('href', centerNav.getAttribute('data-original-href'));
        centerNav.innerHTML = centerNav.getAttribute('data-original-html');
        centerNav.removeAttribute('id'); // remove dynamic marker
      }
    }
    const dLink = document.getElementById('d-dynamic-nav');
    if (dLink) dLink.remove();
  }
};
