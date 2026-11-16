
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const verifyRequestOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");

  if (!origin || origin !== env.APP_ORIGIN) {
    next(new AppError("Invalid or missing request origin", 403));
    return;
  }

  next();
};
