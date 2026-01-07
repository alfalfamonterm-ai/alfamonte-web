import type { Config } from "tailwindcss";

const config: Config = {
<<<<<<< HEAD
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D4A3E",
        secondary: "#8B5E3C",
        accent: "#E8F5E9",
      },
      fontFamily: {
        merriweather: ["var(--font-merriweather)"],
        inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
=======
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
>>>>>>> 4af7fc6 (Fix: Aplicado downgrade de Next.js y React a versiones estables)
};
export default config;
