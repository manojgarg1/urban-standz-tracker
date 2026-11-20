// Vercel Serverless Function: /api/contact
// Securely forwards Admin Contact submissions to garg.blr@gmail.com via FormSubmit without exposing the email externally.

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    // Server-side confidential recipient email
    const RECIPIENT_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'garg.blr@gmail.com';

    const { 
      name, 
      phone, 
      email, 
      subject, 
      userType, 
      firNumber, 
      caseDetails, 
      message, 
      comments 
    } = body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const senderRole = userType || 'Visitor';
    const emailSubject = `[Urban Standz Admin Contact] ${subject || 'New Message'} from ${name} (${senderRole})`;
    const fullMessage = message || comments || 'No message content provided';

    console.log(`[ADMIN_CONTACT] Routing message from ${name} (${email}) to Admin`);

    // 1. Dispatch via FormSubmit AJAX API with server-side origin headers
    let emailDispatched = false;
    let providerMessage = '';

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT_EMAIL)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://urban-standz-tracker.vercel.app',
          'Origin': 'https://urban-standz-tracker.vercel.app'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || 'Not provided',
          role: senderRole,
          subject: subject || 'General Inquiry',
          firNumber: firNumber || 'N/A',
          caseDetails: caseDetails || 'N/A',
          message: fullMessage,
          _subject: emailSubject,
          _replyto: email,
          _template: 'table',
          _captcha: 'false'
        })
      });

      const data = await response.json().catch(() => ({}));
      console.log('[FORMSUBMIT_RESPONSE]:', data);

      if (data && (data.success === 'true' || data.success === true)) {
        emailDispatched = true;
      } else if (data && data.message) {
        providerMessage = data.message;
      }
    } catch (err) {
      console.error('[FORMSUBMIT_ERROR]:', err);
    }

    // 2. Safe client response (Never leaking the admin email)
    return res.status(200).json({
      success: true,
      emailDispatched,
      message: 'Your message has been securely sent to the administrator.'
    });
  } catch (error) {
    console.error('[CONTACT_ERROR]:', error);
    return res.status(500).json({ error: 'Internal server error processing contact request' });
  }
}
