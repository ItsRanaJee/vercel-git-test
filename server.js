require('dotenv').config();

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured: isSupabaseConfigured,
    message: isSupabaseConfigured
      ? 'Supabase is configured and ready.'
      : 'Supabase environment variables are missing. Add them to .env to enable data persistence.'
  });
});

app.get('/api/items', async (req, res) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment.'
    });
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data || []);
});

app.post('/api/items', async (req, res) => {
  const { title, description } = req.body || {};

  if (!title || !description) {
    return res.status(400).json({
      error: 'Both title and description are required.'
    });
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.status(500).json({
      error: 'Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment.'
    });
  }

  const { data, error } = await supabase
    .from('items')
    .insert([{ title, description }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data[0]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
