import Link from "next/link";
import { GraduationCap, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Slogan and details */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="bg-accent text-white p-2.5 rounded-xl">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight">المسيو محمد فهمي سليم</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              خبير اللغة الفرنسية للمرحلة الثانوية. نسعى لبناء جيل من المتفوقين والرواد من خلال شرح مبسط، اختبارات تفاعلية، ومتابعة دقيقة لكل طالب.
            </p>
            <span className="inline-block text-accent font-extrabold text-lg">&quot;Excellence متعة التعلم&quot;</span>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-accent mb-6 relative pb-2 inline-block">
              روابط سريعة
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors duration-200 block">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/exams" className="text-slate-300 hover:text-white transition-colors duration-200 block">
                  الامتحانات التفاعلية
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-300 hover:text-white transition-colors duration-200 block">
                  لوحة المعلم
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-bold text-accent mb-6 relative pb-2 inline-block">
              تواصل معنا
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-accent rounded-full" />
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <div className="flex flex-col text-slate-300 text-sm">
                  <span>01027340063</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <a
                  href="https://wa.me/201027340063"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  راسلنا مباشرة على واتساب
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-slate-300 text-sm">جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <p className="text-slate-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} منصة المسيو محمد فهمي سليم. جميع الحقوق محفوظة.
          </p>
          <p className="text-slate-400 text-xs sm:text-sm">
            بنيت بكل حب لطلابنا الأعزاء ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
