module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    // Use native fetch to hit the Supabase REST API directly (no package needed)
    const response = await fetch(`${supabaseUrl}/rest/v1/songs?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}`);
    }

    console.log("Raagaa DB alive ✓");
    
    return res.status(200).json({
      status: 'ok',
      message: 'Raagaa DB alive ✓'
    });
    
  } catch (error) {
    console.error('Error in keepalive script:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
