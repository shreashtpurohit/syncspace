
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
} from "../services/authService.js";
import { findUserById } from "../repositories/userRepository.js";
import { AppError } from "../errors/AppError.js";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 bytes"
  );

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: passwordSchema,
});

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const result = await registerUser(validation.data);

    return res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const result = await loginUser(validation.data);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
