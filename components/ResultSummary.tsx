"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RotateCcw,
  Home,
  MessageCircle,
  AlertCircle,
  Award,
  MinusCircle,
} from "lucide-react";

// ===== أنواع البيانات =====

interface AnswerDetail {
  question_number?: number;
  question: string;
  // [محدّث] يمكن أن يكون string أو string[] (للإجابتين) أو null (غير مجاب)
  student_answer: string | string[] | null;
  // [محدّث] يمكن أن يكون 'a' أو 'a,c' للإجابتين
  correct_answer: string;
  is_correct: boolean;
  is_unanswered?: boolean;
  // [محدّث] يدعم 5 خيارات
  options: Record<string, string>;
  explanation?: string | null;
}

interface StudentResult {
  id: string;
  student_name: string;
  student_phone?: string;
  exam_id: string;
  exam_code: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered?: number;
  score_percentage: number;
  time_taken_seconds: number;
  answers: Record<string, AnswerDetail>;
  created_at: string;
}

interface ResultSummaryProps {
  result: StudentResult;
}

// ===== ترجمة حروف الخيارات =====
const OPTION_LABELS: Record<string, string> = {
  a: "أ",
  b: "ب",
  c: "ج",
  d: "د",
  e: "هـ",
};

export default function ResultSummary({ result }: ResultSummaryProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================================================
  // [مُصلَح] ترتيب الأسئلة حسب question_number
  // =====================================================
  const sortedAnswers = Object.entries(result.answers).sort(([, a], [, b]) => {
    const numA = a.question_number ?? 999;
    const numB = b.question_number ?? 999;
    return numA - numB;
  });

  // =====================================================
  // [مُصلَح] التحقق من الاختيار - يدعم الإجابتين والقيم المفصولة بفاصلة
  // =====================================================
  const isStudentChoice = (ans: AnswerDetail, optKey: string): boolean => {
    if (!ans.student_answer) return false;
    if (Array.isArray(ans.student_answer)) {
      return ans.student_answer.includes(optKey);
    }
    // قد يكون محفوظاً كـ 'a,c' أو 'a'
    return ans.student_answer.split(",").map((s) => s.trim()).includes(optKey);
  };

  const isCorrectChoice = (ans: AnswerDetail, optKey: string): boolean => {
    if (!ans.correct_answer) return false;
    // correct_answer يمكن أن يكون 'a' أو 'a,c'
    return ans.correct_answer.split(",").map((s) => s.trim()).includes(optKey);
  };

  // الرسالة التحفيزية
  const getMotivation = (percentage: number) => {
    if (percentage >= 90) {
      return { text: "🏆 ممتاز جداً! تفوق باهر يستحق التقدير.", color: "text-green-600 bg-green-50 border-green-200" };
    } else if (percentage >= 75) {
      return { text: "🌟 أداء رائع! أنت على الطريق الصحيح نحو القمة.", color: "text-blue-600 bg-blue-50 border-blue-200" };
    } else if (percentage >= 50) {
      return { text: "👍 جيد. عمل جيد ولكن يمكنك تحقيق الأفضل بالتدريب أكثر.", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
    } else {
      return { text: "💪 لا تيأس! الفشل خطوة أولى نحو النجاح، راجع أخطائك وحاول مجدداً.", color: "text-red-600 bg-red-50 border-red-200" };
    }
  };

  const motivation = getMotivation(result.score_percentage);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  const unansweredCount = result.unanswered ?? 0;

  const chartData = [
    { name: "إجابات صحيحة", value: result.correct_answers, color: "#2ec4b6" },
    { name: "إجابات خاطئة", value: result.wrong_answers - unansweredCount, color: "#e63946" },
    ...(unansweredCount > 0 ? [{ name: "غير مجاب", value: unansweredCount, color: "#94a3b8" }] : []),
  ].filter((d) => d.value > 0);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`نتيجة_${result.student_name}_${result.exam_title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleRetake = () => {
    localStorage.removeItem(`answers_${result.exam_id}`);
    localStorage.removeItem(`timer_left_exam_${result.exam_id}`);
    router.push(`/exams/${result.exam_code}`);
  };

  const handleShareWhatsApp = () => {
    const text = `الحمد لله، حصلت على درجة ${result.correct_answers}/${result.total_questions} بنسبة مئوية ${Math.round(result.score_percentage)}% في امتحان "${result.exam_title}" مع المسيو محمد فهمي سليم. 🎓🔥`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* منطقة الطباعة */}
      <div ref={pdfRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-accent" />

        {/* شهادة التفوق */}
        {result.score_percentage >= 90 && (
          <div className="text-center mb-8 border-b border-slate-100 pb-8 relative">
            <div className="absolute top-4 right-4 text-accent/10 opacity-30">
              <Award className="w-24 h-24" />
            </div>
            <div className="inline-flex p-3 rounded-full bg-orange-50 text-accent mb-4">
              <Trophy className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-primary tracking-wide">شهادة تفوق وتقدير</h2>
            <p className="text-slate-500 font-bold mt-1 text-sm">تمنح منصة المسيو محمد فهمي سليم هذه الشهادة للطالب المتميز</p>
            <p className="text-2xl font-black text-accent-dark my-4 select-all">{result.student_name}</p>
            <p className="text-slate-600 font-bold max-w-md mx-auto text-sm leading-relaxed">
              لتفوقه ونجاحه الباهر في اجتياز امتحان اللغة الفرنسية بنسبة نجاح بلغت{" "}
              <span className="text-accent text-lg font-black">{Math.round(result.score_percentage)}%</span>. متمنين له دوام التقدم والنجاح.
            </p>
          </div>
        )}

        {/* الإحصائيات والرسم البياني */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-100 pb-8 mb-8">
          <div className="text-right space-y-4">
            {result.score_percentage < 90 && (
              <>
                <span className="text-xs font-bold text-accent uppercase tracking-wider block">نتيجة الطالب</span>
                <h2 className="text-2xl font-black text-primary select-all">{result.student_name}</h2>
              </>
            )}
            <div>
              <p className="text-slate-500 font-bold text-sm">اسم الامتحان</p>
              <p className="text-lg font-black text-primary-light">{result.exam_title}</p>
            </div>

            {/* بطاقات الإحصاء - [محدّث] تشمل الغير مجابة */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-1">الدرجة</span>
                <span className="text-lg font-black text-primary">
                  {result.correct_answers} / {result.total_questions}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-1">النسبة</span>
                <span className="text-lg font-black text-accent">{Math.round(result.score_percentage)}%</span>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
                <span className="block text-xs font-bold text-green-500 mb-1">صحيح</span>
                <span className="text-lg font-black text-green-700">{result.correct_answers}</span>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
                <span className="block text-xs font-bold text-red-400 mb-1">خطأ</span>
                <span className="text-lg font-black text-red-600">{result.wrong_answers}</span>
              </div>
            </div>

            {/* الوقت */}
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
              <Clock className="h-4 w-4 text-accent" />
              <span>الوقت المستغرق: {formatTime(result.time_taken_seconds)}</span>
            </div>

            {/* رسالة تحفيزية */}
            <div className={`p-4 rounded-2xl border text-sm font-extrabold flex items-center gap-2.5 ${motivation.color}`}>
              {result.score_percentage >= 75 ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{motivation.text}</span>
            </div>
          </div>

          {/* الرسم الدائري */}
          <div className="flex flex-col items-center justify-center">
            {mounted ? (
              <div className="w-full h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} سؤال`, ""]} contentStyle={{ textAlign: "right", borderRadius: "12px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-15px]">
                  <span className="text-3xl font-black text-primary">{Math.round(result.score_percentage)}%</span>
                  <span className="text-xs font-bold text-slate-400">النتيجة النهائية</span>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 rounded-full border-4 border-slate-100 animate-pulse flex items-center justify-center">
                <span className="text-slate-400 text-sm font-bold">جاري تحميل الرسم البياني...</span>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            [مُصلَح] مراجعة الأسئلة - مرتبة + دعم الإجابتين + 5 خيارات
            ===================================================== */}
        <div>
          <h3 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
            <span>مراجعة وتصحيح الأسئلة</span>
            <span className="text-sm font-bold text-slate-400 mr-auto">مرتبة حسب رقم السؤال</span>
          </h3>

          <div className="space-y-5">
            {sortedAnswers.map(([qId, ans], idx) => {
              const isUnanswered = ans.is_unanswered || !ans.student_answer ||
                (Array.isArray(ans.student_answer) && ans.student_answer.length === 0);

              // هل السؤال يتطلب إجابتين؟
              const correctParts = ans.correct_answer?.split(",").map((s) => s.trim()) || [];
              const isDualAnswer = correctParts.length === 2;

              // الإجابة الصحيحة بالحروف العربية
              const correctLabel = correctParts.map((k) => OPTION_LABELS[k] || k).join(" + ");

              // إجابة الطالب بالحروف العربية
              let studentLabel = "-";
              if (!isUnanswered && ans.student_answer) {
                const studentParts = Array.isArray(ans.student_answer)
                  ? ans.student_answer
                  : String(ans.student_answer).split(",").map((s) => s.trim());
                studentLabel = studentParts.map((k) => OPTION_LABELS[k] || k).join(" + ");
              }

              return (
                <div
                  key={qId}
                  className={`border rounded-3xl p-5 sm:p-7 space-y-4 ${
                    ans.is_correct
                      ? "border-green-100 bg-green-50/20"
                      : isUnanswered
                      ? "border-slate-200 bg-slate-50/30"
                      : "border-red-100 bg-red-50/10"
                  }`}
                >
                  {/* رأس السؤال */}
                  <div className="flex items-start gap-3 justify-between flex-wrap gap-y-2">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="text-sm font-black text-slate-400 mt-1 flex-shrink-0">
                        {ans.question_number ?? idx + 1}.
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-primary leading-relaxed ltr text-left">
                        {ans.question}
                      </h4>
                    </div>

                    {/* شارة الحالة */}
                    {ans.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                        <CheckCircle className="w-4 h-4" />
                        <span>صحيحة ✓</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-200 px-3 py-1.5 rounded-xl flex-shrink-0">
                        <MinusCircle className="w-4 h-4" />
                        <span>لم يُجب</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-xl flex-shrink-0">
                        <XCircle className="w-4 h-4" />
                        <span>خاطئة ✗</span>
                      </span>
                    )}
                  </div>

                  {/* تنبيه إجابتين */}
                  {isDualAnswer && (
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl inline-block">
                      ⚡ هذا السؤال يتطلب إجابتين صحيحتين
                    </div>
                  )}

                  {/* الخيارات */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-4">
                    {Object.entries(ans.options).map(([optKey, optText]) => {
                      const isStudentPick = isStudentChoice(ans, optKey);
                      const isCorrectPick = isCorrectChoice(ans, optKey);

                      // تحديد لون الخيار
                      let optStyle = "border-slate-100 bg-white text-slate-700";
                      let circleStyle = "bg-slate-100 text-slate-500";
                      let icon = null;

                      if (isCorrectPick) {
                        // الإجابة الصحيحة دائماً خضراء
                        optStyle = "border-green-300 bg-green-100/60 text-green-800 font-extrabold";
                        circleStyle = "bg-green-600 text-white";
                        icon = <CheckCircle className="w-3.5 h-3.5" />;
                      } else if (isStudentPick && !ans.is_correct) {
                        // اختيار الطالب الخاطئ
                        optStyle = "border-red-200 bg-red-100/50 text-red-800 font-extrabold";
                        circleStyle = "bg-red-500 text-white";
                        icon = <XCircle className="w-3.5 h-3.5" />;
                      } else if (isStudentPick && ans.is_correct) {
                        // اختيار الطالب الصحيح (عند الإجابتين)
                        optStyle = "border-green-300 bg-green-100/60 text-green-800 font-extrabold";
                        circleStyle = "bg-green-600 text-white";
                        icon = <CheckCircle className="w-3.5 h-3.5" />;
                      }

                      return (
                        <div
                          key={optKey}
                          className={`border p-3.5 rounded-xl text-sm flex items-center gap-3 ltr ${optStyle}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${circleStyle}`}>
                            {icon || OPTION_LABELS[optKey]}
                          </div>
                          <span className="flex-1 text-left">{optText as string}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ملخص الإجابة */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-1 border-t border-slate-100">
                    <span className="text-slate-500">
                      الإجابة الصحيحة:{" "}
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">({correctLabel})</span>
                    </span>
                    {!isUnanswered && (
                      <span className="text-slate-500">
                        إجابتك:{" "}
                        <span className={`px-2 py-0.5 rounded-lg ${ans.is_correct ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
                          ({studentLabel})
                        </span>
                      </span>
                    )}
                    {isUnanswered && (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        لم تختر إجابة - تُحتسب خطأ
                      </span>
                    )}
                  </div>

                  {/* الشرح */}
                  {ans.explanation && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-600">
                      <strong className="text-accent block mb-1">الشرح والتوضيح:</strong>
                      {ans.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex flex-wrap items-center justify-center gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-md hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{isGeneratingPdf ? "جاري تصدير النتيجة..." : "تحميل الشهادة / PDF"}</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-md transition-all duration-300"
        >
          <MessageCircle className="h-4 w-4" />
          <span>مشاركة النتيجة واتساب</span>
        </button>

        <button
          onClick={handleRetake}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>إعادة الامتحان</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
