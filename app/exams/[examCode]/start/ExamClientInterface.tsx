"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import QuestionDisplay from "@/components/QuestionDisplay";
import ProgressBar from "@/components/ProgressBar";
import ExamTimer from "@/components/ExamTimer";
import {
  ChevronRight,
  ChevronLeft,
  Send,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface Exam {
  id: string;
  exam_code: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
}

interface ExamClientInterfaceProps {
  exam: Exam;
  questions: Question[];
}

export default function ExamClientInterface({ exam, questions }: ExamClientInterfaceProps) {
  const router = useRouter();
  const [studentName, setStudentName] = useState<string | null>(null);
  const [studentPhone, setStudentPhone] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // 1. Authenticate student details on mount
  useEffect(() => {
    const name = sessionStorage.getItem("student_name");
    const phone = sessionStorage.getItem("student_phone") || "";

    if (!name) {
      router.replace(`/exams/${exam.exam_code}`);
    } else {
      setStudentName(name);
      setStudentPhone(phone);
    }
  }, [exam.exam_code, router]);

  // 2. Load answers from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`answers_${exam.id}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Error parsing saved answers", e);
      }
    }
  }, [exam.id]);

  // 3. Save answers to localStorage on change
  const handleSelectAnswer = (answer: string) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(updatedAnswers);
    localStorage.setItem(`answers_${exam.id}`, JSON.stringify(updatedAnswers));
  };

  // 4. Handle exit warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "هل أنت متأكد من الخروج؟ قد يتم فقدان إجاباتك.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 5. Submit Exam Handler
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    // Calculate time taken
    let timeTaken = exam.duration_minutes * 60;
    const remainingTimeStr = localStorage.getItem(`timer_left_exam_${exam.id}`);
    if (remainingTimeStr) {
      const remainingSeconds = parseInt(remainingTimeStr, 10);
      timeTaken = (exam.duration_minutes * 60) - remainingSeconds;
    }

    try {
      const response = await fetch("/api/submit-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_name: studentName,
          student_phone: studentPhone,
          exam_id: exam.id,
          exam_code: exam.exam_code,
          exam_title: exam.title,
          answers,
          time_taken_seconds: timeTaken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear exam storage
        localStorage.removeItem(`answers_${exam.id}`);
        localStorage.removeItem(`timer_left_exam_${exam.id}`);

        // Save result object to sessionStorage to show instantly or fallback to DB
        sessionStorage.setItem(`result_${exam.id}`, JSON.stringify(result.result));

        // Redirect to results page
        router.push(`/exams/${exam.exam_code}/result?resultId=${result.result.id}`);
      } else {
        throw new Error(result.error || "خطأ غير معروف");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "فشل تسليم الامتحان. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  // 6. Navigation
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (!studentName) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-250px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="p-3 bg-primary/5 text-primary rounded-2xl flex-shrink-0">
              <ClipboardList className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-primary mb-1">{exam.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-bold">
                الطالب: <span className="text-primary">{studentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ExamTimer
              durationMinutes={exam.duration_minutes}
              onTimeUp={handleSubmitExam}
              storageKey={`exam_${exam.id}`}
            />
          </div>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar (Right side in RTL) */}
          <div className="lg:col-span-1 order-last lg:order-first">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-28">
              <h3 className="text-base font-extrabold text-primary mb-4 text-center">
                التنقل بين الأسئلة
              </h3>

              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = answers[q.id] !== undefined;

                  let btnStyle = "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200";
                  if (isCurrent) {
                    btnStyle = "bg-primary text-white ring-2 ring-primary-light border-transparent font-black";
                  } else if (isAnswered) {
                    btnStyle = "bg-[#2ec4b6] text-white border-transparent font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${btnStyle}`}
                      title={`السؤال ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-slate-150 pt-4 space-y-2.5 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-primary" />
                  <span>السؤال الحالي</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#2ec4b6]" />
                  <span>تمت الإجابة عليه</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
                  <span>لم يتم الإجابة عليه بعد</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Display & Controls (Left side in RTL) */}
          <div className="lg:col-span-3 space-y-6">
            <ProgressBar current={answeredCount} total={totalQuestions} />

            <QuestionDisplay
              question={currentQuestion}
              selectedAnswer={answers[currentQuestion.id]}
              onSelectAnswer={handleSelectAnswer}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-4 shadow-sm">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-primary hover:bg-slate-50 border border-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-5 w-5" />
                <span>السابق</span>
              </button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-2 bg-[#e05e16] hover:bg-accent-dark text-white px-7 py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-accent/20 transition-all"
                >
                  <Send className="h-4 w-4" />
                  <span>تسليم الامتحان</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-primary/10 transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-8 relative overflow-hidden">
            {/* Warning Icon Banner */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-orange-50 text-accent">
                <AlertTriangle className="h-10 w-10 animate-bounce" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-primary text-center mb-2">
              هل أنت متأكد من تسليم الإجابات؟
            </h3>
            <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
              لقد أجبت على <span className="text-accent font-black">{answeredCount}</span> سؤال من
              أصل <span className="text-primary font-black">{totalQuestions}</span>. يرجى مراجعة إجاباتك
              قبل التأكيد، فلن تتمكن من تعديل الإجابات بعد التسليم.
            </p>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold mb-6">
                {submitError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="w-full py-4 bg-accent hover:bg-accent-dark text-white rounded-2xl font-black text-base shadow-md hover:shadow-accent/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "جاري تسليم الإجابات..." : "نعم، تسليم وتصحيح الآن"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-extrabold text-sm transition-colors disabled:opacity-50"
              >
                إلغاء والعودة للامتحان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
