import { Router, Request, Response } from "express";
import db from "../config/database";
import upload from "../middlewares/upload.middleware";

const router = Router();

// GET ALL dengan Search + Filter + Pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const prodi_id = req.query.prodi_id as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
    conditions.push("(m.nim LIKE ? OR m.nama LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
    }

    if (prodi_id) {
      conditions.push("m.prodi_id = ?");
      params.push(Number(prodi_id));
    }

    const whereClause =
      conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";

    // hitung total data (pakai where clause yang sama, params yang sama, TANPA limit/offset)
    const countSql = `
      SELECT COUNT(*) AS total
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
      ${whereClause}
    `;

    const [countRows]: any = await db.query(countSql, params);
    const total = countRows[0].total;

    // query data dengan limit/offset
    let sql = `
      SELECT
        m.id,
        m.nim,
        m.nama,
        m.prodi_id,
        p.nama_prodi,
        m.angkatan,
        m.foto,
        m.created_at,
        m.updated_at
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
      ${whereClause}
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];

    const [rows] = await db.query(sql, dataParams);

    res.json({
      message: "Data mahasiswa berhasil diambil",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

// GET DETAIL dengan JOIN prodi
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const [rows]: any = await db.query(
      `
      SELECT
        m.id,
        m.nim,
        m.nama,
        m.prodi_id,
        p.nama_prodi,
        m.angkatan,
        m.foto,
        m.created_at,
        m.updated_at
      FROM mahasiswa m
      JOIN prodi p ON m.prodi_id = p.id
      WHERE m.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.json({
      message: "Detail mahasiswa berhasil diambil",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

// UPDATE dengan upload foto
router.put(
  "/:id",
  upload.single("foto"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nim, nama, prodi_id, angkatan } = req.body;

      const fields = ["nim = ?", "nama = ?", "prodi_id = ?", "angkatan = ?"];

      const values: any[] = [nim, nama, Number(prodi_id), Number(angkatan)];

      if (req.file) {
        fields.push("foto = ?");
        values.push(req.file.filename);
      }

      values.push(id);

      const [result]: any = await db.query(
        `UPDATE mahasiswa SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Mahasiswa tidak ditemukan",
        });
      }

      res.json({
        message: "Mahasiswa berhasil diperbarui",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Terjadi kesalahan server",
      });
    }
  }
);

// CREATE dengan upload foto
router.post(
  "/",
  upload.single("foto"),
  async (req: Request, res: Response) => {
    try {
      const { nim, nama, prodi_id, angkatan } = req.body;
      const foto = req.file ? req.file.filename : null;

      if (!nim || !nama || !prodi_id || !angkatan) {
        return res.status(400).json({
          message: "NIM, nama, prodi, dan angkatan wajib diisi",
        });
      }

      const [existing]: any = await db.query(
        "SELECT id FROM mahasiswa WHERE nim = ?",
        [nim]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: "NIM sudah digunakan",
        });
      }

      const [result]: any = await db.query(
        `INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan, foto)
         VALUES (?, ?, ?, ?, ?)`,
        [nim, nama, Number(prodi_id), Number(angkatan), foto]
      );

      res.status(201).json({
        message: "Mahasiswa berhasil ditambahkan",
        data: {
          id: result.insertId,
          nim,
          nama,
          prodi_id: Number(prodi_id),
          angkatan: Number(angkatan),
          foto,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Terjadi kesalahan server",
      });
    }
  }
);

// DELETE mahasiswa
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result]: any = await db.query("DELETE FROM mahasiswa WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.json({
      message: "Mahasiswa berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
});

export default router;