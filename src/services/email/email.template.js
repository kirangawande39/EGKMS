const emailVerificationTemplate = (otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

<tr>
<td align="center"
style="background:#1e40af;color:#ffffff;padding:30px;">

<div style="background:#0F172A;padding:25px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;">EGKMS</h1>
    <p style="color:#cbd5e1;margin-top:8px;">
        Enterprise Knowledge Management System
    </p>
</div>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;">
Hello,
</h2>

<p style="font-size:16px;color:#555;">
Use the following One-Time Password (OTP) to verify your email address.
</p>

<div
style="
margin:35px auto;
background:#eef4ff;
border:2px dashed #1e40af;
padding:18px;
font-size:34px;
font-weight:bold;
letter-spacing:8px;
text-align:center;
color:#1e40af;
border-radius:10px;
width:250px;
">

${otp}

</div>

<p style="color:#555;">
This OTP is valid for <strong>5 minutes</strong>.
</p>

<p style="color:#555;">
Please do not share this OTP with anyone.
</p>

<p style="color:#888;font-size:14px;">
If you did not request this verification, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td
align="center"
style="background:#f7f7f7;padding:20px;color:#888;font-size:13px;">

© 2026 EGKMS | Powered by Syandrix

<br><br>

This is an automated email. Please do not reply.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

module.exports = {
  emailVerificationTemplate,
};