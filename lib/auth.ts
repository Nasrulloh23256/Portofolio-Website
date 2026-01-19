import crypto from "crypto";
import { cookies } from "next/headers";

const sessionCookieName = "admin_session";

const getAuthSecret = () => {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error("AUTH_SECRET is not set");
    }
    return secret;
};

const safeEqual = (a: string, b: string) => {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    if (aBuffer.length !== bBuffer.length) return false;
    return crypto.timingSafeEqual(aBuffer, bBuffer);
};

export const validateCredentials = (email: string, password: string) => {
    const adminEmail = process.env.ADMIN_EMAIL ?? "";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";
    if (!adminEmail || !adminPassword) return false;
    return safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
};

const sign = (value: string) => {
    return crypto
        .createHmac("sha256", getAuthSecret())
        .update(value)
        .digest("base64url");
};

export const createSessionToken = (email: string) => {
    const payload = JSON.stringify({
        email,
        issuedAt: Date.now(),
    });
    const encoded = Buffer.from(payload).toString("base64url");
    const signature = sign(encoded);
    return `${encoded}.${signature}`;
};

export const verifySessionToken = (token?: string) => {
    if (!token) return false;
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return false;
    const expected = sign(encoded);
    if (!safeEqual(signature, expected)) return false;
    return true;
};

export const getSessionCookieName = () => sessionCookieName;

export const isAuthenticated = () => {
    const session = cookies().get(sessionCookieName)?.value;
    return verifySessionToken(session);
};
