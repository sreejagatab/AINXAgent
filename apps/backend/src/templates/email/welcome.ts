export const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Platform</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logoUrl}}" alt="Logo" class="logo">
    <h1>Welcome to {{appName}}!</h1>
  </div>

  <p>Hi {{name}},</p>

  <p>Thank you for joining {{appName}}! We're excited to have you on board.</p>

  <p>To get started, here are a few things you can do:</p>
  <ul>
    <li>Complete your profile</li>
    <li>Explore our features</li>
    <li>Connect with other users</li>
  </ul>

  <p>
    <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
  </p>

  <p>If you have any questions, feel free to reply to this email or contact our support team.</p>

  <p>Best regards,<br>The {{appName}} Team</p>

  <div class="footer">
    <p>This email was sent to {{email}}. If you didn't create this account, please ignore this email.</p>
    <p>{{appName}} - {{address}}</p>
    <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> from these emails.</p>
  </div>
</body>
</html>
`; 