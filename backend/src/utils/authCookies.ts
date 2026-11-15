import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";

const isProduction = env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "syncspace_access";
export const REFRESH_TOKEN_COOKIE = "syncspace_refresh";

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

export const accessCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/",
  maxAge: ACCESS_TOKEN_MAX_AGE,
};

export const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  path: "/auth",
  maxAge: REFRESH_TOKEN_MAX_AGE,
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, accessCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    ...baseCookieOptions,
    path: "/",
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...baseCookieOptions,
    path: "/auth",
  });
};