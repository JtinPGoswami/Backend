import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.WEBSITE_EMAIL,
    pass: process.env.WEBSITE_EMAIL_PASS,
  },
});
