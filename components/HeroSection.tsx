import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Clock, Users, ArrowLeft, MessageCircle, BookOpenCheck, Calendar, Sparkles } from "lucide-react";

export default function HeroSection() {
  const features = [
    {
      icon: <Award className="h-8 w-8 text-accent" />,
      title: "خبرة في التدريس",
      description: "سنوات من العطاء وبناء عقول الطلاب المتميزة وتدريس منهج اللغة الفرنسية.",
    },
    {
      icon: <BookOpenCheck className="h-8 w-8 text-accent" />,
      title: "متابعة دورية واختبارات",
      description: "امتحانات تفاعلية مستمرة لتقييم الفهم وحصيلة المفردات والقواعد اللغوية.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-accent" />,
      title: "مراجعات أمام الامتحانات",
      description: "ملخصات مركزة وتدريبات مكثفة قبل ليلة الامتحان لضمان الدرجة النهائية.",
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: "شرح مبسط ومنظم",
      description: "شرح مبسط للقواعد وتطبيقات عملية للنطق والمحادثة بأسلوب ممتع وسهل الاستيعاب.",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Header Area */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-12 sm:py-32">
        {/* Background shapes & decorations */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-45 -left-40 w-96 h-96 bg-primary-light/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="text-center lg:text-right flex-1 w-full">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-accent font-bold text-sm mb-5 animate-pulse-slow">
                <Sparkles className="h-4 w-4" />
                <span>بسم الله الرحمن الرحيم</span>
              </div>

              {/* Teacher Name — split into two lines for clarity */}
              <h1 className="font-black tracking-tight leading-tight mb-0">
                <span className="block text-3xl sm:text-5xl lg:text-6xl text-white mb-1">المسيو /</span>
                <span className="block text-4xl sm:text-6xl lg:text-7xl text-accent">محمد فهمي سليم</span>
              </h1>

              {/* ===== Mobile-only Photo (between name and subtitle) ===== */}
              <div className="flex lg:hidden justify-center my-7">
                <div className="relative w-48 h-48">
                  {/* Outer decorative ring */}
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-accent via-accent/50 to-transparent animate-pulse-slow" />
                  {/* Photo frame */}
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-accent/60 shadow-2xl shadow-accent/20">
                    <Image
                      src="/teacher.png"
                      alt="المسيو محمد فهمي سليم - خبير اللغة الفرنسية"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10">
                    Excellence • متعة التعلم
                  </div>
                </div>
              </div>
              {/* ===== End Mobile Photo ===== */}

              {/* Subtitle */}
              <p className="text-xl sm:text-3xl font-extrabold text-slate-200 mb-6 mt-2 lg:mt-6">
                خبير اللغة الفرنسية للمرحلة الثانوية
              </p>

              <p className="max-w-2xl mx-auto lg:mx-0 text-slate-300 text-base sm:text-lg mb-10 leading-relaxed">
                مرحباً بكم في المنصة التفاعلية الرسمية. نقدم لكم تجربة تعليمية متميزة وفريدة
                تساعدكم على استيعاب منهج اللغة الفرنسية وحل الأسئلة والامتحانات بسهولة ويُسر.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/exams"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-accent/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <span>ابدأ الامتحانات التفاعلية</span>
                  <ArrowLeft className="h-5 w-5" />
                </Link>

                <a
                  href="https://wa.me/201027340063"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  <span>تواصل عبر واتساب</span>
                </a>
              </div>
            </div>

            {/* Desktop-only Teacher Photo (right column) */}
            <div className="hidden lg:flex flex-shrink-0 flex-col items-center gap-4">
              <div className="relative">
                {/* Outer decorative ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-accent/50 to-transparent p-1 animate-pulse-slow">
                  <div className="w-full h-full rounded-full bg-primary-dark/80" />
                </div>
                {/* Photo frame */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-accent/60 shadow-2xl shadow-accent/20">
                  <Image
                    src="/teacher.png"
                    alt="المسيو محمد فهمي سليم - خبير اللغة الفرنسية"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </div>
                {/* Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  Excellence • متعة التعلم
                </div>
              </div>
              {/* Name tag below photo */}
              <div className="mt-6 text-center">
                <p className="text-white font-black text-lg">المسيو محمد فهمي سليم</p>
                <p className="text-accent text-sm font-bold">مدرس اللغة الفرنسية</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards Section */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-primary mb-4">
              لماذا تختار منصة المسيو محمد فهمي سليم؟
            </h2>
            <p className="text-slate-600 font-medium">
              نقدم نظاماً تعليمياً شاملاً ومريحاً يساعدك على استثمار وقتك والوصول لأعلى درجات التفوق والتميز.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm card-hover flex flex-col items-center text-center group"
              >
                <div className="p-4 rounded-2xl bg-orange-50 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {feat.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-20 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark px-4 py-2 rounded-xl font-extrabold text-sm mb-6">
            <Calendar className="h-4 w-4" />
            <span>الحجز مفتوح للعام الجديد</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-6">
            ابدأ رحلة التميز معنا من الآن
          </h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            سيبدأ الحجز من شهر 7 بمشيئة الله تعالى لطلاب المرحلة الثانوية. احجز مقعدك الآن وتواصل مع المسيو مباشرة لمتابعة الخطة الدراسية وتدريبات المنهج.
          </p>

          <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl inline-flex flex-col sm:flex-row items-center gap-8 shadow-sm">
            <div className="text-right">
              <h4 className="text-sm font-bold text-slate-500 mb-1">أرقام الحجز والاستفسار</h4>
              <p className="text-2xl font-black text-primary tracking-wider">
                01027340063
              </p>
            </div>
            <div className="h-px w-full sm:h-12 sm:w-px bg-slate-200" />
            <a
              href="https://wa.me/201027340063"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <MessageCircle className="h-5 w-5" />
              <span>احجز مقعدك عبر واتساب</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
