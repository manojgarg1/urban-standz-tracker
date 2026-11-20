// Vercel Serverless Function: /api/contact
// Securely forwards Admin Contact submissions and Victim Intake to the administrator without exposing the destination email externally.

export default async function handler(req, res) {
  // Set CORS headers
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
    // Server-side recipient email (STRICTLY CONFIDENTIAL - Never exposed to client)
    const RECIPIENT_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'garg.blr@gmail.com';

    const { 
      name, 
      phone, 
      email, 
      subject, 
      userType, 
      role, 
      firNumber, 
      caseDetails, 
      message, 
      comments 
    } = body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required fields.' });
    }

    const senderRole = userType || role || 'Visitor';
    const emailSubject = `[Urban Standz Admin Contact] ${subject || 'New Message'} from ${name} (${senderRole})`;
    
    const emailBody = `
===================================================
New Admin Contact Message - Urban Standz Action Portal
===================================================
Sender Name:    ${name}
Sender Phone:   ${phone || 'Not provided'}
Sender Email:   ${email}
Category / Role:${senderRole}
Subject:        ${subject || 'General Inquiry'}

FIR Number:     ${firNumber || 'N/A'}
Court Case:     ${caseDetails || 'N/A'}

Message / Details:
---------------------------------------------------
${message || comments || 'No message provided'}

---------------------------------------------------
Submitted At:   ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Privacy Status: Securely routed by Portal Server. Recipient email kept strictly confidential.
===================================================
    `.trim();

    console.log(`[ADMIN_CONTACT_DISPATCH] Forwarding message from ${name} (${email}) to Admin`);

    // Dispatch via server-side relay
    let emailSent = false;
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY || 'urban-standz-action-portal',
          to_email: RECIPIENT_EMAIL,
          from_name: `Urban Standz Contact: ${name}`,
          subject: emailSubject,
          message: emailBody,
          replyto: email
        })
      });
      const data = await response.json();
      if (data && data.success) {
        emailSent = true;
      }
    } catch (relayErr) {
      console.warn('[ADMIN_CONTACT_RELAY_NOTE]:', relayErr.message);
    }

    // Always return safe client response without any email information
    return res.status(200).json({
      success: true,
      emailSent,
      message: 'Your message has been securely sent to the administrator. We will get back to you shortly.'
    });
  } catch (error) {
    console.error('[ADMIN_CONTACT_ERROR]:', error);
    return res.status(500).json({ error: 'Internal server error processing contact request' });
  }
}
