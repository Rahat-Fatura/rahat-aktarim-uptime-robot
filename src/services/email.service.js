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

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = "Şifre Sıfırlama";
  const resetPasswordUrl = `${config.app.url}/reset-password?token=${token}`;
  const text = `Sayın kullanıcı,
    Şifrenizi sıfırlamak için bu linke gidebilirsiniz: ${resetPasswordUrl}
    Eğer şifrenizi sıfırlamak istemiyorsanız bu e-postayı görmezden gelebilirsiniz.`;
  await sendEmail(to, subject, text);
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
  const text = `Sayın kullanıcı,
    Hesabınızı doğrulamak için bu linke gidebilirsiniz: ${verificationEmailUrl}
    Eğer hesabınızı doğrulamak istemiyorsanız bu e-postayı görmezden gelebilirsiniz.`;
  await sendEmail(to, subject, text);
};

const sendEmailAboutMonitorUp = async (monitor, result) => {
  await sendEmail(
    `<${monitor.serverOwner.email}>`,
    `Monitor is UP. ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
    `Merhaba ${monitor.serverOwner.name},
                Rahat Up izleme sistemine eklediğiniz servisine erişim denemesi başarıyla sonuçlandı.
                📌 Servis Bilgileri:
                    Servis Adı: ${monitor.name}
                    Durum: ✅ Erişilebilir (UP)
                    Kontrol Zamanı: ${new Date(monitor.controlTime)}
                    Yanıt Kodu: ${result.status}
                    Yanıt Süresi: ${result.responseTime}ms
                    Servisiniz izleme kapsamına alınmıştır. Bundan sonraki erişim durumlarıyla ilgili gelişmelerde size bilgi vermeye devam edeceğiz.
                    Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                    Saygılarımızla,
                    Rahat Up Ekibi`
  );
};

const sendEmailAboutMonitorDown = async (monitor, result) => {
  await sendEmail(
    `<${monitor.serverOwner.email}>`,
    `Monitor is DOWN. ${monitor.monitorType} on ${httpMonitor.host} ${httpMonitor.method}`,
    `Merhaba ${monitor.serverOwner.name},
                Rahat Up izleme sistemimiz, aşağıdaki servisinize şu anda erişim sağlanamadığını tespit etti:
                📌 Servis Bilgileri:
                    Servis Adı: ${monitor.name}
                    Durum: ❌ Erişim Yok (DOWN)
                    Kontrol Zamanı: ${new Date(monitor.controlTime)}
                    Yanıt Kodu: ${result.status}
                    Yanıt Süresi: ${result.responseTime}ms 
                    Erişim problemi devam ettiği sürece izleme yapılmaya devam edilecektir.
                    Servis yeniden erişilebilir olduğunda tarafınıza tekrar bilgilendirme yapılacaktır.
                    Yardım veya sorularınız için bize +90542 315 88 12 numara üzerinden ulaşabilirsiniz.
                    Saygılarımızla,
                    Rahat Up Ekibi`
  );
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailAboutMonitorUp,
  sendEmailAboutMonitorDown,
};
