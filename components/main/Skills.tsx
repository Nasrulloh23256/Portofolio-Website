"use client";

import {
    Backend_skill,
    DevTools,
    Frontend_skill,
	libraries,
} from "@/constants";
import React from "react";
import SkillDataProvider from "../sub/SkillDataProvider";
import SkillText from "../sub/SkillText";
import { InView } from "react-intersection-observer";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/main/LanguageProvider";
import ShinyText from "@/components/sub/ShinyText";
import { useContent } from "@/components/main/ContentProvider";

const Skills = () => {
    const { language } = useLanguage();
    const { content } = useContent();
    const copy = content[language];

    return (
        <section
            id="skills"
            className="flex flex-col items-center justify-center gap-3 h-fit relative overflow-hidden py-20"
        >
            <SkillText />

            <div className="w-full max-w-6xl px-6">
                <div className="flex flex-col items-center justify-center w-full gap-4">
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="w-full lg:w-1/2 h-full">
                        <InView triggerOnce={false}>
                            {({ inView, ref }) => (
                                <motion.div
                                    ref={ref}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    variants={slideInFromLeft(0.5)}
                                    className="rounded-md text-[white] w-full my-auto py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9]"
                                >
                                    <ShinyText
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-2xl font-bold"
                                        text={copy.skills.categories.frontend}
                                    />
                                    <br />
                                    <div className="flex flex-row justify-around flex-wrap my-4 gap-5 items-center">
                                        {Frontend_skill.map((image, index) => (
                                            <SkillDataProvider
                                                key={index}
                                                src={image.Image}
                                                width={image.width}
                                                height={image.height}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </InView>
                    </div>
                    <div className="w-full lg:w-1/2 h-full">
                        <InView triggerOnce={false}>
                            {({ inView, ref }) => (
                                <motion.div
                                    ref={ref}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    variants={slideInFromRight(0.5)}
                                    className="rounded-md text-[white] w-full h-full py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9]"
                                >
                                    <ShinyText
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-2xl font-bold"
                                        text={copy.skills.categories.backend}
                                    />
                                    <br />
                                    <div className="flex flex-row justify-around flex-wrap my-4 gap-5 items-center">
                                        {Backend_skill.map((image, index) => (
                                            <SkillDataProvider
                                                key={index}
                                                src={image.Image}
                                                width={image.width}
                                                height={image.height}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </InView>
                    </div>
                </div>
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="w-full lg:w-1/2 h-full">
                        <InView triggerOnce={false}>
                            {({ inView, ref }) => (
                                <motion.div
                                    ref={ref}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    variants={slideInFromLeft(0.5)}
                                    className="rounded-md text-[white] w-full my-auto py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9]"
                                >
                                    <ShinyText
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-2xl font-bold"
                                        text={copy.skills.categories.devtools}
                                    />
                                    <br />
                                    <div className="flex flex-row justify-around flex-wrap my-4 gap-5 items-center">
                                        {DevTools.map((image, index) => (
                                            <SkillDataProvider
                                                key={index}
                                                src={image.Image}
                                                width={image.width}
                                                height={image.height}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </InView>
                    </div>
                    <div className="w-full lg:w-1/2 h-full">
                        <InView triggerOnce={false}>
                            {({ inView, ref }) => (
                                <motion.div
                                    ref={ref}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    variants={slideInFromRight(0.5)}
                                    className="rounded-md text-[white] w-full h-full py-[8px] px-[10px] border border-[#7042f88b] opacity-[0.9]"
                                >
                                    <ShinyText
                                        className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 text-2xl font-bold"
                                        text={copy.skills.categories.libraries}
                                    />
                                    <br />
                                    <div className="flex flex-row justify-around flex-wrap my-4 gap-5 items-center">
                                        {libraries.map((image, index) => (
                                            <SkillDataProvider
                                                key={index}
                                                src={image.Image}
                                                width={image.width}
                                                height={image.height}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </InView>
                    </div>
                </div>
            </div>
            </div>

            <div className="hidden md:block w-full h-full absolute top-24">
                <div className="w-full h-full z-[-10] opacity-30 absolute flex items-center justify-center bg-cover">
                    <video
                        className="w-full h-auto"
                        preload="false"
                        playsInline
                        loop
                        muted
                        autoPlay
                        src="/cards-video.webm"
                    />
                </div>
            </div>
        </section>
    );
};

export default Skills;
