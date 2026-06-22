import express from "express";
import cors from "cors";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import mahasiswaDbRoutes from "./routes/mahasiswa-db.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "API Express CRUD berjalan",
  });
});

// CRUD Array (Pertemuan 2)
app.use("/api/mahasiswa", mahasiswaRoutes);

// CRUD Database MySQL (Pertemuan 3)
app.use("/api/db/mahasiswa", mahasiswaDbRoutes);

export default app;