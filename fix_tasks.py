import re

# Update pages.js with Daily Tasks UI and Share Song Button
with open('js/pages.js', 'r', encoding='utf-8') as f:
    pages_content = f.read()

# 1. Share Song Button in Song Details
share_song_html = """
               <div style="margin-top: 0.6rem; display:flex; gap:1rem;">
                 <button onclick="RasigaApp.openSuggestSongModal('${song.id}')" style="background:none; border:none; color:var(--text-muted); font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem; padding:0; cursor:pointer; font-family:inherit;">
                   ${window.Icons ? window.Icons.get('edit', {width: 12, height: 12}) : '✎'} Suggest Edit
                 </button>
                 <button onclick="RasigaApp.shareSong('${song.id}')" style="background:none; border:none; color:var(--text-muted); font-size:0.8rem; display:inline-flex; align-items:center; gap:0.3rem; padding:0; cursor:pointer; font-family:inherit;">
                   ${window.Icons ? window.Icons.get('share', {width: 12, height: 12}) : '🔗'} Share Song
                 </button>
               </div>
"""
pages_content = re.sub(
    r'<div style="margin-top: 0\.6rem;">\s*<button onclick="RasigaApp\.openSuggestSongModal\(\'\$\{song\.id\}\'\)".*?Suggest Edit\s*</button>\s*</div>',
    share_song_html.strip(),
    pages_content,
    flags=re.DOTALL
)

# 2. Daily Tasks UI in Profile Page
daily_tasks_html = """
        <div class="glass page-enter" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-top: 2rem; animation-delay: 0.15s;">
          <h3 style="margin-bottom: 1rem; display:flex; align-items:center; gap:0.5rem; color:var(--accent-saffron);">
            ${Icons.get('target', {width:20, height:20})} Daily Tasks
          </h3>
          <div style="display:flex; flex-direction:column; gap:0.8rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:1rem; border-radius:var(--radius-md);">
              <div style="display:flex; align-items:center; gap:0.8rem;">
                <div style="color:${hasShared ? 'var(--accent-saffron)' : 'var(--glass-border)'};">
                  ${Icons.get('checkCircle', {width:24, height:24})}
                </div>
                <div>
                  <div style="font-weight:600; text-decoration:${hasShared ? 'line-through' : 'none'}; opacity:${hasShared ? '0.5' : '1'};">Share a Song</div>
                  <div style="font-size:0.8rem; color:var(--accent-gold);">+20 XP</div>
                </div>
              </div>
              ${hasShared ? '<span style="color:var(--accent-saffron); font-size:0.85rem; font-weight:600;">Completed!</span>' : '<button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="location.hash=\'#/discover\'">Go</button>'}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:1rem; border-radius:var(--radius-md);">
              <div style="display:flex; align-items:center; gap:0.8rem;">
                <div style="color:${hasRated ? 'var(--accent-saffron)' : 'var(--glass-border)'};">
                  ${Icons.get('checkCircle', {width:24, height:24})}
                </div>
                <div>
                  <div style="font-weight:600; text-decoration:${hasRated ? 'line-through' : 'none'}; opacity:${hasRated ? '0.5' : '1'};">Rate or Review 1 Song</div>
                  <div style="font-size:0.8rem; color:var(--accent-gold);">+20 XP</div>
                </div>
              </div>
              ${hasRated ? '<span style="color:var(--accent-saffron); font-size:0.85rem; font-weight:600;">Completed!</span>' : '<button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="location.hash=\'#/discover\'">Go</button>'}
            </div>
          </div>
        </div>
"""

pages_content = pages_content.replace(
    'const joinedStr = formatDate(user.joinedAt);',
    'const joinedStr = formatDate(user.joinedAt);\n    const todayStr = new Date().toISOString().split(\'T\')[0];\n    const hasShared = localStorage.getItem(\'task_share_\' + todayStr) === \'true\';\n    const hasRated = localStorage.getItem(\'task_rate_\' + todayStr) === \'true\';'
)

pages_content = pages_content.replace(
    '<div class="mt-4 page-enter" style="animation-delay: 0.15s">',
    daily_tasks_html + '\n        <div class="mt-4 page-enter" style="animation-delay: 0.15s">'
)

with open('js/pages.js', 'w', encoding='utf-8') as f:
    f.write(pages_content)

# Update app.js logic
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add RasigaApp.shareSong
share_song_func = """
  shareSong: function(id) {
    const url = window.location.origin + window.location.pathname + '#/song/' + id;
    navigator.clipboard.writeText(url).then(() => {
      if (this.showNotification) this.showNotification('Song link copied to clipboard!');
      
      const todayStr = new Date().toISOString().split('T')[0];
      if (localStorage.getItem('task_share_' + todayStr) !== 'true') {
        localStorage.setItem('task_share_' + todayStr, 'true');
        if (window.RasigaData.demoUser && window.RasigaData.demoUser.id) {
           this.supabase.from('users').update({ xp: (window.RasigaData.demoUser.xp || 0) + 20 }).eq('id', window.RasigaData.demoUser.id).then(() => {
               if (this.showNotification) this.showNotification('Daily Task Complete: Share a Song! (+20 XP)');
               window.RasigaData.demoUser.xp = (window.RasigaData.demoUser.xp || 0) + 20;
               if (location.hash === '#/profile') this.handleRoute();
           });
        }
      }
    });
  },
"""
app_content = app_content.replace(
    'shareComment: function (id) {',
    share_song_func + '\n  shareComment: function (id) {'
)

# Intercept submitDirtyRating for rating task
submit_rating_intercept = """
      const todayStr = new Date().toISOString().split('T')[0];
      if (localStorage.getItem('task_rate_' + todayStr) !== 'true') {
        localStorage.setItem('task_rate_' + todayStr, 'true');
        if (window.RasigaData.demoUser && window.RasigaData.demoUser.id) {
           this.supabase.from('users').update({ xp: (window.RasigaData.demoUser.xp || 0) + 20 }).eq('id', window.RasigaData.demoUser.id).then(() => {
               if (this.showNotification) this.showNotification('Daily Task Complete: Rate a Song! (+20 XP)');
               window.RasigaData.demoUser.xp = (window.RasigaData.demoUser.xp || 0) + 20;
           });
        }
      }
"""
app_content = app_content.replace(
    "if (this.showNotification) this.showNotification('Rating submitted successfully!');",
    "if (this.showNotification) this.showNotification('Rating submitted successfully!');\n" + submit_rating_intercept
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print('Updated Daily Tasks in app.js and pages.js')
