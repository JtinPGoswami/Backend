const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
const Verification_Email_Template_For_Password_Change = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #ddd;
    }

    .header {
      background-color: #FF5722;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
    }

    .content {
      padding: 25px;
      color: #333;
      line-height: 1.8;
    }

    .verification-code {
      display: block;
      margin: 20px 0;
      font-size: 22px;
      color: #FF5722;
      background: #FFEBEE;
      border: 1px dashed #FF5722;
      padding: 10px;
      text-align: center;
      border-radius: 5px;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .footer {
      background-color: #f4f4f4;
      padding: 15px;
      text-align: center;
      color: #777;
      font-size: 12px;
      border-top: 1px solid #ddd;
    }

    p {
      margin: 0 0 15px;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">Reset Your Password</div>
    <div class="content">
      <p>Hello,</p>
      <p>You requested to reset your password. Use the code below to proceed:</p>
      <span class="verification-code">{verificationCode}</span>
      <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
    </div>
  </div>
</body>

</html>`;

const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Our Community!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="#" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

const Room_Remove_Email_Template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reason for Room Deletion</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #d9534f;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px;
            line-height: 1.8;
        }
        .message {
            font-size: 18px;
            margin: 20px 0;
            color: #d9534f;
            font-weight: bold;
        }
        .reason {
            font-size: 16px;
            color: #555;
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-style: italic;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 20px 0;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Reason for Room Deletion</div>
        <div class="content">
            <p>Hello {landlordName},</p>
            <p class="message">We regret to inform you that your room titled "{roomTitle}" was removed by the admin. Here’s the reason:</p>
            <div class="reason">
                {deletionReason}
            </div>
            <p>If you have any questions or need further clarification, please feel free to contact our support team.</p>
            <p>Thank you for using Room On Rent.</p>
            <a href="mailto:support@roomonrent.com" class="button">Contact Support</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

`;

const User_Remove_Email_Template = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Removal Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #ddd;
    }

    .header {
      background-color: #d9534f;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
    }

    .content {
      padding: 25px;
      line-height: 1.8;
    }

    .message {
      font-size: 18px;
      margin: 20px 0;
      color: #d9534f;
      font-weight: bold;
    }

    .details {
      font-size: 16px;
      color: #555;
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      margin: 10px 0;
    }

    .button {
      display: inline-block;
      padding: 12px 25px;
      margin: 20px 0;
      background-color: #007BFF;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .button:hover {
      background-color: #0056b3;
    }

    .footer {
      background-color: #f4f4f4;
      padding: 15px;
      text-align: center;
      color: #777;
      font-size: 12px;
      border-top: 1px solid #ddd;
    }

    p {
      margin: 0 0 15px;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">Account Removed</div>
    <div class="content">
      <p>Hello {userName},</p>
      <p class="message">We regret to inform you that your account has been removed from our platform.</p>
      <p>Details:</p>
      <div class="details">
        Email: {userEmail}<br>
        Reason: suspicious activity.
      </div>
      <p>If you believe this decision was made in error or have any questions, please contact us for clarification.</p>
      <a href="mailto:support@roomonrent.com" class="button">Contact Support</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
    </div>
  </div>
</body>

</html>`;

const Role_Change_Email_Template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Change Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #FF9800;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px;
            color: #333;
            line-height: 1.8;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Role Change Successful</div>
        <div class="content">
            <p>Hello,</p>
            <p>We are pleased to inform you that your role has been successfully changed to <strong>{newRole}</strong>.</p>
            <p>If this change was not requested by you or you have any concerns, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const Varification_Email_Template_For_Role_Change = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Role Change</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px;
            color: #333;
            line-height: 1.8;
        }
        .verification-code {
            display: block;
            margin: 20px 0;
            font-size: 22px;
            color: #2196F3;
            background: #E3F2FD;
            border: 1px dashed #2196F3;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Verify Role Change</div>
        <div class="content">
            <p>Hello,</p>
            <p>You have requested to change your role to <strong>{newRole}</strong>. Please confirm this change by entering the code below:</p>
            <span class="verification-code">{verificationCode}</span>
            <p>If you did not make this request, please contact our support team immediately.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Room On Rent. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export {
  Verification_Email_Template,
  Welcome_Email_Template,
  Room_Remove_Email_Template,
  User_Remove_Email_Template,
  Verification_Email_Template_For_Password_Change,
  Varification_Email_Template_For_Role_Change,
  Role_Change_Email_Template,
};
