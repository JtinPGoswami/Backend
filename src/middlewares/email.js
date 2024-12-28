import { transporter } from "./email.config.js";
import {
  Verification_Email_Template,
  Welcome_Email_Template,
} from "../utils/emailTamplates.js";
export const sendVerificationEmail = async (email, verificationCode) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent " <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verify Your Email", // Subject line
    text: "Verify Your Email", // plain text body
    html: Verification_Email_Template.replace(
      "{verificationCode}",
      verificationCode
    ), // html body
  });

  console.log("Message sent");
};
export const sendWelcomeEmail = async (email, name) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent " <wilkinson@ethereal.email>', // sender address
    to: email, // list of receivers
    subject: "Welcome Email", // Subject line
    text: "Welcome Email", // plain text body
    html: Welcome_Email_Template.replace("{name}", name), // html body
  });

  console.log("Message sent: ");
};
