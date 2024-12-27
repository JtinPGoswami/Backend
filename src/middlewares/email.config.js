import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "purijatinn@gmail.com",
    pass: "itnk ncza kuar igcu",
  },
});
