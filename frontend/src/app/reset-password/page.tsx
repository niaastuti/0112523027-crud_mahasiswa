"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPasswordWithToken(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset password gagal");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1>Link Tidak Valid</h1>
          <p>Token reset password tidak ditemukan pada URL.</p>
          <a href="/login">Kembali ke Login</a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div className="card">
          <h1>Password Berhasil Direset</h1>
          <p>Silakan login menggunakan password baru Anda.</p>
          <a href="/login">Ke Halaman Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="card">
        <h1>Reset Password</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="form-group">
          <label htmlFor="newPassword">Password Baru</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Memproses..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container">Memuat...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}