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
} from "lucide-react";

interface AnswerDetail {
  question: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  options: { a: string; b: string; c: string; d: string };
  explanation: string;
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
  score_percentage: number;
  time_taken_seconds: number;
  answers: Record<string, AnswerDetail>;
  created_at: string;
}

interface ResultSummaryProps {
  result: StudentResult;
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Get Motivational Message
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

  // 2. Format Time Taken
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  // 3. Recharts Data
  const chartData = [
    { name: "إجابات صحيحة", value: result.correct_answers, color: "#2ec4b6" },
    { name: "إجابات خاطئة", value: result.wrong_answers, color: "#e63946" },
  ];

  // 4. Download PDF Certificate/Report
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
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

  // 5. Retake Exam
  const handleRetake = () => {
    // Clear details and push
    localStorage.removeItem(`answers_exam_${result.exam_id}`);
    localStorage.removeItem(`timer_left_exam_${result.exam_id}`);
    router.push(`/exams/${result.exam_code}`);
  };

  // 6. Share to WhatsApp
  const handleShareWhatsApp = () => {
    const text = `الحمد لله، حصلت على درجة ${result.correct_answers}/${result.total_questions} بنسبة مئوية ${Math.round(result.score_percentage)}% في امتحان "${result.exam_title}" مع الأستاذ أبو الفتيان فهمي. 🎓🔥`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Printable Area Wrapper */}
      <div ref={pdfRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        {/* Certificate style background borders */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-accent" />

        {/* Certificate Header (Only if score >= 90) */}
        {result.score_percentage >= 90 && (
          <div className="text-center mb-8 border-b border-slate-100 pb-8 relative">
            <div className="absolute top-4 right-4 text-accent/10 opacity-30">
              <Award className="w-24 h-24" />
            </div>
            <div className="inline-flex p-3 rounded-full bg-orange-50 text-accent mb-4">
              <Trophy className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-primary tracking-wide">شهادة تفوق وتقدير</h2>
            <p className="text-slate-500 font-bold mt-1 text-sm">تمنح منصة الأستاذ أبو الفتيان فهمي هذه الشهادة للطالب المتميز</p>
            <p className="text-2xl font-black text-accent-dark my-4 select-all">{result.student_name}</p>
            <p className="text-slate-600 font-bold max-w-md mx-auto text-sm leading-relaxed">
              لتفوقه ونجاحه الباهر في اجتياز امتحان التاريخ الوطني بنسبة نجاح بلغت {" "}
              <span className="text-accent text-lg font-black">{Math.round(result.score_percentage)}%</span>. متمنين له دوام التقدم والنجاح.
            </p>
          </div>
        )}

        {/* Score and Chart Summary Grid */}
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-1">الدرجة</span>
                <span className="text-lg font-black text-primary">
                  {result.correct_answers} / {result.total_questions}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-1">النسبة</span>
                <span className="text-lg font-black text-accent">
                  {Math.round(result.score_percentage)}%
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="block text-xs font-bold text-slate-400 mb-1">الوقت المستغرق</span>
                <span className="text-xs font-black text-primary leading-tight block mt-1.5">
                  {formatTime(result.time_taken_seconds)}
                </span>
              </div>
            </div>

            {/* Motivational message banner */}
            <div className={`p-4 rounded-2xl border text-sm font-extrabold flex items-center gap-2.5 ${motivation.color}`}>
              {result.score_percentage >= 75 ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{motivation.text}</span>
            </div>
          </div>

          {/* Recharts PieChart Display */}
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
                    <Tooltip
                      formatter={(value) => [`${value} سؤال`, ""]}
                      contentStyle={{ textAlign: "right", borderRadius: "12px" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-15px]">
                  <span className="text-3xl font-black text-primary">
                    {Math.round(result.score_percentage)}%
                  </span>
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

        {/* Detailed Review Section */}
        <div>
          <h3 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
            <span>مراجعة وتصحيح الأسئلة</span>
          </h3>

          <div className="space-y-6">
            {Object.entries(result.answers).map(([qId, ans], idx) => {
              const optionsMap: Record<string, string> = {
                a: "أ",
                b: "ب",
                c: "ج",
                d: "د",
              };

              return (
                <div
                  key={qId}
                  className={`border rounded-3xl p-6 sm:p-8 space-y-4 ${
                    ans.is_correct
                      ? "border-green-100 bg-green-50/20"
                      : "border-red-100 bg-red-50/10"
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm font-black text-slate-400 mt-1">
                        {idx + 1}-
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-primary leading-relaxed">
                        {ans.question}
                      </h4>
                    </div>

                    {ans.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-xl">
                        <CheckCircle className="w-4 h-4" />
                        <span>صحيحة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-xl">
                        <XCircle className="w-4 h-4" />
                        <span>خاطئة</span>
                      </span>
                    )}
                  </div>

                  {/* Options review list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                    {Object.entries(ans.options).map(([optKey, optText]) => {
                      const isStudentChoice = ans.student_answer === optKey;
                      const isCorrectChoice = ans.correct_answer === optKey;

                      let optStyle = "border-slate-100 bg-white text-slate-700";
                      if (isCorrectChoice) {
                        optStyle = "border-green-200 bg-green-100/50 text-green-800 font-extrabold";
                      } else if (isStudentChoice && !ans.is_correct) {
                        optStyle = "border-red-200 bg-red-100/50 text-red-800 font-extrabold";
                      }

                      return (
                        <div
                          key={optKey}
                          className={`border p-3.5 rounded-xl text-sm flex items-center gap-3 ${optStyle}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              isCorrectChoice
                                ? "bg-green-600 text-white"
                                : isStudentChoice && !ans.is_correct
                                ? "bg-red-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {optionsMap[optKey]}
                          </div>
                          <span>{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {ans.explanation && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-600 mt-2">
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

      {/* Control Buttons (Not Printable / Outside PDF Area) */}
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
