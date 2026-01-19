"use client";

import React from "react";
import ProjectCard from "../sub/ProjectCard";
import ShinyText from "../sub/ShinyText";
import { useLanguage } from "@/components/main/LanguageProvider";
import { useContent } from "@/components/main/ContentProvider";

const Projects = () => {
    const { language } = useLanguage();
    const { content, projects } = useContent();
    const copy = content[language];
    const projectList = projects[language];

    return (
        <section
            className="flex w-full flex-col items-center justify-center py-20"
            id="projects"
        >
            <div className="w-full max-w-6xl px-6">
                <h1 className="text-center text-4xl font-semibold">
                    <ShinyText
                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500"
                        text={copy.projects.title}
                    />
                </h1>
                <div className="mt-10">
                    {projectList.length === 0 ? (
                        <p className="text-center text-gray-400">
                            {copy.projects.empty}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {projectList.map((project) => (
                                <div
                                    key={project.id}
                                    className="block h-full"
                                >
                                    <ProjectCard
                                        src={project.imageUrl || "/CardImage.png"}
                                        title={project.name}
                                        description={project.description}
                                        link={project.link}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Projects;
