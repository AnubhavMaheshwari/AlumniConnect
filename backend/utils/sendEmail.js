// ── Brevo (SendinBlue) HTTP API — primary email transport ─────────────
const sendEmail = async (options) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        throw new Error('BREVO_API_KEY is not set in .env');
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
    const senderName = process.env.BREVO_SENDER_NAME || 'Campus Connect';

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    console.log(`✅ Email sent via Brevo to ${options.email}`);
    return data;
};

module.exports = sendEmail;
