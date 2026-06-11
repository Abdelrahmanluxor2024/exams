"use client";

import { CheckSquare, Square, Circle, HelpCircle } from "lucide-react";

// ===== أنواع البيانات =====

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_instruction?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d?: string;    // اختياري
  option_e?: string;    // اختياري
  options_count: number;      // 3 أو 4 أو 5
  correct_answers: string;    // 'a' أو 'b,e'
  answers_count: number;      // 1 أو 2
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | string[] | undefined;
  onSelectAnswer: (answer: string | string[]) => void;
}

export default function QuestionDisplay({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuestionDisplayProps) {
  // بناء قائمة الخيارات حسب options_count
  const allOptions = [
    { key: "a", label: "أ", text: question.option_a },
    { key: "b", label: "ب", text: question.option_b },
    { key: "c", label: "ج", text: question.option_c },
    ...(question.options_count >= 4 && question.option_d
      ? [{ key: "d", label: "د", text: question.option_d }]
      : []),
    ...(question.options_count === 5 && question.option_e
      ? [{ key: "e", label: "هـ", text: question.option_e }]
      : []),
  ];

  // [محدّث] منطق الاختيار: إجابة واحدة (radio) أو إجابتين (checkbox)
  const isMultiAnswer = question.answers_count === 2;

  const handleOptionClick = (key: string) => {
    if (!isMultiAnswer) {
      // إجابة واحدة: اختر مباشرة
      onSelectAnswer(key);
    } else {
      // إجابتين: تبديل الاختيار في المصفوفة
      const currentSelected = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      if (currentSelected.includes(key)) {
        // إلغاء الاختيار
        onSelectAnswer(currentSelected.filter((k) => k !== key));
      } else if (currentSelected.length < 2) {
        // إضافة اختيار (حد أقصى 2)
        onSelectAnswer([...currentSelected, key]);
      }
      // لو اختار أكثر من 2، لا يفعل شيء
    }
  };

  // التحقق إذا كان الخيار محدداً
  const isSelected = (key: string): boolean => {
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(key);
    }
    return selectedAnswer === key;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-fadeIn">
      {/* رأس السؤال */}
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-primary/5 text-primary p-3 rounded-2xl flex-shrink-0">
          <HelpCircle className="h-6 w-6 text-accent" />
        </div>
        <div className="space-y-1 flex-1">
          <span className="text-xs font-bold text-accent">
            السؤال رقم {question.question_number}
          </span>
          {/* [جديد] تعليمة السؤال إن وجدت */}
          {question.question_instruction && (
            <p className="text-sm font-bold text-slate-500 italic ltr text-left">
              {question.question_instruction}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary leading-relaxed ltr text-left">
            {question.question_text}
          </h2>
        </div>
      </div>

      {/* تنبيه للأسئلة ذات الإجابتين */}
      {isMultiAnswer && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <CheckSquare className="h-4 w-4 flex-shrink-0" />
          <span>هذا السؤال يتطلب اختيار <strong>إجابتين صحيحتين</strong></span>
          {Array.isArray(selectedAnswer) && selectedAnswer.length > 0 && (
            <span className="mr-auto bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
              {selectedAnswer.length}/2 مختار
            </span>
          )}
        </div>
      )}

      {/* قائمة الخيارات */}
      <div className="grid grid-cols-1 gap-3">
        {allOptions.map((opt) => {
          const selected = isSelected(opt.key);
          const isDisabled =
            isMultiAnswer &&
            !selected &&
            Array.isArray(selectedAnswer) &&
            selectedAnswer.length >= 2;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleOptionClick(opt.key)}
              disabled={isDisabled}
              className={`w-full text-left ltr p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group ${
                selected
                  ? "border-accent bg-orange-50/50 shadow-sm ring-1 ring-accent"
                  : isDisabled
                  ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                  : "border-slate-150 bg-white hover:border-primary-light hover:bg-slate-50/50"
              }`}
            >
              {/* أيقونة الاختيار: دائرة للإجابة الواحدة، مربع للإجابتين */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-${isMultiAnswer ? "lg" : "full"} flex items-center justify-center text-xs font-black transition-all ${
                  selected
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                {isMultiAnswer ? (
                  selected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )
                ) : (
                  opt.label
                )}
              </div>

              {/* نص الخيار */}
              <div className="flex-1">
                <span className="text-xs font-black text-slate-400 mr-1">({opt.label})</span>
                <span
                  className={`text-base sm:text-lg font-bold leading-relaxed ${
                    selected ? "text-primary font-black" : "text-slate-700"
                  }`}
                >
                  {opt.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
