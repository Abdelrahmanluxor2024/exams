import Link from "next/link";
import { Clock, HelpCircle, ArrowLeft, Calendar, FileText } from "lucide-react";

interface ExamCardProps {
  exam: {
    id: string;
    exam_code: string;
    title: string;
    description: string;
    duration_minutes: number;
    total_questions: number;
    created_at?: string;
  };
}

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm card-hover flex flex-col justify-between p-8 relative overflow-hidden group">
      {/* Accent border top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-accent" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1 bg-slate-50 text-primary-light px-3 py-1 rounded-xl text-xs font-bold border border-slate-100">
            <FileText className="h-3.5 w-3.5" />
            <span>كود: {exam.exam_code}</span>
          </div>
          {exam.created_at && (
            <span className="text-xs text-slate-400 font-medium">
              {new Date(exam.created_at).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <h3 className="text-xl font-extrabold text-primary mb-3 group-hover:text-accent transition-colors duration-250">
          {exam.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
          {exam.description || "لا يوجد وصف متوفر لهذا الامتحان."}
        </p>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between text-slate-500 text-xs sm:text-sm font-bold mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span>{exam.duration_minutes} دقيقة</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-accent" />
            <span>{exam.total_questions} سؤال</span>
          </div>
        </div>

        <Link
          href={`/exams/${exam.exam_code}`}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-light text-white py-3.5 rounded-2xl font-black text-sm shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span>ابدأ الامتحان</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
