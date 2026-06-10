import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ExamClientInterface from "./ExamClientInterface";

interface StartPageProps {
  params: {
    examCode: string;
  };
}

export const dynamic = "force-dynamic";

export default async function StartExamPage({ params }: StartPageProps) {
  const { examCode } = params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch the exam
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("*")
    .eq("exam_code", examCode)
    .single();

  if (examError || !exam) {
    return notFound();
  }

  // Fetch questions for this exam
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_id", exam.id)
    .order("question_number", { ascending: true });

  if (questionsError || !questions || questions.length === 0) {
    return (
      <div className="py-20 text-center bg-slate-50 min-h-[calc(100vh-250px)] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-primary mb-2">لا توجد أسئلة متوفرة لهذا الامتحان حالياً.</h2>
        <p className="text-slate-500 text-sm">يرجى مراجعة المعلم أو العودة لاحقاً.</p>
      </div>
    );
  }

  return <ExamClientInterface exam={exam} questions={questions} />;
}
