const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Automatically fix common mistakes with App Passwords (removing spaces)
    const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

    const port = parseInt(process.env.EMAIL_PORT) || 465;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // Must be true for 465, false for 587/25
        auth: {
            user: process.env.EMAIL_USER,
            pass: emailPass
        }
    });

    const mailOptions = {
        from: `"Alumni Connect" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
