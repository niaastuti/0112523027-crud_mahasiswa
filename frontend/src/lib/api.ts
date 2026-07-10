import { getToken } from "./auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi: string;
  angkatan: number;
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Prodi = {
  id: number;
  nama_prodi: string;
};

export type MahasiswaQuery = {
  search?: string;
  prodi_id?: string;
  page?: number;
  limit?: number;
};

export type MahasiswaListResponse = {
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: Mahasiswa[];
};

export type UserAccount = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  created_at?: string;
};

export type UserInput = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "operator" | "viewer";
};

export type UserUpdateInput = {
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
};

async function handleResponse<T>(response: Response): Promise<T> {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Terjadi kesalahan saat mengakses API");
  }

  return result;
}

// ambil daftar prodi untuk dropdown (tidak butuh token)
export async function getProdi(): Promise<Prodi[]> {
  const response = await fetch(`${API_URL}/prodi`, {
    cache: "no-store",
  });

  const result = await handleResponse<{ message: string; data: Prodi[] }>(
    response
  );

  return result.data;
}

// ambil daftar mahasiswa dengan search, filter, pagination
export async function getMahasiswa(
  params: MahasiswaQuery
): Promise<MahasiswaListResponse> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.prodi_id) query.set("prodi_id", params.prodi_id);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const token = getToken();

  const response = await fetch(
    `${API_URL}/db/mahasiswa?${query.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return handleResponse<MahasiswaListResponse>(response);
}

// tambah mahasiswa (multipart, karena ada upload foto)
export async function createMahasiswa(formData: FormData): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/db/mahasiswa`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  await handleResponse(response);
}

// update mahasiswa (multipart, karena ada upload foto opsional)
export async function updateMahasiswa(
  id: number,
  formData: FormData
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/db/mahasiswa/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  await handleResponse(response);
}

export async function deleteMahasiswa(id: number): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/db/mahasiswa/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await handleResponse(response);
}

// ambil daftar user (admin only)
export async function getUsers(): Promise<UserAccount[]> {
  const token = getToken();

  const response = await fetch(`${API_URL}/users`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await handleResponse<{ message: string; data: UserAccount[] }>(
    response
  );

  return result.data;
}

// tambah user baru (admin only)
export async function createUserAccount(payload: UserInput): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await handleResponse(response);
}

// update user (admin only)
export async function updateUserAccount(
  id: number,
  payload: UserUpdateInput
): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await handleResponse(response);
}

// hapus user (admin only)
export async function deleteUserAccount(id: number): Promise<void> {
  const token = getToken();

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await handleResponse(response);
}

// reset password user (admin only)
export async function resetUserPassword(
  id: number
): Promise<{ temporaryPassword: string }> {
  const token = getToken();

  const response = await fetch(`${API_URL}/users/${id}/reset-password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<{ temporaryPassword: string }>(response);
}

// user minta link reset password lewat email
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  await handleResponse(response);
}

// user submit password baru pakai token dari email
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  await handleResponse(response);
}