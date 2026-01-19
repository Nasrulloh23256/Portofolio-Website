"use client";

import React, { useEffect, useRef, useState } from "react";
import { translations, type ContentLocale } from "@/constants/translations";
import type { ProjectItem } from "@/types/site";

type LoginForm = {
    email: string;
    password: string;
};

type ProjectForm = {
    name: string;
    link: string;
    description: string;
    imageFile: File | null;
};

const inputClassName =
    "w-full rounded-md border border-[#7042f88b] bg-[#0300145e] px-3 py-2 text-white placeholder:text-gray-400";

const textAreaClassName = `${inputClassName} min-h-[140px]`;

const arrayToText = (items: string[]) => items.join("\n");
const textToArray = (value: string) =>
    value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

const AdminPage = () => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [projectStatusMessage, setProjectStatusMessage] = useState("");
    const [isProjectSubmitting, setIsProjectSubmitting] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [loginForm, setLoginForm] = useState<LoginForm>({
        email: "",
        password: "",
    });
    const [content, setContent] = useState<ContentLocale>(translations.id);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [projectForm, setProjectForm] = useState<ProjectForm>({
        name: "",
        link: "",
        description: "",
        imageFile: null,
    });
    const projectImageRef = useRef<HTMLInputElement | null>(null);

    const updateContent = (path: (string | number)[], value: string | string[]) => {
        setContent((prev) => {
            const next = structuredClone(prev) as ContentLocale;
            let target: any = next;
            for (let i = 0; i < path.length - 1; i += 1) {
                target = target[path[i]];
            }
            target[path[path.length - 1]] = value;
            return next;
        });
    };

    const loadContent = async () => {
        const response = await fetch("/api/admin/content");
        if (!response.ok) return;
        const data = (await response.json()) as { content: ContentLocale };
        if (data.content) {
            setContent(data.content);
        }
    };

    const loadProjects = async () => {
        const response = await fetch("/api/admin/projects");
        if (!response.ok) return;
        const data = (await response.json()) as { projects: ProjectItem[] };
        if (data.projects) setProjects(data.projects);
    };

    const checkAuth = async () => {
        const response = await fetch("/api/admin/me");
        if (!response.ok) {
            setLoading(false);
            return;
        }
        const data = (await response.json()) as { authenticated: boolean };
        if (data.authenticated) {
            setAuthenticated(true);
            await Promise.all([loadContent(), loadProjects()]);
        }
        setLoading(false);
    };

    useEffect(() => {
        void checkAuth();
    }, []);

    const handleLoginSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatusMessage("");
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginForm),
        });
        if (!response.ok) {
            setStatusMessage("Email atau password salah.");
            return;
        }
        setAuthenticated(true);
        await Promise.all([loadContent(), loadProjects()]);
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        setAuthenticated(false);
        setLoginForm({ email: "", password: "" });
    };

    const handleSaveContent = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatusMessage("Menyimpan konten...");
        const response = await fetch("/api/admin/content", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            setStatusMessage("Gagal menyimpan konten.");
            return;
        }
        setStatusMessage("Konten berhasil disimpan.");
    };

    const handleProjectSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const isEditing = editingProjectId !== null;
        setProjectStatusMessage(
            isEditing ? "Menyimpan perubahan..." : "Menambahkan project..."
        );
        setIsProjectSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", projectForm.name);
            formData.append("link", projectForm.link);
            formData.append("description", projectForm.description);
            if (projectForm.imageFile) {
                formData.append("image", projectForm.imageFile);
            }
            if (isEditing) {
                formData.append("id", String(editingProjectId));
            }
            const response = await fetch("/api/admin/projects", {
                method: isEditing ? "PUT" : "POST",
                body: formData,
            });
            const contentType = response.headers.get("content-type") ?? "";
            const data =
                contentType.includes("application/json")
                    ? ((await response.json().catch(() => null)) as
                          | { error?: string }
                          | null)
                    : null;
            if (!response.ok) {
                const fallback = `Gagal ${isEditing ? "memperbarui" : "menambahkan"} project. (status ${response.status})`;
                setProjectStatusMessage(data?.error ?? fallback);
                console.error("Project submit failed:", response.status, data);
                return;
            }
            setProjectForm({
                name: "",
                link: "",
                description: "",
                imageFile: null,
            });
            if (projectImageRef.current) {
                projectImageRef.current.value = "";
            }
            setEditingProjectId(null);
            await loadProjects();
            setProjectStatusMessage(
                isEditing ? "Project berhasil diperbarui." : "Project berhasil ditambahkan."
            );
        } catch (error) {
            setProjectStatusMessage(
                `Gagal ${isEditing ? "memperbarui" : "menambahkan"} project. (network error)`
            );
            console.error("Project submit error:", error);
        } finally {
            setIsProjectSubmitting(false);
        }
    };

    const handleEditProject = (project: ProjectItem) => {
        setEditingProjectId(project.id);
        setProjectForm({
            name: project.name,
            link: project.link,
            description: project.description,
            imageFile: null,
        });
        if (projectImageRef.current) {
            projectImageRef.current.value = "";
        }
        setProjectStatusMessage("");
    };

    const handleCancelEdit = () => {
        setEditingProjectId(null);
        setProjectForm({
            name: "",
            link: "",
            description: "",
            imageFile: null,
        });
        if (projectImageRef.current) {
            projectImageRef.current.value = "";
        }
        setProjectStatusMessage("");
    };

    const handleDeleteProject = async (projectId: number) => {
        const confirmed = window.confirm("Hapus project ini?");
        if (!confirmed) return;
        await fetch(`/api/admin/projects?id=${projectId}`, { method: "DELETE" });
        await loadProjects();
    };

    const heroBadgesText = arrayToText(content.hero.badges);
    const heroBulletsText = arrayToText(content.hero.bullets);

    if (loading) {
        return (
            <main className="min-h-screen pt-24 px-6 text-white relative z-10">
                Memuat...
            </main>
        );
    }

    if (!authenticated) {
        return (
            <main className="min-h-screen pt-24 px-6 text-white relative z-10">
                <div className="mx-auto max-w-xl rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                    <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
                    <form className="space-y-4" onSubmit={handleLoginSubmit}>
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Email
                            </label>
                            <input
                                className={inputClassName}
                                type="email"
                                value={loginForm.email}
                                onChange={(event) =>
                                    setLoginForm((prev) => ({
                                        ...prev,
                                        email: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Password
                            </label>
                            <input
                                className={inputClassName}
                                type="password"
                                value={loginForm.password}
                                onChange={(event) =>
                                    setLoginForm((prev) => ({
                                        ...prev,
                                        password: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-purple-600 py-2 font-semibold text-white"
                        >
                            Masuk
                        </button>
                        {statusMessage ? (
                            <p className="text-sm text-red-300">
                                {statusMessage}
                            </p>
                        ) : null}
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 px-6 pb-24 text-white relative z-10">
            <div className="mx-auto max-w-5xl space-y-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">Admin Panel</h1>
                        <p className="text-sm text-gray-400">
                            Edit konten bahasa Indonesia lewat form. Terjemahan Inggris dibuat otomatis.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md border border-[#7042f88b] px-4 py-2 text-sm"
                    >
                        Keluar
                    </button>
                </div>

                {statusMessage ? (
                    <div className="rounded-md border border-[#7042f88b] bg-[#0300145e] px-4 py-2 text-sm">
                        {statusMessage}
                    </div>
                ) : null}

                <form className="space-y-8" onSubmit={handleSaveContent}>
                    <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Navbar</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Nama
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.nav.name}
                                    onChange={(event) =>
                                        updateContent(
                                            ["nav", "name"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Label Bahasa
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.nav.languageLabel}
                                    onChange={(event) =>
                                        updateContent(
                                            ["nav", "languageLabel"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Menu About
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.nav.about}
                                    onChange={(event) =>
                                        updateContent(
                                            ["nav", "about"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Menu Skills
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.nav.skills}
                                    onChange={(event) =>
                                        updateContent(
                                            ["nav", "skills"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Menu Projects
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.nav.projects}
                                    onChange={(event) =>
                                        updateContent(
                                            ["nav", "projects"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Hero</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Badge (satu per baris)
                                </label>
                                <textarea
                                    className={textAreaClassName}
                                    value={heroBadgesText}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "badges"],
                                            textToArray(event.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Bullet Point (satu per baris)
                                </label>
                                <textarea
                                    className={textAreaClassName}
                                    value={heroBulletsText}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "bullets"],
                                            textToArray(event.target.value)
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Title - Awal
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.title.prefix}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "title", "prefix"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Title - Highlight 1
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.title.highlightOne}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "title", "highlightOne"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Title - Tengah
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.title.middle}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "title", "middle"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Title - Highlight 2
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.title.highlightTwo}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "title", "highlightTwo"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Title - Akhir
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.title.suffix}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "title", "suffix"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero CTA
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.cta}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "cta"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-gray-300">
                                    Hero Image URL
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.hero.imageUrl}
                                    onChange={(event) =>
                                        updateContent(
                                            ["hero", "imageUrl"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>
                    <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">About</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Judul Awal
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.about.titlePrefix}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "titlePrefix"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Judul Highlight
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.about.titleHighlight}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "titleHighlight"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Nama
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.about.name}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "name"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Tagline
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.about.tagline}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "tagline"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-gray-300">
                                    Deskripsi
                                </label>
                                <textarea
                                    className={textAreaClassName}
                                    value={content.about.description}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "description"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-gray-300">
                                    Foto Profil URL
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.about.imageUrl}
                                    onChange={(event) =>
                                        updateContent(
                                            ["about", "imageUrl"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Skills</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Judul Awal
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.titlePrefix}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "titlePrefix"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Judul Highlight
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.titleHighlight}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "titleHighlight"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm text-gray-300">
                                    Subtitle
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.subtitle}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "subtitle"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Kategori Frontend
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.categories.frontend}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "categories", "frontend"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Kategori Backend
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.categories.backend}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "categories", "backend"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Kategori Dev Tools
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.categories.devtools}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "categories", "devtools"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Kategori Libraries
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.skills.categories.libraries}
                                    onChange={(event) =>
                                        updateContent(
                                            ["skills", "categories", "libraries"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Projects</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Judul Section
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.projects.title}
                                    onChange={(event) =>
                                        updateContent(
                                            ["projects", "title"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">
                                    Teks Jika Kosong
                                </label>
                                <input
                                    className={inputClassName}
                                    value={content.projects.empty}
                                    onChange={(event) =>
                                        updateContent(
                                            ["projects", "empty"],
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full rounded-md bg-purple-600 py-3 text-lg font-semibold"
                    >
                        Simpan Konten
                    </button>
                </form>

                <section className="rounded-xl border border-[#2A0E61] bg-[#0300145e] p-6 shadow-lg">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            {editingProjectId ? "Edit Project" : "Tambah Project"}
                        </h2>
                        {editingProjectId ? (
                            <p className="text-sm text-gray-400">
                                Sedang mengedit: {projectForm.name || "Project"}
                            </p>
                        ) : null}
                    </div>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProjectSubmit}>
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Nama Project
                            </label>
                            <input
                                className={inputClassName}
                                value={projectForm.name}
                                onChange={(event) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Link Project
                            </label>
                            <input
                                className={inputClassName}
                                value={projectForm.link}
                                onChange={(event) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        link: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm text-gray-300">
                                Gambar Project (opsional)
                            </label>
                            <input
                                ref={projectImageRef}
                                className={inputClassName}
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        imageFile: event.target.files?.[0] ?? null,
                                    }))
                                }
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Kosongkan jika ingin pakai gambar otomatis dari link.
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm text-gray-300">
                                Deskripsi
                            </label>
                            <textarea
                                className={textAreaClassName}
                                value={projectForm.description}
                                onChange={(event) =>
                                    setProjectForm((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="submit"
                                disabled={isProjectSubmitting}
                                className="flex-1 rounded-md bg-purple-600 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isProjectSubmitting
                                    ? editingProjectId
                                        ? "Menyimpan..."
                                        : "Menambahkan..."
                                    : editingProjectId
                                      ? "Simpan Perubahan"
                                      : "Tambah Project"}
                            </button>
                            {editingProjectId ? (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="rounded-md border border-[#7042f88b] px-4 py-2 text-sm text-gray-200"
                                >
                                    Batal
                                </button>
                            ) : null}
                        </div>
                    </form>
                    {projectStatusMessage ? (
                        <p className="mt-3 text-sm text-gray-300">
                            {projectStatusMessage}
                        </p>
                    ) : null}

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Daftar Project</h3>
                        {projects.length === 0 ? (
                            <p className="text-gray-400">Belum ada project.</p>
                        ) : (
                            <div className="space-y-3">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="flex flex-col gap-3 rounded-lg border border-[#7042f88b] bg-[#0300145e] p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {project.name}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {project.link}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => handleEditProject(project)}
                                                className="rounded-md border border-[#7042f88b] px-3 py-1 text-sm text-gray-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteProject(project.id)
                                                }
                                                className="rounded-md border border-red-400 px-3 py-1 text-sm text-red-200"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminPage;
