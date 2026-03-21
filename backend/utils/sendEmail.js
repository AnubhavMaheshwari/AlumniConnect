const nodemailer = require('nodemailer');

let transporter;

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

const getTransporter = () => {
    if (transporter) {
        return transporter;
    }

    const config = getSmtpConfig();
    if (!config.user || !config.pass) {
        throw new Error('SMTP credentials missing. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS).');
    }

    transporter = nodemailer.createTransport({
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

    return transporter;
};

const sendEmail = async (options) => {
    const config = getSmtpConfig();
    const smtpTransporter = getTransporter();

    const mailOptions = {
        from: config.from,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    try {
        const info = await smtpTransporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('[SMTP] Email send failed', {
            host: config.host,
            port: config.port,
            secure: config.secure,
            code: error.code,
            response: error.response
        });
        throw error;
    }
};

module.exports = sendEmail;
