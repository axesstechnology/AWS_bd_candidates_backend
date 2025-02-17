import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];