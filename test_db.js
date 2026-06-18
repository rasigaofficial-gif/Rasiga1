const url = 'https://jtqrwtynipzjybjvprdt.supabase.co/rest/v1/users?select=*';
const key = 'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}).then(res => res.json()).then(console.log).catch(console.error);
