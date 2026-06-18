const fetch = require('node-fetch');

async function test() {
  const headers = {
    'apikey': 'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4',
    'Authorization': 'Bearer sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    // 1. Fetch a song to get its ID
    const res1 = await fetch('https://jtqrwtynipzjybjvprdt.supabase.co/rest/v1/songs?limit=1', { headers });
    const songs = await res1.json();
    if (!songs || songs.length === 0) {
      console.log('No songs found');
      return;
    }
    const song = songs[0];
    console.log('Testing with song:', song.title, song.id);

    // 2. Try to update the song
    const res2 = await fetch(`https://jtqrwtynipzjybjvprdt.supabase.co/rest/v1/songs?id=eq.${song.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ composer: song.composer }) // update with same value to test permissions
    });
    const text2 = await res2.text();
    console.log('Update Status:', res2.status);
    console.log('Update Body:', text2);

  } catch(e) {
    console.error(e);
  }
}
test();
