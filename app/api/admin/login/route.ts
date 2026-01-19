import { NextResponse } from "next/server";
import {
    createSessionToken,
    getSessionCookieName,
    validateCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
    const body = (await request.json()) as {
        email?: string;
        password?: string;
    };

    const email = body.email ?? "";
    const password = body.password ?? "";

    if (!validateCredentials(email, password)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({ ok: true });

    response.cookies.set(getSessionCookieName(), token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
}
