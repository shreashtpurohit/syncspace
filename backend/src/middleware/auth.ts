import type { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.log("authenticate middleware loaded");
  // Temporary user for development/testing
  req.user = {
    id: "83e208cf-f5cb-44ea-a750-6f90223d10fb",
  };

  next();
};