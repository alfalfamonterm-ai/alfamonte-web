import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: "Alfa.Monte | Heno Premium para Mascotas",
  description: "Directo del campo a tu casa. El mejor heno de alfalfa para conejos, cobayas y chinchillas.",
  alternates: {
    canonical: 'https://alfamonte.cl'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Espacio para ID de conversión de Google Ads y píxel de seguimiento */}
        {/* <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}></script> */}
      </head>
      <body className={`${inter.variable} ${merriweather.variable}`}>
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
