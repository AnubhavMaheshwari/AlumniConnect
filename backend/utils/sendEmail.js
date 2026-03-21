const parseEmailFrom = (value) => {
    if (!value) {
        return {};
    }

    const match = value.match(/^(.*)<(.+)>$/);
    if (!match) {
        return { email: value.trim() };
    }

    return {
        name: match[1].replace(/"/g, '').trim(),
        email: match[2].trim()
    };
};

const getBrevoConfig = () => {
    const apiKey = (
        process.env.BREVO_API_KEY ||
        process.env.BREVO_API ||
        process.env.BREVO_KEY ||
        process.env.BREVO_APIKEY ||
        ''
    ).trim();
    const parsedFrom = parseEmailFrom(process.env.EMAIL_FROM || process.env.SMTP_FROM);

    const senderEmail = process.env.BREVO_SENDER_EMAIL || parsedFrom.email;
    const senderName = process.env.BREVO_SENDER_NAME || parsedFrom.name || 'Alumni Connect';

    return { apiKey, senderEmail, senderName };
};

const sendEmail = async (options) => {
    const { apiKey, senderEmail, senderName } = getBrevoConfig();

    if (!apiKey) {
        throw new Error('Brevo API key is missing. Set BREVO_API_KEY (or BREVO_API/BREVO_KEY).');
    }
    if (!senderEmail) {
        throw new Error('BREVO_SENDER_EMAIL is missing. Set it in environment variables.');
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': apiKey
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[Brevo] Email send failed', {
            status: response.status,
            body: errorText
        });
        throw new Error(`Brevo send failed (${response.status}).`);
    }

    return response.json();
};

module.exports = sendEmail;
