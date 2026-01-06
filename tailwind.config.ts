import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)"],
                merriweather: ["var(--font-merriweather)"],
            },
            colors: {
                primary: "#2D4A3E",
                "primary-light": "#3E6052",
                accent: "#8B5E3C",
                sand: "#F4F1EA",
            },
        },
    },
    plugins: [],
};
export default config;
