const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCredenciales = async (destinatario, nombre, password) => {
  const mailOptions = {
    from: `"Sistema Macavilpaz" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Tus credenciales de acceso - Sistema Macavilpaz',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 0.5rem;">Bienvenido al Sistema Macavilpaz</h2>
        <p style="color: #64748b;">Hola <strong>${nombre}</strong>, tu cuenta ha sido creada. Usa las siguientes credenciales para ingresar:</p>
        
        <div style="background: #f1f5f9; border-radius: 6px; padding: 1.25rem; margin: 1.5rem 0;">
          <p style="margin: 0 0 0.5rem; color: #475569; font-size: 0.9rem;">Correo electrónico:</p>
          <p style="margin: 0 0 1rem; font-weight: 700; color: #0f172a;">${destinatario}</p>
          <p style="margin: 0 0 0.5rem; color: #475569; font-size: 0.9rem;">Contraseña temporal:</p>
          <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 1.1rem; letter-spacing: 2px;">${password}</p>
        </div>
        
        <p style="color: #ef4444; font-size: 0.85rem;">Por seguridad, se recomienda cambiar tu contraseña al ingresar por primera vez.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
        <p style="color: #94a3b8; font-size: 0.8rem;">Este mensaje fue generado automáticamente. No respondas a este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const enviarRecuperacion = async (destinatario, nombre, password) => {
  const mailOptions = {
    from: `"Sistema Macavilpaz" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Recuperación de Contraseña - Sistema Macavilpaz',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 0.5rem;">Recuperación de Contraseña</h2>
        <p style="color: #64748b;">Hola <strong>${nombre}</strong>, has solicitado restablecer tu contraseña. Usa la siguiente contraseña temporal para ingresar:</p>
        
        <div style="background: #f1f5f9; border-radius: 6px; padding: 1.25rem; margin: 1.5rem 0;">
          <p style="margin: 0 0 0.5rem; color: #475569; font-size: 0.9rem;">Correo electrónico:</p>
          <p style="margin: 0 0 1rem; font-weight: 700; color: #0f172a;">${destinatario}</p>
          <p style="margin: 0 0 0.5rem; color: #475569; font-size: 0.9rem;">Nueva contraseña temporal:</p>
          <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 1.1rem; letter-spacing: 2px;">${password}</p>
        </div>
        
        <p style="color: #ef4444; font-size: 0.85rem;">Por seguridad, cambia esta contraseña inmediatamente después de iniciar sesión en la sección "Mi Perfil".</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
        <p style="color: #94a3b8; font-size: 0.8rem;">Este mensaje fue generado automáticamente. No respondas a este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { enviarCredenciales, enviarRecuperacion };
