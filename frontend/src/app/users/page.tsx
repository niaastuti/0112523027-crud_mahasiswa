"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserAccount,
  UserInput,
  UserUpdateInput,
  createUserAccount,
  deleteUserAccount,
  getUsers,
  resetUserPassword,
  updateUserAccount,
} from "@/lib/api";
import { getToken, getUser, logout } from "@/lib/auth";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(
    null
  );
  const [checking, setChecking] = useState(true);

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const user = getUser();
    if (user?.role !== "admin") {
      router.push("/mahasiswa");
      return;
    }

    setCurrentUser(user);
    setChecking(false);
  }, [router]);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    if (!checking) {
      loadUsers();
    }
  }, [checking]);

  const handleSubmit = async (payload: UserInput | UserUpdateInput) => {
    if (selectedUser) {
      await updateUserAccount(selectedUser.id, payload as UserUpdateInput);
    } else {
      await createUserAccount(payload as UserInput);
    }

    setSelectedUser(null);
    await loadUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    await deleteUserAccount(id);
    await loadUsers();
  };

  const handleResetPassword = async (id: number) => {
    if (!confirm("Reset password user ini?")) return;

    const result = await resetUserPassword(id);
    alert(`Password sementara: ${result.temporaryPassword}\n\nCatat sekarang, password ini tidak akan ditampilkan lagi.`);
  };

  if (checking) {
    return <div className="container">Memeriksa akses...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Kelola User</h1>
        <div>
          {currentUser && (
            <span style={{ marginRight: 12 }}>
              Halo, {currentUser.name} ({currentUser.role})
            </span>
          )}
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <UserForm
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedUser(null)}
      />

      <UserTable
        users={users}
        onEdit={setSelectedUser}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}