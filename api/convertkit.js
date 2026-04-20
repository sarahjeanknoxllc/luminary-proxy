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

  // Parse body if it came in as a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { email, first_name, tag_id } = body || {};

  if (!email || !first_name) {
    return res.status(400).json({ error: 'Email and first name are required' });
  }

  const API_KEY = 'Y_uWU-aoES_X4KkSu-ICtw';

  try {
    // Step 1 — Subscribe the user
    const subResponse = await fetch('https://api.convertkit.com/v3/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:    API_KEY,
        email:      email,
        first_name: first_name
      })
    });

    const subData = await subResponse.json();
    const subscriberId = subData?.subscriber?.id;

    // Step 2 — Apply the tag
    if (subscriberId && tag_id) {
      await fetch(`https://api.convertkit.com/v3/tags/${tag_id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: API_KEY,
          email:   email
        })
      });
    }

    return res.status(200).json({ success: true, subscriber_id: subscriberId });

  } catch (err) {
    console.error('ConvertKit error:', err);
    return res.status(500).json({ error: err.message });
  }
}
