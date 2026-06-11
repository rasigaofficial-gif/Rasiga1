const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  try {
    // Connects to Supabase using environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials in environment variables');
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Runs: SELECT COUNT(*) FROM songs
    const { count, error } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // Logs "Raagaa DB alive ✓" to console
    console.log("Raagaa DB alive ✓");
    
    // Returns 200 OK response
    return res.status(200).json({
      status: 'ok',
      message: 'Raagaa DB alive ✓',
      song_count: count
    });
    
  } catch (error) {
    console.error('Error in keepalive script:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
