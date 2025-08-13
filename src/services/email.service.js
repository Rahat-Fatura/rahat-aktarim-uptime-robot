const formData = require("form-data");
const Mailgun = require("mailgun.js");
const config = require("../config/config");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: "api",
  key: config.email.mailgun.auth.api_key,
  url: config.email.mailgun.host,
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await client.messages.create(config.email.mailgun.auth.domain, msg);
};

const sendEmailHtml = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await client.messages.create(config.email.mailgun.auth.domain, msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Şifre Sıfırlama";
  const resetPasswordUrl = `${config.app.url}/reset-password?token=${token}`;
  
  const html = `
  <!doctype html>
  <html lang="tr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Şifre Sıfırlama</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
            
            <tr>
              <td style="padding:24px;background: linear-gradient(90deg,#dc2626,#b91c1c); color:white;text-align:center;">
                <h1 style="margin:0;font-size:22px;font-weight:700;">Şifre Sıfırlama</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;color:#0f172a;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.5;">
                  Sayın kullanıcı,
                </p>
                <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.5;">
                  Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz. Bu bağlantı yalnızca kısa bir süre geçerlidir.
                </p>

                <div style="margin:24px 0;text-align:center;">
                  <a href="${resetPasswordUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;background:#dc2626;color:white;font-size:14px;">
                    Şifremi Sıfırla
                  </a>
                </div>

                <p style="margin:0 0 16px 0;color:#475569;font-size:13px;line-height:1.5;">
                  Eğer şifrenizi sıfırlamak istemiyorsanız bu e-postayı görmezden gelebilirsiniz.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} Şirket Adı. Tüm hakları saklıdır.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await sendEmailHtml(to, subject, html);
};




/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = "Hesap Doğrulama";
  const verificationEmailUrl = `${config.app.url}/verify-email?token=${token}`;
  const html = `
  <!doctype html>
  <html lang="tr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hesap Doğrulama</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
            
            <tr>
              <td style="padding:24px;background: linear-gradient(90deg,#2563eb,#1d4ed8); color:white;text-align:center;">
                <h1 style="margin:0;font-size:22px;font-weight:700;">Hesap Doğrulama</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;color:#0f172a;">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.5;">
                  Sayın kullanıcı,
                </p>
                <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.5;">
                  Hesabınızı doğrulamak için aşağıdaki butona tıklayabilirsiniz.
                </p>

                <div style="margin:24px 0;text-align:center;">
                  <a href="${verificationEmailUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;background:#2563eb;color:white;font-size:14px;">
                    Hesabımı Doğrula
                  </a>
                </div>

                <p style="margin:0 0 16px 0;color:#475569;font-size:13px;line-height:1.5;">
                  Eğer hesabınızı doğrulamak istemiyorsanız bu e-postayı görmezden gelebilirsiniz.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} Şirket Adı. Tüm hakları saklıdır.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await sendEmailHtml(to, subject, html);
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailHtml,
};
