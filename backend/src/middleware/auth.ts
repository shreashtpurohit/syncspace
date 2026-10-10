
import type { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Temporary development identity; replace with real authentication later.
  req.user = {
    id:
      process.env.DEV_USER_ID ??
      "83e208cf-f5cb-44ea-a750-6f90223d10fb",
  };

  next();
};
