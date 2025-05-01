import nodemailer from "nodemailer";

const mailer = async (data) => {
  const { to, html } = data;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_APP_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: "Videotube Email Verification",
    html: html,
  };
  return transporter.sendMail(mailOptions);
};

export { mailer };
