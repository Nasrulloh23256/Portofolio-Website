import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translations, type Content, type ContentLocale } from "@/constants/translations";
import type { ProjectsByLanguage } from "@/types/site";

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
    const contentRecord = await ensureContent();
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });

    const projectsByLanguage: ProjectsByLanguage = {
        id: projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            link: project.link,
            imageUrl: project.imageUrl,
        })),
        en: projects.map((project) => ({
            id: project.id,
            name: project.nameEn,
            description: project.descriptionEn,
            link: project.link,
            imageUrl: project.imageUrl,
        })),
    };

    const content: Content = {
        id: safeParse(contentRecord.content, translations.id),
        en: safeParse(contentRecord.contentEn, translations.en),
    };

    return NextResponse.json({ content, projects: projectsByLanguage });
}
