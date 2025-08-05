const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"BeautyBook" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

module.exports = { sendEmail };
