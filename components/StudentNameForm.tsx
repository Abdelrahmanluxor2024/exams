"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, ArrowLeft, Lock, AlertCircle } from "lucide-react";

interface StudentNameFormProps {
  examCode: string;
  examTitle: string;
  examPassword: string; // [جديد] كلمة المرور الخاصة بالامتحان
}

export default function StudentNameForm({
  examCode,
  examTitle,
  examPassword,
}: StudentNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [enteredPassword, setEnteredPassword] = useState(""); // [جديد] كود الامتحان المدخل
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakePassword, setShakePassword] = useState(false); // [جديد] تأثير اهتزاز عند خطأ الكود

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // التحقق من الاسم الرباعي
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setError("يرجى إدخال اسمك رباعياً على الأقل لضمان تسجيل النتيجة باسمك الصحيح.");
      return;
    }

    // التحقق من رقم الهاتف (اختياري)
    if (phone && !/^01[0125]\d{8}$/.test(phone.trim())) {
      setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01050074058).");
      return;
    }

    // [جديد] التحقق من كود الامتحان
    if (enteredPassword.trim().toLowerCase() !== examPassword.trim().toLowerCase()) {
      setError("كود الامتحان غير صحيح. يرجى مراجعة المعلم للحصول على الكود الصحيح.");
      // تأثير اهتزاز على حقل الكود
      setShakePassword(true);
      setTimeout(() => setShakePassword(false), 600);
      return;
    }

    setLoading(true);

    try {
      sessionStorage.setItem("student_name", name.trim());
      sessionStorage.setItem("student_phone", phone.trim());
      router.push(`/exams/${examCode}/start`);
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium animate-fadeIn flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* حقل الاسم */}
      <div>
        <label htmlFor="student-name" className="block text-sm font-extrabold text-primary mb-2">
          الاسم الرباعي للطالب <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <input
            id="student-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أحمد محمد علي حسن"
            className="w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50 transition-all"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          يجب إدخال 4 أسماء على الأقل ليتم إصدار شهادة النتيجة بشكل رسمي.
        </p>
      </div>

      {/* حقل رقم الهاتف */}
      <div>
        <label htmlFor="student-phone" className="block text-sm font-extrabold text-primary mb-2">
          رقم الهاتف <span className="text-slate-400 font-medium text-xs">(اختياري)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <Phone className="h-5 w-5" />
          </div>
          <input
            id="student-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="مثال: 01050074058"
            className="w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50 transition-all"
          />
        </div>
      </div>

      {/* [جديد] حقل كود الامتحان */}
      <div>
        <label htmlFor="exam-password" className="block text-sm font-extrabold text-primary mb-2">
          كود الامتحان <span className="text-red-500">*</span>
        </label>
        <div className={`relative transition-all ${shakePassword ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-5 w-5" />
          </div>
          <input
            id="exam-password"
            type="text"
            required
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
            placeholder="أدخل الكود الذي حصلت عليه من المعلم"
            className={`w-full pr-11 pl-4 py-3.5 border rounded-2xl focus:outline-none focus:ring-1 text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50 transition-all ${
              shakePassword
                ? "border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:border-accent focus:ring-accent"
            }`}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          احصل على الكود من مدرسك قبل بدء الامتحان.
        </p>
      </div>

      {/* زر البدء */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-dark text-white py-4 rounded-2xl font-black text-base shadow-md hover:shadow-accent/20 transition-all duration-300 disabled:opacity-50 mt-2"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>جاري التحقق...</span>
          </>
        ) : (
          <>
            <span>بدء الامتحان الآن</span>
            <ArrowLeft className="h-5 w-5" />
          </>
        )}
      </button>

      {/* تنبيه keyframes للـ shake - يضاف في globals.css لو مش موجود */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </form>
  );
}
