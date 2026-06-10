"use client";

import { HelpCircle } from "lucide-react";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | undefined;
  onSelectAnswer: (answer: string) => void;
}

export default function QuestionDisplay({
  question,
  selectedAnswer,
  onSelectAnswer,
}: QuestionDisplayProps) {
  const options = [
    { key: "a", label: "أ", text: question.option_a },
    { key: "b", label: "ب", text: question.option_b },
    { key: "c", label: "ج", text: question.option_c },
    { key: "d", label: "د", text: question.option_d },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 animate-fadeIn">
      {/* Question Number and Title */}
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-primary/5 text-primary p-3 rounded-2xl flex-shrink-0">
          <HelpCircle className="h-6 w-6 text-accent" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-accent">السؤال رقم {question.question_number}</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary leading-relaxed">
            {question.question_text}
          </h2>
        </div>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-4">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.key;

          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelectAnswer(opt.key)}
              className={`w-full text-right p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 group ${
                isSelected
                  ? "border-accent bg-orange-50/50 shadow-sm ring-1 ring-accent"
                  : "border-slate-150 bg-white hover:border-primary-light hover:bg-slate-50/50"
              }`}
            >
              {/* Option Radio Circle/Indicator */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
              >
                {opt.label}
              </div>

              {/* Option Text */}
              <span
                className={`text-base sm:text-lg font-bold leading-relaxed ${
                  isSelected ? "text-primary font-black" : "text-slate-700"
                }`}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
