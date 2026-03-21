const { Resend } = require('resend');

const getResendConfig = () => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || 'onboarding@resend.dev';
    return { apiKey, from };
};

const sendEmail = async (options) => {
    const { apiKey, from } = getResendConfig();

    if (!apiKey) {
        throw new Error('RESEND_API_KEY is missing. Set it in environment variables.');
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
        from,
        to: options.email,
        subject: options.subject,
        html: options.html
    });

    if (error) {
        console.error('[Resend] Email send failed', {
            to: options.email,
            from,
            error
        });
        throw new Error(error.message || 'Failed to send email via Resend.');
    }

    return data;
};

module.exports = sendEmail;
