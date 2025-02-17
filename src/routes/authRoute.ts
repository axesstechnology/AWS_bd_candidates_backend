import express, { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authContoller";
import { loginValidator } from "../middleware/validators";

const router: Router = express.Router();

router.route("/register").post(registerUser);
router.post("/login", loginValidator, loginUser);
router.post("/logout", logoutUser);


export default router;
