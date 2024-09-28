import nodemailer from "nodemailer";
import { google } from "googleapis";

const emailOAuth2 = async () => {
  const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
  const REDIRECT_URL = process.env.EMAIL_REDIRECT_URL;
  const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  oAuth2Client.setCredentials({ refresh_token: process.env.EMAIL_REFRESH_TOKEN });
  const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "teamcheckauth@gmail.com",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN.token,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return transporter;
};

const mailer = async (user) => {
  const transporter = await emailOAuth2();

  const mailOptions = {
    from: "teamcheckauth@gmail.com",
    to: "mohamedsaleem252457@gmail.com",
    subject: "Test mail",
    html: "Test mail",
  };

  return transporter.sendMail(mailOptions);
};

export { mailer };
