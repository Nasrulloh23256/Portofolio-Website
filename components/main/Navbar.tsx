"use client";

import { Socials } from "@/constants";
import { useLanguage } from "@/components/main/LanguageProvider";
import { useContent } from "@/components/main/ContentProvider";
import Image from "next/image";
import React from "react";

const Navbar = () => {
    const { language, toggleLanguage } = useLanguage();
    const { content } = useContent();
    const copy = content[language];

    return (
        <div className="w-screen md:w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-10 m-0 max-w-[1855px] items-center rounded-full">
            <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[0px] md:px-[10px]">
                <a
                    href="#home"
                    className="h-auto w-auto flex flex-row items-center"
                >
                    <Image
                        src="/logo.png"
                        alt="logo"
                        width={50}
                        height={50}
                        className="cursor-pointer hover:animate-spin w-10"
                    />

                    <span className="font-bold ml-[10px] block text-gray-300 z-50 md:text-lg text-xl">
                        {copy.nav.name}
                    </span>
                </a>

                <div className="hidden w-3/6 lg:w-1/3 h-full md:flex flex-row items-center justify-between md:mx-auto lg:pr-12">
                    <div className="flex items-center justify-between w-full h-auto border border-[#7042f861] bg-[#0300145e] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200">
                        <a href="#about" className="cursor-pointer">
                            {copy.nav.about}
                        </a>
                        <a href="#skills" className="cursor-pointer">
                            {copy.nav.skills}
                        </a>
                        <a href="#projects" className="cursor-pointer">
                            {copy.nav.projects}
                        </a>
                    </div>
                </div>

                <div className="flex flex-row gap-4 text-white items-center">
                    <div className="flex items-center gap-2">
                        <span className="hidden md:inline text-[12px] text-gray-300">
                            {copy.nav.languageLabel}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={language === "id"}
                            aria-label={`${copy.nav.languageLabel}: ${language.toUpperCase()}`}
                            onClick={toggleLanguage}
                            className="relative inline-flex h-7 w-14 items-center rounded-full border border-[#7042f88b] bg-[#0300145e] transition"
                        >
                            <span className="absolute left-2 text-[10px] text-gray-300">
                                EN
                            </span>
                            <span className="absolute right-2 text-[10px] text-gray-300">
                                ID
                            </span>
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                    language === "id"
                                        ? "translate-x-8"
                                        : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                    <a
                        href="/admin"
                        className="inline-flex items-center rounded-full border border-[#7042f88b] bg-[#0300145e] px-3 py-1 text-xs font-semibold text-gray-200 transition hover:text-white md:text-sm"
                    >
                        Login
                    </a>
                    {Socials.map((social) => (
                        <a
                            href={social.link}
                            key={social.name}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image
                                src={social.src}
                                alt={social.name}
                                key={social.name}
                                width={24}
                                height={24}
								className="cursor-pointer hover:animate-spin"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
