"use client";

import { useEffect, useState } from "react";
import {
  Mahasiswa,
  Prodi,
  createMahasiswa,
  deleteMahasiswa,
  getMahasiswa,
  getProdi,
  updateMahasiswa,
} from "@/lib/api";
import MahasiswaForm from "../components/MahasiswaForm";
import MahasiswaTable from "../components/MahasiswaTable";

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPage, setTotalPage] = useState(1);

  const loadMahasiswa = async () => {
    const result = await getMahasiswa({
      search,
      prodi_id: prodiId,
      page,
      limit,
    });

    setMahasiswa(result.data);
    setTotalPage(result.meta.totalPage);
  };

  const loadProdi = async () => {
    const data = await getProdi();
    setProdiList(data);
  };

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    loadMahasiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, prodiId, page]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSubmit = async (formData: FormData) => {
    if (selectedMahasiswa) {
      await updateMahasiswa(selectedMahasiswa.id, formData);
    } else {
      await createMahasiswa(formData);
    }

    setSelectedMahasiswa(null);
    await loadMahasiswa();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;

    await deleteMahasiswa(id);
    await loadMahasiswa();
  };

  return (
    <div className="container">
      <h1>Data Mahasiswa</h1>

      <MahasiswaForm
        selectedMahasiswa={selectedMahasiswa}
        prodiList={prodiList}
        onSubmit={handleSubmit}
        onCancelEdit={() => setSelectedMahasiswa(null)}
      />

      <div className="filters">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari NIM atau nama"
        />

        <select
          value={prodiId}
          onChange={(e) => {
            setPage(1);
            setProdiId(e.target.value);
          }}
        >
          <option value="">Semua Prodi</option>
          {prodiList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama_prodi}
            </option>
          ))}
        </select>

        <button onClick={handleSearch}>Cari</button>
      </div>

      <MahasiswaTable
        mahasiswa={mahasiswa}
        onEdit={setSelectedMahasiswa}
        onDelete={handleDelete}
      />

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span>
          Halaman {page} dari {totalPage}
        </span>

        <button
          disabled={page >= totalPage}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}