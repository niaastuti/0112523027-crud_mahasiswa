"use client";

import { UserAccount } from "@/lib/api";

type Props = {
  users: UserAccount[];
  onEdit: (item: UserAccount) => void;
  onDelete: (id: number) => Promise<void>;
  onResetPassword: (id: number) => Promise<void>;
};

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onResetPassword,
}: Props) {
  if (users.length === 0) {
    return <p>Belum ada data user.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama</th>
          <th>Email</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>
        {users.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{item.name}</td>
            <td>{item.email}</td>
            <td>{item.role}</td>
            <td>
              <div className="actions">
                <button className="btn-secondary" onClick={() => onEdit(item)}>
                  Edit
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => onResetPassword(item.id)}
                >
                  Reset Password
                </button>

                <button
                  className="btn-danger"
                  onClick={() => onDelete(item.id)}
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}