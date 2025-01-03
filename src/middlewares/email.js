import { transporter } from "./email.config.js";
import {
  Role_Change_Email_Template,
  Room_Remove_Email_Template,
  User_Remove_Email_Template,
  Varification_Email_Template_For_Role_Change,
  Verification_Email_Template,
  Verification_Email_Template_For_Password_Change,
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
};

export const sendVerificationEmailForPasswordChange = async (
  email,
  verificationCode
) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent " <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verify Your Email To Change Password", // Subject line
    text: "Verify Your Email To Change Password", // plain text body
    html: Verification_Email_Template_For_Password_Change.replace(
      "{verificationCode}",
      verificationCode
    ), // html body
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent "  <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Welcome Email", // Subject line
    text: "Welcome Email", // plain text body
    html: Welcome_Email_Template.replace("{name}", name), // html body
  });
};
export const sendRoomDeleteEmail = async (name, title, message, email) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent "  <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Admin Action: Room Listing Removed", // Subject line
    text: "Admin Deletion: Your Room Listing Has Been Removed", // plain text body
    html: Room_Remove_Email_Template.replace("{landlordName}", name)
      .replace("{roomTitle}", title)
      .replace("{deletionReason}", message), // html body
  });
};
export const sendUserDeleteEmail = async (name, email) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent "  <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Admin Action: Your Account Has Been Removed", // Subject line
    text: "Admin Action: Your Account Has Been Removed", // plain text body
    html: User_Remove_Email_Template.replace("{userName}", name).replace(
      "{userEmail}",
      email
    ),
  });
};
export const sendRoleChangeVarificationCode = async (
  email,
  varificationCode,
  role
) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent "  <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verification Email", // Subject line
    text: "Verification Email", // plain text body
    html: Varification_Email_Template_For_Role_Change.replace(
      "{newRole}",
      role
    ).replace("{verificationCode}", varificationCode),
  });
};
export const sendRoleChangeInfo = async (email, role) => {
  const info = await transporter.sendMail({
    from: '"Room On Rent "  <purijatinn@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Role change info Email", // Subject line
    text: "Role change info Email", // plain text body
    html: Role_Change_Email_Template.replace("{newRole}", role),
  });
};
