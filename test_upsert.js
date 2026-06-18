const url = 'https://jtqrwtynipzjybjvprdt.supabase.co/rest/v1/ratings?on_conflict=user_id,song_id';
const key = 'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4';

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  },
  body: JSON.stringify({
    user_id: 'a11450b0-0ff2-4707-a583-fb7751f7030d',
    song_id: '5eaa4e1c-7c5e-4b4d-a3fa-dc4eeb1fc5c7',
    score: 5
  })
}).then(async res => {
  console.log(res.status, await res.text());
}).catch(console.error);
