const fetch = require('node-fetch'); // node v18 has built in fetch, I can just use it

async function test() {
  try {
    const res = await fetch('https://jtqrwtynipzjybjvprdt.supabase.co/rest/v1/reviews?select=*,users(display_name),review_likes(reaction_type,user_id)&limit=1', {
      headers: {
        'apikey': 'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4',
        'Authorization': 'Bearer sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4'
      }
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch(e) {
    console.error(e);
  }
}
test();
