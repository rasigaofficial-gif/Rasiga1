const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jtqrwtynipzjybjvprdt.supabase.co', 'sb_publishable_mc_C6JdZP5unk7o2fcPOvQ_c3hgzJr4');

async function test() {
  const { data, error } = await supabase.from('users').select('username, xp, reviews(count)').order('xp', { ascending: false }).limit(2);
  console.log(data);
  console.log(error);
}
test();
