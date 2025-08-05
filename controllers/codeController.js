import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yicbvsuqdmrvmakclpoj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all codes for a user
export const getUserCodes = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const { data, error } = await supabase
      .from('user_codes')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ codes: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save a new code
export const saveCode = async (req, res) => {
  try {
    const { title, description, code, language, user_id } = req.body;

    if (!title || !code || !user_id) {
      return res.status(400).json({ error: 'Title, code, and user_id are required' });
    }

    const { data, error } = await supabase
      .from('user_codes')
      .insert([
        {
          title,
          description: description || '',
          code,
          language: language || 'javascript',
          user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ code: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a code
export const updateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, code, language } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('user_codes')
      .update({
        title,
        description: description || '',
        code: code || '',
        language: language || 'javascript',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ code: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a code
export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('user_codes')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single code by ID
export const getCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('user_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Code not found' });
    }

    res.json({ code: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 