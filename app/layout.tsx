import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الأستاذ أبو الفتيان فهمي | التاريخ الوطني للصف الثاني الثانوي",
  description:
    "المنصة التعليمية الرسمية للأستاذ أبو الفتيان فهمي لتدريس مادة التاريخ الوطني للصف الثاني الثانوي. اختبارات دورية تفاعلية، مراجعات شاملة، وتقارير أداء فورية لضمان تفوقك.",
  keywords: [
    "أبو الفتيان فهمي",
    "تاريخ الصف الثاني الثانوي",
    "التاريخ الوطني",
    "امتحانات تاريخ ثانوية عامة",
    "منصة تاريخ",
    "مدرس تاريخ",
  ],
  authors: [{ name: "أبو الفتيان فهمي" }],
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
