"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, CheckCircle, HelpCircle, ArrowLeft } from "lucide-react";

interface StudentNameFormProps {
  examCode: string;
  examTitle: string;
}

export default function StudentNameForm({ examCode, examTitle }: StudentNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setError("يرجى إدخال اسمك رباعياً على الأقل لضمان تسجيل النتيجة باسمك الصحيح.");
      return;
    }

    if (phone && !/^01[0125]\d{8}$/.test(phone.trim())) {
      setError("يرجى إدخال رقم هاتف مصري صحيح (مثال: 01050074058).");
      return;
    }

    setLoading(true);

    try {
      // Save details to sessionStorage
      sessionStorage.setItem("student_name", name.trim());
      sessionStorage.setItem("student_phone", phone.trim());

      // Redirect to exam start
      router.push(`/exams/${examCode}/start`);
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium animate-fadeIn">
          {error}
        </div>
      )}

      {/* Name Field */}
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
            className="w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          يجب إدخال 4 أسماء على الأقل ليتم إصدار شهادة النتيجة بشكل رسمي.
        </p>
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="student-phone" className="block text-sm font-extrabold text-primary mb-2">
          رقم الهاتف (اختياري)
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
            className="w-full pr-11 pl-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Start Button */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-dark text-white py-4 rounded-2xl font-black text-base shadow-md hover:shadow-accent/20 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <span>جاري التحضير...</span>
        ) : (
          <>
            <span>بدء الامتحان الآن</span>
            <ArrowLeft className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
