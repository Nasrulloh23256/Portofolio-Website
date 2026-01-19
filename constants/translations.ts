export type ContentLocale = {
    nav: {
        name: string;
        about: string;
        skills: string;
        projects: string;
        languageLabel: string;
    };
    hero: {
        badges: string[];
        title: {
            prefix: string;
            highlightOne: string;
            middle: string;
            highlightTwo: string;
            suffix: string;
        };
        bullets: string[];
        cta: string;
        imageUrl: string;
    };
    about: {
        titlePrefix: string;
        titleHighlight: string;
        name: string;
        description: string;
        tagline: string;
        imageUrl: string;
    };
    skills: {
        titlePrefix: string;
        titleHighlight: string;
        subtitle: string;
        categories: {
            frontend: string;
            backend: string;
            devtools: string;
            libraries: string;
        };
    };
    projects: {
        title: string;
        empty: string;
    };
};

export type Content = {
    en: ContentLocale;
    id: ContentLocale;
};

export const translations: Content = {
    en: {
        nav: {
            name: "Muhammad Nasrulloh",
            about: "About me",
            skills: "Skills",
            projects: "Projects",
            languageLabel: "Language",
        },
        hero: {
            badges: ["Fullstack Developer", "Tech Innovator", "Team Lead"],
            title: {
                prefix: "Coding",
                highlightOne: "Dreams",
                middle: "into",
                highlightTwo: "Reality",
                suffix: "one line at a time",
            },
            bullets: [
                "Finalist in the Top 100 Coders Challenge",
                "Ranked within the Top 9,000 on HackerRank",
                "Participated and Completed Hacktoberfest 2023",
                "Served as a Mentor in Multiple Hackathons.",
            ],
            cta: "Learn More!",
            imageUrl: "/mainIconsdark.svg",
        },
        about: {
            titlePrefix: "About",
            titleHighlight: "Me",
            name: "Muhammad Nasrulloh",
            description:
                "I am Muhammad Nasrulloh, a 6th-semester undergraduate student in Informatics Engineering at Universitas Negeri Surabaya. I focus on web development and user-focused programming, and I keep exploring modern frontend and backend technologies. I enjoy building clean, fast, and easy-to-use projects, and I am open to collaboration and internship opportunities to grow in the industry.",
            tagline: "Shaping Tomorrow with Code and Creativity",
            imageUrl: "/Profil.jpg",
        },
        skills: {
            titlePrefix: "My",
            titleHighlight: "Skills",
            subtitle: "Never miss a task, deadline or idea",
            categories: {
                frontend: "Frontend",
                backend: "Backend",
                devtools: "Dev Tools",
                libraries: "Libraries",
            },
        },
        projects: {
            title: "My Projects",
            empty: "No projects yet.",
        },
    },
    id: {
        nav: {
            name: "Muhammad Nasrulloh",
            about: "Tentang Saya",
            skills: "Keahlian",
            projects: "Proyek",
            languageLabel: "Bahasa",
        },
        hero: {
            badges: ["Pengembang Fullstack", "Inovator Teknologi", "Pemimpin Tim"],
            title: {
                prefix: "Mengubah",
                highlightOne: "Mimpi",
                middle: "menjadi",
                highlightTwo: "Kenyataan",
                suffix: "satu baris demi baris",
            },
            bullets: [
                "Finalis dalam Top 100 Coders Challenge",
                "Masuk peringkat 9.000 besar di HackerRank",
                "Berpartisipasi dan menyelesaikan Hacktoberfest 2023",
                "Menjadi mentor di beberapa hackathon.",
            ],
            cta: "Pelajari Lebih Lanjut!",
            imageUrl: "/mainIconsdark.svg",
        },
        about: {
            titlePrefix: "Tentang",
            titleHighlight: "Saya",
            name: "Muhammad Nasrulloh",
            description:
                "Saya Muhammad Nasrulloh, mahasiswa semester 6 program studi S1 Teknik Informatika di Universitas Negeri Surabaya. Saya fokus mempelajari pengembangan web dan pemrograman yang berorientasi pada pengalaman pengguna, serta terus mengeksplorasi teknologi frontend dan backend modern. Saya senang membangun proyek yang rapi, cepat, dan mudah digunakan, dan saya terbuka untuk kolaborasi serta peluang magang agar semakin berkembang di dunia industri.",
            tagline: "Membentuk Masa Depan dengan Kode dan Kreativitas",
            imageUrl: "/Profil.jpg",
        },
        skills: {
            titlePrefix: "Keahlian",
            titleHighlight: "Saya",
            subtitle: "Jangan pernah melewatkan tugas, tenggat, atau ide",
            categories: {
                frontend: "Frontend",
                backend: "Backend",
                devtools: "Alat Dev",
                libraries: "Pustaka",
            },
        },
        projects: {
            title: "Proyek Saya",
            empty: "Belum ada proyek.",
        },
    },
};

export type Language = keyof Content;
