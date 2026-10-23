import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export const cookieOptions = (maxAgeMs) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAgeMs,
    signed: true,
  };
};

export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;        // 15 min
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
