import re

with open('js/pages.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ranking calculation logic
rank_calc_code = """
    const allSongs = window.RasigaSeeds || [];
    const sortedByRated = [...allSongs].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0) || Number(b.total_ratings || 0) - Number(a.total_ratings || 0));
    const ratedRank = sortedByRated.findIndex(s => s.id === id) + 1;
    
    const sortedByPopular = [...allSongs].sort((a, b) => Number(b.total_ratings || 0) - Number(a.total_ratings || 0) || Number(b.avg_rating || 0) - Number(a.avg_rating || 0));
    const popularRank = sortedByPopular.findIndex(s => s.id === id) + 1;
    
    const regionalSongs = allSongs.filter(s => s.language === song.language);
    const sortedByRegional = [...regionalSongs].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0) || Number(b.total_ratings || 0) - Number(a.total_ratings || 0));
    const regionalRank = sortedByRegional.findIndex(s => s.id === id) + 1;

    const rankBadgesHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:1rem;">
        <div style="background:rgba(255,255,255,0.1); padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600; color:var(--text-main); display:inline-flex; align-items:center; gap:0.3rem; border:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--accent-gold);">#${ratedRank}</span> Highest Rated
        </div>
        <div style="background:rgba(255,255,255,0.1); padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600; color:var(--text-main); display:inline-flex; align-items:center; gap:0.3rem; border:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--accent-saffron);">#${popularRank}</span> Most Popular
        </div>
        <div style="background:rgba(255,255,255,0.1); padding:0.2rem 0.6rem; border-radius:12px; font-size:0.75rem; font-weight:600; color:var(--text-main); display:inline-flex; align-items:center; gap:0.3rem; border:1px solid rgba(255,255,255,0.05);">
          <span style="color:var(--accent-rose);">#${regionalRank}</span> in ${song.language}
        </div>
      </div>
    `;
"""

content = content.replace(
    'return `\n      <div class="page-entity">',
    rank_calc_code + '\n    return `\n      <div class="page-entity">'
)

content = content.replace(
    '${listenLinkHTML}\n          </div>\n          <div class="sh-stats">',
    '${listenLinkHTML}\n            ${rankBadgesHTML}\n          </div>\n          <div class="sh-stats">'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Added rank badges to song page')
