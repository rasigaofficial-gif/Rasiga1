import re

# 1. Update pages.js renderLeaderboards
with open('js/pages.js', 'r', encoding='utf-8') as f:
    pages_content = f.read()

filters_html = """
        <div class="flex-between mb-2 page-enter" style="animation-delay: 0.1s;">
          <h3 style="font-family:'Cinzel Decorative', serif;">Leaderboards</h3>
          <div style="display:flex; gap:1rem;">
            <select id="lb-timeframe" class="glass-input" style="width:auto; padding:0.5rem;" onchange="RasigaApp.fetchLeaderboards()">
              <option value="all">All-Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            <select id="lb-language" class="glass-input" style="width:auto; padding:0.5rem;" onchange="RasigaApp.fetchLeaderboards()">
              <option value="all">All Languages</option>
              ${(window.RasigaSeeds ? [...new Set(window.RasigaSeeds.map(s => s.language))].filter(Boolean) : ['Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada']).map(l => `<option value="${l}">${l}</option>`).join('')}
            </select>
          </div>
        </div>
"""

pages_content = pages_content.replace(
    '<div id="leaderboards-container" style="display:flex; flex-wrap:wrap; gap:2rem;">',
    filters_html + '\n        <div id="leaderboards-container" style="display:flex; flex-wrap:wrap; gap:2rem;">'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(pages_content)

# 2. Update app.js fetchLeaderboards
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

new_fetch_leaderboards = """
  fetchLeaderboards: async function() {
    const container = document.getElementById('leaderboards-container');
    if (!container || !this.supabase) return;

    const timeframe = document.getElementById('lb-timeframe') ? document.getElementById('lb-timeframe').value : 'all';
    const language = document.getElementById('lb-language') ? document.getElementById('lb-language').value : 'all';

    container.innerHTML = '<div class="skeleton skeleton-card" style="height: 400px; border-radius: var(--radius-lg);"></div>';

    try {
      let dateFilter = null;
      if (timeframe === 'month') {
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      } else if (timeframe === 'week') {
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
      }

      let ratingsQuery = this.supabase.from('ratings').select('user_id, song_id, rated_at');
      if (dateFilter) ratingsQuery = ratingsQuery.gte('rated_at', dateFilter.toISOString());
      
      let reviewsQuery = this.supabase.from('reviews').select('user_id, song_id, created_at');
      if (dateFilter) reviewsQuery = reviewsQuery.gte('created_at', dateFilter.toISOString());

      const [ratingsRes, reviewsRes, usersRes] = await Promise.all([
        ratingsQuery,
        reviewsQuery,
        this.supabase.from('users').select('id, username, display_name, avatar_url, xp')
      ]);

      if (ratingsRes.error) throw ratingsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;
      if (usersRes.error) throw usersRes.error;

      let ratingsData = ratingsRes.data || [];
      let reviewsData = reviewsRes.data || [];
      const usersData = usersRes.data || [];

      if (language !== 'all') {
         const allSongs = window.RasigaSeeds || [];
         const langSongs = new Set(allSongs.filter(s => s.language === language).map(s => s.id));
         ratingsData = ratingsData.filter(r => langSongs.has(r.song_id));
         reviewsData = reviewsData.filter(r => langSongs.has(r.song_id));
      }

      const userXP = {};
      const userReviewCounts = {};
      usersData.forEach(u => {
        userXP[u.id] = (timeframe === 'all' && language === 'all') ? (u.xp || 0) : 0;
        userReviewCounts[u.id] = 0;
      });

      if (timeframe !== 'all' || language !== 'all') {
        ratingsData.forEach(r => {
          if (userXP[r.user_id] !== undefined) userXP[r.user_id] += 10;
        });
        reviewsData.forEach(r => {
          if (userXP[r.user_id] !== undefined) {
            userXP[r.user_id] += 20;
            userReviewCounts[r.user_id] += 1;
          }
        });
      } else {
        reviewsData.forEach(r => {
          if (userReviewCounts[r.user_id] !== undefined) userReviewCounts[r.user_id] += 1;
        });
      }

      let topUsers = usersData.map(u => ({
        ...u,
        calcXp: userXP[u.id],
        reviewCount: userReviewCounts[u.id]
      })).filter(u => u.calcXp > 0).sort((a, b) => b.calcXp - a.calcXp).slice(0, 100);

      let html = '';

      if (topUsers && topUsers.length > 0) {
        html += `
          <div class="glass page-enter" style="flex:1; min-width:300px; padding:1.5rem; border-radius:var(--radius-lg);">
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${topUsers.map((u, i) => {
                const isTop3 = i < 3;
                let rankColor = 'var(--accent-saffron)';
                const rCount = u.reviewCount || 0;
                
                return `
                <a href="#/user/${u.username}" style="display:flex; align-items:center; gap:1rem; text-decoration:none; color:inherit; padding:0.5rem; border-radius:var(--radius-sm); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                  <div style="font-weight:bold; font-size:1.5rem; color:var(--accent-saffron); width:30px; text-align:center;">${i + 1}</div>
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${rankColor}; display:flex; align-items:center; justify-content:center; color:${i<3?'#000':'#fff'}; font-weight:bold;">
                    ${u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : (u.display_name || 'U')[0].toUpperCase()}
                  </div>
                  <div style="flex:1;">
                    <div style="font-weight:600;">${u.display_name || u.username}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">@${u.username} &bull; ${rCount} Reviews</div>
                  </div>
                  <div style="font-weight:bold; color:var(--accent-gold); font-size:1.1rem;">
                    ${u.calcXp} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">XP</span>
                  </div>
                </a>
              `}).join('')}
            </div>
          </div>
        `;
      } else {
        html += '<div class="glass text-center text-muted" style="flex:1; padding:3rem; border-radius:var(--radius-lg);">No rasigans found for this filter.</div>';
      }

      container.innerHTML = html;
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
      container.innerHTML = '<div class="text-center text-muted">Error loading leaderboards. Please try again.</div>';
    }
  },
"""

# Replace the existing fetchLeaderboards function block
app_content = re.sub(
    r'fetchLeaderboards:\s*async\s*function\(\)\s*\{[\s\S]*?(?=},\s*setupScrollListeners:|\s*window\.RasigaApp\s*=)',
    new_fetch_leaderboards.strip(),
    app_content,
    flags=re.MULTILINE
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print('Updated leaderboards logic successfully')
