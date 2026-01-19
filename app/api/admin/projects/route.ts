import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { fetchOgImage } from "@/lib/og";
import { promises as fs } from "node:fs";
import path from "node:path";

const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]);

const getImageExtension = (file: File) => {
    const ext = path.extname(file.name || "").toLowerCase();
    if (ext) return ext;
    switch (file.type) {
        case "image/png":
            return ".png";
        case "image/webp":
            return ".webp";
        case "image/jpeg":
        default:
            return ".jpg";
    }
};

const uploadProjectImage = async (file: File) => {
    if (!allowedImageTypes.has(file.type)) {
        throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.");
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error("Ukuran gambar terlalu besar (maks 5MB).");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = getImageExtension(file);
    const fileName = `project-${Date.now()}-${Math.round(
        Math.random() * 1e9
    )}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    return `/uploads/projects/${fileName}`;
};

export async function GET() {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            projects: projects.map((project) => ({
                id: project.id,
                name: project.name,
                description: project.description,
                link: project.link,
                imageUrl: project.imageUrl,
            })),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const needsSetup =
            message.includes("no such table") ||
            message.includes("no such column") ||
            message.includes("does not exist");
        const hint = needsSetup
            ? "Database belum diinisialisasi/diupdate. Jalankan `npx prisma db push`."
            : "Gagal memuat project.";
        return NextResponse.json({ error: hint }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let name = "";
    let link = "";
    let description = "";
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        name = String(formData.get("name") ?? "").trim();
        link = normalizeUrl(String(formData.get("link") ?? ""));
        description = String(formData.get("description") ?? "").trim();
        const maybeFile = formData.get("image");
        if (
            maybeFile &&
            typeof maybeFile === "object" &&
            "arrayBuffer" in maybeFile
        ) {
            imageFile = maybeFile as File;
        }
    } else {
        const body = (await request.json()) as {
            name?: string;
            link?: string;
            description?: string;
        };

        name = body.name?.trim() ?? "";
        link = normalizeUrl(body.link ?? "");
        description = body.description?.trim() ?? "";
    }

    if (!name || !link || !description) {
        return NextResponse.json(
            { error: "Name, link, and description are required" },
            { status: 400 }
        );
    }

    try {
        const nameEnPromise = translateText(name);
        const descriptionEnPromise = translateText(description);
        let imageUrl: string | null = null;
        if (imageFile) {
            imageUrl = await uploadProjectImage(imageFile);
        } else {
            imageUrl = await fetchOgImage(link);
        }
        const [nameEn, descriptionEn] = await Promise.all([
            nameEnPromise,
            descriptionEnPromise,
        ]);

        const project = await prisma.project.create({
            data: {
                name,
                nameEn,
                description,
                descriptionEn,
                link,
                imageUrl,
            },
        });

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                link: project.link,
                imageUrl: project.imageUrl,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Format gambar") || message.includes("Ukuran gambar")) {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        const needsSetup =
            message.includes("no such table") ||
            message.includes("no such column") ||
            message.includes("does not exist");
        const hint = needsSetup
            ? "Database belum diinisialisasi/diupdate. Jalankan `npx prisma db push`."
            : "Gagal menambahkan project.";
        return NextResponse.json({ error: hint }, { status: 500 });
    }
}


export async function PUT(request: Request) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    let id = 0;
    let name = "";
    let link = "";
    let description = "";
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        id = Number(formData.get("id"));
        name = String(formData.get("name") ?? "").trim();
        link = normalizeUrl(String(formData.get("link") ?? ""));
        description = String(formData.get("description") ?? "").trim();
        const maybeFile = formData.get("image");
        if (
            maybeFile &&
            typeof maybeFile === "object" &&
            "arrayBuffer" in maybeFile
        ) {
            imageFile = maybeFile as File;
        }
    } else {
        const body = (await request.json()) as {
            id?: number;
            name?: string;
            link?: string;
            description?: string;
        };

        id = Number(body.id);
        name = body.name?.trim() ?? "";
        link = normalizeUrl(body.link ?? "");
        description = body.description?.trim() ?? "";
    }

    if (!id) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    if (!name || !link || !description) {
        return NextResponse.json(
            { error: "Name, link, and description are required" },
            { status: 400 }
        );
    }

    try {
        const existing = await prisma.project.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const nameEnPromise = translateText(name);
        const descriptionEnPromise = translateText(description);

        let imageUrl: string | null = existing.imageUrl;
        if (imageFile) {
            imageUrl = await uploadProjectImage(imageFile);
        } else if (!imageUrl) {
            imageUrl = await fetchOgImage(link);
        }

        const [nameEn, descriptionEn] = await Promise.all([
            nameEnPromise,
            descriptionEnPromise,
        ]);

        const project = await prisma.project.update({
            where: { id },
            data: {
                name,
                nameEn,
                description,
                descriptionEn,
                link,
                imageUrl,
            },
        });

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                link: project.link,
                imageUrl: project.imageUrl,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Format gambar") || message.includes("Ukuran gambar")) {
            return NextResponse.json({ error: message }, { status: 400 });
        }
        const needsSetup =
            message.includes("no such table") ||
            message.includes("no such column") ||
            message.includes("does not exist");
        const hint = needsSetup
            ? "Database belum diinisialisasi/diupdate. Jalankan `npx prisma db push`."
            : "Gagal memperbarui project.";
        return NextResponse.json({ error: hint }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}
