export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { email, first_name, tag_id } = body || {};

  if (!email || !first_name) {
    return res.status(400).json({ error: 'Email and first name are required' });
  }

  const API_KEY = 'Y_uWU-aoES_X4KkSu-ICtw';

  try {
    // Step 1 — Tag the subscriber directly using the tag subscribe endpoint
    // This creates the subscriber AND applies the tag in one call
    const tagResponse = await fetch(`https://api.convertkit.com/v3/tags/${tag_id}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:    API_KEY,
        email:      email,
        first_name: first_name
      })
    });

    const tagData = await tagResponse.json();
    console.log('Tag subscribe response:', JSON.stringify(tagData));

    if (!tagResponse.ok) {
      return res.status(tagResponse.status).json({ error: tagData });
    }

    return res.status(200).json({ success: true, data: tagData });

  } catch (err) {
    console.error('ConvertKit error:', err);
    return res.status(500).json({ error: err.message });
  }
}
