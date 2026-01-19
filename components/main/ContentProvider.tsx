"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Content } from "@/constants/translations";
import type { ProjectsByLanguage } from "@/types/site";

type ContentContextValue = {
    content: Content;
    projects: ProjectsByLanguage;
    refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

const emptyProjects: ProjectsByLanguage = { id: [], en: [] };

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
    const [content, setContent] = useState<Content>(translations);
    const [projects, setProjects] = useState<ProjectsByLanguage>(emptyProjects);

    const fetchContent = async () => {
        try {
            const response = await fetch("/api/content", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) return;

            const data = (await response.json()) as {
                content?: Content;
                projects?: ProjectsByLanguage;
            };

            if (data.content) setContent(data.content);
            if (data.projects) setProjects(data.projects);
        } catch {
            // Keep defaults on failure.
        }
    };

    useEffect(() => {
        void fetchContent();
    }, []);

    const value = useMemo(
        () => ({
            content,
            projects,
            refresh: fetchContent,
        }),
        [content, projects]
    );

    return (
        <ContentContext.Provider value={value}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error("useContent must be used within ContentProvider");
    }
    return context;
};
