
import type { Request, Response, NextFunction } from "express";
import { findLinkedOAuthProviders } from "../repositories/oauthAccountRepository.js";

export const getLinkedOAuthAccountsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accounts = await findLinkedOAuthProviders(req.user.id);

    return res.status(200).json({
      accounts,
    });
  } catch (error) {
    return next(error);
  }
};
