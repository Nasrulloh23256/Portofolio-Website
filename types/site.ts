export type ProjectItem = {
    id: number;
    name: string;
    description: string;
    link: string;
    imageUrl?: string | null;
};

export type ProjectsByLanguage = {
    id: ProjectItem[];
    en: ProjectItem[];
};
