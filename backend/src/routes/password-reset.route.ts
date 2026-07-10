import { Router } from "express";
import {
  forgotPassword,
  resetPasswordWithToken,
} from "../controllers/password-reset.controller";

const router = Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithToken);

export default router;