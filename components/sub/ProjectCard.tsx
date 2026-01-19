import React from "react";
import ShinyText from "@/components/sub/ShinyText";

interface Props {
    src: string;
    title: string;
    description: string;
    link: string;
}

const ProjectCard = ({ src, title, description, link }: Props) => {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#2A0E61] bg-[#0d061f]/60 shadow-lg">
            <div className="h-48 w-full overflow-hidden">
                <img
                    src={src}
                    alt={title}
                    width={1000}
                    height={1000}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="flex h-full flex-col gap-2 p-4">
                <h3 className="text-lg font-semibold">
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                        aria-label={`Buka project ${title}`}
                    >
                        <ShinyText
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500"
                            text={title}
                        />
                    </a>
                </h3>
                <p className="text-sm leading-relaxed text-justify text-gray-300">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default ProjectCard;
