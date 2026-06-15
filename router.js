(function () {
  'use strict';

  function handleRoute() {
    var hash = location.hash || '#discover';
    var main = document.querySelector('.main');
    var chartsPage = document.getElementById('charts-page');
    var artistPage = document.getElementById('artist-page');

    var navLinks = document.querySelectorAll('.nav-links a.nav-item');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.toggle('active', navLinks[i].getAttribute('data-hash') === hash || (hash==='' && navLinks[i].getAttribute('data-hash')==='#discover') || (hash==='#/' && navLinks[i].getAttribute('data-hash')==='#discover'));
    }

    if (!hash.startsWith('#/')) {
      // Plain anchor or empty. Ensure normal visibility.
      if (main) main.style.display = 'block';
      if (chartsPage) chartsPage.style.display = 'none';
      if (artistPage) artistPage.style.display = 'none';
      
      // Close modal if hash doesn't start with #/song
      if (!hash.startsWith('#/song/') && window.Rasiga) {
         window.Rasiga.closeModals();
      }
      return;
    }

    if (hash.startsWith('#/song/')) {
      // Song route
      var id = hash.replace('#/song/', '');
      if (window.Rasiga) {
        var songs = window.Rasiga.getSongs();
        for (var i = 0; i < songs.length; i++) {
          if (songs[i].id === id) {
            window.Rasiga.openSong(songs[i]);
            break;
          }
        }
      }
      // Note: we don't modify main/charts visibility here, so it layers over whatever is currently active
      return;
    }

    // Full page routes
    if (window.Rasiga) window.Rasiga.closeModals();

    if (hash === '#/charts') {
      if (main) main.style.display = 'none';
      if (artistPage) artistPage.style.display = 'none';
      if (chartsPage) {
        chartsPage.style.display = 'block';
        window.scrollTo(0, 0);
        if (window.Rasiga) {
          var all = window.Rasiga.getSongs().slice();
          all.sort(function(a,b){return b.avg_rating - a.avg_rating || b.total_ratings - a.total_ratings;});
          window.Rasiga.renderRanked('charts-page-grid', all.slice(0, 50));
        }
      }
      return;
    }

    if (hash.startsWith('#/artist/')) {
      var name = decodeURIComponent(hash.replace('#/artist/', ''));
      if (main) main.style.display = 'none';
      if (chartsPage) chartsPage.style.display = 'none';
      if (artistPage) {
        artistPage.style.display = 'block';
        window.scrollTo(0, 0);
        if (window.Rasiga) {
          var all = window.Rasiga.getSongs();
          var artistSongs = [];
          var q = name.toLowerCase();
          var totalRating = 0;
          for (var i = 0; i < all.length; i++) {
            var s = all[i];
            if ((s.singer && s.singer.toLowerCase().indexOf(q) !== -1) || 
                (s.composer && s.composer.toLowerCase().indexOf(q) !== -1)) {
              artistSongs.push(s);
              totalRating += s.avg_rating;
            }
          }
          var avg = artistSongs.length ? (totalRating / artistSongs.length).toFixed(1) : 0;
          
          document.getElementById('ap-name').textContent = name;
          document.getElementById('ap-count').textContent = artistSongs.length + ' songs';
          document.getElementById('ap-rating').textContent = avg + ' avg rating';
          
          window.Rasiga.renderScroll('artist-page-grid', artistSongs);
        }
      }
      return;
    }
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', handleRoute);

  window.RasigaRouter = { handleRoute: handleRoute };
})();
