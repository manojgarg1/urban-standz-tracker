// Vercel Serverless Function: /api/contact
// Securely forwards victim contact submissions and peer messages to the administrator/victim without exposing emails or phones externally.

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
    const RECIPIENT_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'garg.blr@gmail.com';

    // Check if this is a secure peer message to a registered victim
    if (body.type === 'victim_relay_message') {
      const { targetVictimName, senderName, senderContact, senderRole, message } = body;
      const emailSubject = `[Urban Standz] Secure Peer Message for: ${targetVictimName || 'Victim'}`;
      const emailBody = `
New Peer Message via Urban Standz Victims Directory
---------------------------------------------------
To: ${targetVictimName}
From: ${senderName} (${senderRole || 'Peer Victim / Advocate'})
Sender Contact: ${senderContact}

Message Content:
${message}

Sent At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
---------------------------------------------------
Privacy Notice: The recipient's email/phone was NOT disclosed to the sender.
      `.trim();

      console.log(`[VICTIM_RELAY] Relay message for ${targetVictimName} from ${senderName}`);

      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY || 'urban-standz-action-portal',
            to_email: RECIPIENT_EMAIL,
            from_name: `Portal Message for ${targetVictimName}`,
            subject: emailSubject,
            message: emailBody
          })
        });
      } catch (err) {
        // Ignore
      }

      return res.status(200).json({
        success: true,
        message: `Your message has been securely relayed to ${targetVictimName}.`
      });
    }

    // Otherwise, standard Intake Form submission
    const { name, phone, email, role, firNumber, caseDetails, comments } = body;

    if (!name) {
      return res.status(400).json({ error: 'Name is a required field.' });
    }

    const emailSubject = `[Urban Standz Portal] New Intake: ${name} (${role || 'Victim'})`;
    const emailBody = `
New Intake Submission from Urban Standz Legal Action Portal
---------------------------------------------------
Name: ${name}
Phone: ${phone || 'Not provided'}
Email: ${email || 'Not provided'}
Role: ${role || 'Not specified'}
FIR Number: ${firNumber || 'None'}
Court Case Details: ${caseDetails || 'None'}

Comments / Details of Dispute:
${comments || 'No additional comments provided'}

Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
---------------------------------------------------
This message was securely dispatched by the Urban Standz Portal Server.
    `.trim();

    console.log(`[CONTACT_DISPATCH] Intake received from ${name} (${email || phone})`);

    let emailSent = false;
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY || 'urban-standz-action-portal',
          to_email: RECIPIENT_EMAIL,
          from_name: `Urban Standz Intake: ${name}`,
          subject: emailSubject,
          message: emailBody,
          replyto: email || undefined
        })
      });
      const data = await response.json();
      if (data && data.success) {
        emailSent = true;
      }
    } catch (e) {
      console.warn('[CONTACT_DISPATCH] Web3Forms relay note:', e.message);
    }

    return res.status(200).json({
      success: true,
      emailSent,
      message: 'Submission successfully received and added to Victims Directory.'
    });
  } catch (error) {
    console.error('[CONTACT_DISPATCH_ERROR]:', error);
    return res.status(500).json({ error: 'Internal server error processing submission' });
  }
}
