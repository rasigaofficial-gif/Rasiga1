const fs = require('fs');

// Mock browser globals
global.window = {};
global.RasigaSeeds = [
  { id: 'f78e9bdb-47f2-490b-8b0c-da12c340850e', title: 'Test Song', film: 'Test Film', year: '2023', singer: 'Test Singer', composer: 'Test Composer', avg_rating: 4.5, total_ratings: 10 }
];
global.RasigaReviews = [];
global.RasigaData = {
  demoUser: {
    id: 'user123',
    displayName: undefined, // Simulating the missing displayName
    username: undefined,
    onboarded: true
  },
  userComments: {},
  userReactions: {},
  userRatings: {}
};
global.Icons = {
  get: () => '<svg></svg>'
};

// Load components.js
const componentsCode = fs.readFileSync('c:/Project Apps/Rasiga/Rasiga/js/components.js', 'utf8');
eval(componentsCode);

// Load pages.js
const pagesCode = fs.readFileSync('c:/Project Apps/Rasiga/Rasiga/js/pages.js', 'utf8');
eval(pagesCode);

try {
  const html = window.RasigaPages.renderSongPage('f78e9bdb-47f2-490b-8b0c-da12c340850e');
  console.log("SUCCESS. HTML Length:", html.length);
} catch (e) {
  console.log("CRASH!");
  console.log(e.stack);
}
