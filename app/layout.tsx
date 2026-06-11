import type { Metadata } from "next";
declare module "*.css";
import { Cairo } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة المسيو محمد فهمي سليم | خبير اللغة الفرنسية",
  description:
    "المنصة التعليمية الرسمية للمسيو محمد فهمي سليم لتدريس مادة اللغة الفرنسية للمرحلة الثانوية. اختبارات دورية تفاعلية، مراجعات شاملة، وتقارير أداء فورية لضمان تفوقك.",
  keywords: [
    "محمد فهمي سليم",
    "المسيو محمد فهمي سليم",
    "اللغة الفرنسية للمرحلة الثانوية",
    "فرنساوي ثانوية عامة",
    "منصة لغة فرنسية",
    "مدرس فرنساوي",
  ],
  authors: [{ name: "محمد فهمي سليم" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="font-cairo bg-customBg text-primary min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
