import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translations, type Content, type ContentLocale } from "@/constants/translations";
import { translateJson } from "@/lib/translate";

const ensureContent = async () => {
    const existing = await prisma.siteContent.findUnique({
        where: { id: 1 },
    });

    if (existing) return existing;

    return prisma.siteContent.create({
        data: {
            id: 1,
            content: JSON.stringify(translations.id),
            contentEn: JSON.stringify(translations.en),
        },
    });
};

const safeParse = (value: string, fallback: ContentLocale) => {
    try {
        return JSON.parse(value) as ContentLocale;
    } catch {
        return fallback;
    }
};

export async function GET() {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentRecord = await ensureContent();

    return NextResponse.json({
        content: safeParse(contentRecord.content, translations.id),
    });
}

export async function PUT(request: Request) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { content?: Content["id"] };

    if (!body.content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const translated = (await translateJson(body.content)) as Content["en"];

    const saved = await prisma.siteContent.upsert({
        where: { id: 1 },
        update: {
            content: JSON.stringify(body.content),
            contentEn: JSON.stringify(translated),
        },
        create: {
            id: 1,
            content: JSON.stringify(body.content),
            contentEn: JSON.stringify(translated),
        },
    });

    return NextResponse.json({
        content: safeParse(saved.content, translations.id),
    });
}
