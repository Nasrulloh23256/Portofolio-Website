import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StarsCanvas from "@/components/main/StarBackground";
import Navbar from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import { LanguageProvider } from "@/components/main/LanguageProvider";
import { ContentProvider } from "@/components/main/ContentProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Portfolio",
    description: "My portfolio",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} bg-[#030014] overflow-y-scroll overflow-x-hidden max-w-[1855px] mx-auto`}
            >
                <LanguageProvider>
                    <ContentProvider>
                        <StarsCanvas />
                        <Navbar />
                        {children}
                        {/* <Footer /> */}
                    </ContentProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
