"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserAccount, UserInput, UserUpdateInput } from "@/lib/api";

type Props = {
  selectedUser: UserAccount | null;
  onSubmit: (payload: UserInput | UserUpdateInput) => Promise<void>;
  onCancelEdit: () => void;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "operator" | "viewer";
};

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
};

export default function UserForm({ selectedUser, onSubmit, onCancelEdit }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setForm({
        name: selectedUser.name,
        email: selectedUser.email,
        password: "",
        role: selectedUser.role,
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedUser]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (selectedUser) {
        // update: tidak kirim password
        await onSubmit({
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        // create: password wajib
        await onSubmit({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }

      setForm(initialForm);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{selectedUser ? "Edit User" : "Tambah User"}</h2>

      <div className="grid">
        <div className="form-group">
          <label htmlFor="name">Nama</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama user"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email user"
            required
          />
        </div>

        {!selectedUser && (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as FormState["role"] })
            }
          >
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : selectedUser ? "Update" : "Simpan"}
        </button>

        {selectedUser && (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            Batal Edit
          </button>
        )}
      </div>
    </form>
  );
}