import re

# 1. Update streak logic in app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

streak_logic = """
        // Process ratings & streak (Login Streak instead of Rating Streak)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let lastLoginDateStr = localStorage.getItem('last_login_date_' + data.id);
        let currentStreak = parseInt(localStorage.getItem('login_streak_' + data.id)) || 1;
        
        if (lastLoginDateStr) {
          const lastLogin = new Date(parseInt(lastLoginDateStr));
          lastLogin.setHours(0, 0, 0, 0);
          
          const diffDays = Math.round((today - lastLogin) / 86400000);
          
          if (diffDays === 1) {
             currentStreak++;
             // Daily Streak Bonus (Add 10 XP to users table)
             if (!localStorage.getItem('streak_bonus_claimed_' + today.getTime())) {
                 this.supabase.from('users').update({ xp: (data.xp || 0) + 10 }).eq('id', data.id).then(({error}) => {
                     if (!error) {
                         if (window.RasigaApp && RasigaApp.showNotification) RasigaApp.showNotification('+10 XP Daily Streak Bonus!');
                         localStorage.setItem('streak_bonus_claimed_' + today.getTime(), 'true');
                     }
                 });
             }
          } else if (diffDays > 1) {
             currentStreak = 1;
          }
        }
        
        localStorage.setItem('last_login_date_' + data.id, today.getTime().toString());
        localStorage.setItem('login_streak_' + data.id, currentStreak.toString());
        
        let streak = currentStreak;
        window.RasigaData.demoUser.streak = streak;

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
        }
"""

app_content = re.sub(
    r'// Process ratings & streak[\s\S]*?window\.RasigaData\.demoUser\.streak = streak;',
    streak_logic.strip(),
    app_content
)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print('Updated streak logic in app.js')
