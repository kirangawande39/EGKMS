const emailVerificationTemplate = (otp) => {
  const LOGO_URL = "YOUR_LOGO_PUBLIC_URL";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F7F4EF;
    font-family:Arial,Helvetica,sans-serif;
    color:#333333;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="background:#F7F4EF;padding:40px 15px;"
>
<tr>
<td align="center">

  <!-- Main Container -->
  <table
    width="600"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      max-width:600px;
      width:100%;
      background:#FFFFFF;
      border-radius:14px;
      overflow:hidden;
      border:1px solid #E8E2D9;
    "
  >

    <!-- Top Gold Line -->
    <tr>
      <td
        style="
          height:5px;
          background:#C98A00;
          font-size:0;
          line-height:0;
        "
      >
      </td>
    </tr>

    <!-- Header -->
    <tr>
      <td
        align="center"
        style="
          background:#FFFFFF;
          padding:30px 25px 24px;
        "
      >

        <!-- Logo -->
        <img
          src="${LOGO_URL}"
          alt="Syandrix Infotech"
          width="230"
          style="
            display:block;
            max-width:230px;
            width:100%;
            height:auto;
            margin:0 auto;
          "
        />

        <!-- Divider -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top:22px;"
        >
          <tr>
            <td
              style="
                border-top:1px solid #E8E2D9;
                font-size:0;
                line-height:0;
              "
            >
            </td>
          </tr>
        </table>

        <p
          style="
            margin:16px 0 0;
            font-size:12px;
            letter-spacing:3px;
            color:#8A877F;
            font-weight:bold;
          "
        >
          DOCUMENT MANAGEMENT SYSTEM
        </p>

      </td>
    </tr>


    <!-- Red Accent -->
    <tr>
      <td
        style="
          height:3px;
          background:#B51E2A;
          font-size:0;
          line-height:0;
        "
      >
      </td>
    </tr>


    <!-- Content -->
    <tr>
      <td
        style="
          padding:38px 40px 35px;
        "
      >

        <h2
          style="
            margin:0 0 16px;
            color:#333333;
            font-size:24px;
            font-weight:600;
          "
        >
          Verify Your Email
        </h2>

        <p
          style="
            margin:0 0 12px;
            color:#555555;
            font-size:16px;
            line-height:1.6;
          "
        >
          Hello,
        </p>

        <p
          style="
            margin:0;
            color:#666666;
            font-size:15px;
            line-height:1.7;
          "
        >
          Use the following One-Time Password (OTP) to verify
          your email address and continue setting up your account.
        </p>


        <!-- OTP Box -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin:30px 0;"
        >
          <tr>
            <td align="center">

              <div
                style="
                  background:#FFF9EA;
                  border:2px dashed #C98A00;
                  border-radius:10px;
                  padding:20px 15px;
                  max-width:300px;
                  margin:0 auto;
                "
              >

                <div
                  style="
                    color:#8A877F;
                    font-size:12px;
                    letter-spacing:2px;
                    font-weight:bold;
                    margin-bottom:10px;
                  "
                >
                  VERIFICATION CODE
                </div>

                <div
                  style="
                    color:#B51E2A;
                    font-size:34px;
                    font-weight:bold;
                    letter-spacing:8px;
                  "
                >
                  ${otp}
                </div>

              </div>

            </td>
          </tr>
        </table>


        <!-- Validity -->
        <p
          style="
            margin:0 0 12px;
            color:#555555;
            font-size:14px;
            line-height:1.6;
          "
        >
          This OTP is valid for
          <strong style="color:#B51E2A;">5 minutes</strong>.
        </p>

        <p
          style="
            margin:0 0 20px;
            color:#555555;
            font-size:14px;
            line-height:1.6;
          "
        >
          Please do not share this OTP with anyone.
        </p>


        <!-- Security Notice -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background:#F9F7F3;
            border-left:4px solid #C98A00;
            border-radius:5px;
          "
        >
          <tr>
            <td
              style="
                padding:13px 15px;
                color:#777777;
                font-size:13px;
                line-height:1.5;
              "
            >
              If you did not request this verification,
              you can safely ignore this email.
            </td>
          </tr>
        </table>

      </td>
    </tr>


    <!-- Footer -->
    <tr>
      <td
        align="center"
        style="
          background:#F5F2ED;
          border-top:1px solid #E5DFD6;
          padding:22px 20px;
        "
      >

        <p
          style="
            margin:0 0 8px;
            color:#555555;
            font-size:13px;
          "
        >
          © 2026
          <strong style="color:#B51E2A;">
            Syandrix Infotech
          </strong>
        </p>

        <p
          style="
            margin:0;
            color:#999999;
            font-size:12px;
          "
        >
          Document Management System
        </p>

        <p
          style="
            margin:12px 0 0;
            color:#AAAAAA;
            font-size:11px;
          "
        >
          This is an automated email. Please do not reply.
        </p>

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