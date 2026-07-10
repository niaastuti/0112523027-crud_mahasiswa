"use client";

import { FormEvent, useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="card">
        <h1>Lupa Password</h1>

        {submitted ? (
          <p>
            Jika email terdaftar, link reset password telah dikirim. Silakan
            cek inbox Anda.
          </p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email terdaftar"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}