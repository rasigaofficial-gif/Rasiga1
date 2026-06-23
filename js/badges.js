window.RasigaData = {
  // ── Indian Hierarchy Levels ──
  // User selected: Rasigan → Isai Piriyan → Shishya → Vidwan → Ustad → 👑 Maestro
  LEVELS: [
    { id: 1, name: 'Rasigan', minXP: 0 },
    { id: 2, name: 'Isai Piriyan', minXP: 1000 },
    { id: 3, name: 'Shishya', minXP: 3000 },
    { id: 4, name: 'Vidwan', minXP: 7500 },
    { id: 5, name: 'Ustad', minXP: 15000 },
    { id: 6, name: 'Maestro', minXP: 30000 }
  ],

  // ── Badge Definitions ──
  BADGES: [
    { id: 'first_note', name: 'First Note', desc: 'Rate your first song', icon: 'music', xp: 10 },
    { id: 'wordsmith', name: 'Wordsmith', desc: 'Write your first review', icon: 'penTool', xp: 15 },
    { id: 'dawn_raga', name: 'Dawn Raga', desc: 'Rate 5 songs', icon: 'sun', xp: 25 },
    { id: 'streak_starter', name: 'Streak Starter', desc: '3-day listening streak', icon: 'flame', xp: 30 },
    { id: 'polyglot', name: 'Polyglot Ears', desc: 'Rate songs in 3+ languages', icon: 'globe', xp: 40 },
    { id: 'critic', name: 'Harsh Critic', desc: 'Give a rating below 2.0', icon: 'gavel', xp: 15 },
    { id: 'summit', name: 'Summit', desc: 'Rate 10 songs 4.5+ avg', icon: 'mountain', xp: 50 },
    { id: 'mood_master', name: 'Mood Master', desc: 'Listen across 5+ moods', icon: 'palette', xp: 35 },
    { id: 'dedicated', name: 'Dedicated', desc: '7-day streak', icon: 'calendarDays', xp: 60 },
    { id: 'century', name: 'Century Club', desc: 'Rate 100 songs', icon: 'award', xp: 100 },
    { id: 'night_owl', name: 'Night Owl', desc: 'Log songs after midnight', icon: 'moon', xp: 20 },
    { id: 'explorer', name: 'Explorer', desc: 'Visit every page', icon: 'compass', xp: 15 },
    { id: 'connoisseur', name: 'Connoisseur', desc: 'Rate 50 songs', icon: 'crown', xp: 75 },
    { id: 'diamond', name: 'Diamond Ears', desc: '30-day streak', icon: 'gem', xp: 150 },
    { id: 'referral_master', name: 'Social Butterfly', desc: 'Refer a friend to Rasiga', icon: 'heart', xp: 100 }
  ],

  // ── Mock Demo User ──
  demoUser: (function() {
    try {
      const stored = localStorage.getItem('rasiga_user');
      if (stored) return JSON.parse(stored);
    } catch(e) { console.error(e); }
    return null; // Start logged out by default
  })(),

  getLevel: function (xp) {
    let current = this.LEVELS[0];
    for (let l of this.LEVELS) {
      if (xp >= l.minXP) current = l;
      else break;
    }
    return current;
  },

  getNextLevel: function (xp) {
    for (let l of this.LEVELS) {
      if (l.minXP > xp) return l;
    }
    return this.LEVELS[this.LEVELS.length - 1];
  }
};
