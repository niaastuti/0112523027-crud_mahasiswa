import express from "express";
import cors from "cors";
import path from "path";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import mahasiswaDbRoutes from "./routes/mahasiswa-db.route";
import prodiRoutes from "./routes/prodi.route";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "API Express CRUD berjalan",
  });
});

app.use("/api/prodi", prodiRoutes);

// CRUD Array
app.use("/api/mahasiswa", mahasiswaRoutes);

// CRUD Database MySQL
app.use("/api/db/mahasiswa", mahasiswaDbRoutes);

app.use("/api/auth", authRoutes);

export default app;