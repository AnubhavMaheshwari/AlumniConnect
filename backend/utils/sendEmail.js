const https = require('https');

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

    const payload = JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html
    });

    const result = await new Promise((resolve, reject) => {
        const req = https.request(
            'https://api.brevo.com/v3/smtp/email',
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'api-key': apiKey,
                    'content-length': Buffer.byteLength(payload)
                },
                timeout: 20000
            },
            (res) => {
                let body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    const status = res.statusCode || 500;
                    if (status >= 200 && status < 300) {
                        try {
                            resolve(body ? JSON.parse(body) : { ok: true });
                        } catch {
                            resolve({ ok: true, raw: body });
                        }
                    } else {
                        reject(new Error(`Brevo send failed (${status}): ${body}`));
                    }
                });
            }
        );

        req.on('timeout', () => {
            req.destroy(new Error('Brevo request timed out.'));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });

    return result;
};

module.exports = sendEmail;
