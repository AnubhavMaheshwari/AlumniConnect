const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
    const pass = rawPass.replace(/\s+/g, '');
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Alumni Connect" <${user}>`;
    const secure = port === 465;

    return { host, port, user, pass, from, secure };
};

const getTransporter = (config) => {
    if (!config.user || !config.pass) {
        throw new Error('SMTP credentials missing. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS).');
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });
};

const sendEmail = async (options) => {
    const baseConfig = getSmtpConfig();
    const smtpTransporter = getTransporter(baseConfig);

    const mailOptions = {
        from: baseConfig.from,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    try {
        const info = await smtpTransporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('[SMTP] Email send failed', {
            host: baseConfig.host,
            port: baseConfig.port,
            secure: baseConfig.secure,
            code: error.code,
            response: error.response
        });

        // Cloud platforms sometimes timeout on Gmail 587 while 465 works.
        const shouldTryGmail465Fallback =
            error.code === 'ETIMEDOUT' &&
            baseConfig.host === 'smtp.gmail.com' &&
            baseConfig.port === 587;

        if (!shouldTryGmail465Fallback) {
            throw error;
        }

        const fallbackConfig = { ...baseConfig, port: 465, secure: true };
        const fallbackTransporter = getTransporter(fallbackConfig);

        try {
            console.warn('[SMTP] Retrying with Gmail fallback port 465');
            return await fallbackTransporter.sendMail(mailOptions);
        } catch (fallbackError) {
            console.error('[SMTP] Gmail fallback send failed', {
                host: fallbackConfig.host,
                port: fallbackConfig.port,
                secure: fallbackConfig.secure,
                code: fallbackError.code,
                response: fallbackError.response
            });
            throw fallbackError;
        }
    }
};

module.exports = sendEmail;
