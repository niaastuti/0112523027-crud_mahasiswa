import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import db from "../config/database";
import { mailer } from "../config/mail";

// User minta reset password lewat email
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    const [rows]: any = await db.query(
      "SELECT id, name, email FROM users WHERE email = ?",
      [email]
    );

    // Selalu kirim response sukses meski email tidak ditemukan,
    // supaya orang tidak bisa menebak-nebak email mana yang terdaftar
    if (rows.length === 0) {
      return res.json({
        message: "Jika email terdaftar, link reset password telah dikirim",
      });
    }

    const user = rows[0];

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 menit

    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, tokenHash, expiresAt]
    );

    await mailer.sendMail({
      from: `Admin Kampus <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Reset Password",
      html: `
        <p>Anda meminta reset password.</p>
        <p>Klik link berikut untuk mengganti password:</p>
        <a href="${process.env.APP_URL}/reset-password?token=${rawToken}">
          Reset Password
        </a>
        <p>Link berlaku selama 30 menit.</p>
      `,
    });

    res.json({
      message: "Jika email terdaftar, link reset password telah dikirim",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// User submit password baru pakai token dari email
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [rows]: any = await db.query(
      `SELECT id, user_id, expires_at, used_at
       FROM password_reset_tokens
       WHERE token_hash = ?`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token tidak valid" });
    }

    const resetToken = rows[0];

    if (resetToken.used_at) {
      return res.status(400).json({ message: "Token sudah digunakan" });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ message: "Token sudah kedaluwarsa" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ]);

    await db.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
      [resetToken.id]
    );

    res.json({ message: "Password berhasil direset, silakan login" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};