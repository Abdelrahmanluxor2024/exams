"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, GraduationCap, Phone } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "الامتحانات", href: "/exams" },
    { name: "لوحة المعلم", href: "/admin" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse group">
              <div className="bg-primary text-white p-2.5 rounded-2xl shadow-md group-hover:bg-accent transition-colors duration-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                  أ. أبو الفتيان فهمي
                </span>
                <span className="text-xs font-medium text-accent -mt-1">
                  معاً نحو تفوقك
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-1 py-2 text-base font-semibold transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-primary hover:text-accent-dark"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fadeIn" />
                )}
              </Link>
            ))}
            
            <a
              href="https://wa.me/201050074058"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <Phone className="h-4 w-4" />
              <span>تواصل واتساب</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-primary hover:text-accent p-2 rounded-xl focus:outline-none transition-colors duration-300"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fadeIn" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white/95 border-t border-slate-100 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-slate-50 hover:text-accent"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 px-4">
              <a
                href="https://wa.me/201050074058"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-xl font-bold transition-all duration-300"
              >
                <Phone className="h-4 w-4" />
                <span>تواصل واتساب</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
