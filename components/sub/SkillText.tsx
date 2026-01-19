"use client";
import React from "react";
import { motion } from "framer-motion";
import {
	slideInFromLeft,
    slideInFromRight,
    slideInFromTop,
} from "@/utils/motion";
import { InView } from "react-intersection-observer";
import { useLanguage } from "@/components/main/LanguageProvider";
import ShinyText from "@/components/sub/ShinyText";
import { useContent } from "@/components/main/ContentProvider";

const SkillText = () => {
    const { language } = useLanguage();
    const { content } = useContent();
    const copy = content[language];

    return (
        <div className="w-full h-auto pt-20 flex flex-col items-center justify-center">
            <InView triggerOnce={false}>
                {({ inView, ref }) => (
                    <motion.div
                        ref={ref}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        variants={slideInFromTop}
                        className="text-[40px] pt-[5rem] pb-3 md:p-0 font-medium text-center text-gray-200 z-50"
                    >
                        {copy.skills.titlePrefix}
                        {" "}
                        <ShinyText
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500"
                            text={copy.skills.titleHighlight}
                        />
                    </motion.div>
                )}
            </InView>

            <InView triggerOnce={false}>
                {({ inView, ref }) => (
                    <motion.div
                        ref={ref}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        variants={slideInFromLeft(0.5)}
                        className="cursive text-[20px] text-gray-200 mb-10 mt-[10px] text-center"
                    >
                        {copy.skills.subtitle}
                    </motion.div>
                )}
            </InView>
        </div>
    );
};

export default SkillText;
