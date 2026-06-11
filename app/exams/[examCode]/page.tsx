import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import StudentNameForm from "@/components/StudentNameForm";
import { Clock, HelpCircle, AlertCircle, ClipboardList, ShieldAlert } from "lucide-react";

interface ExamPageProps {
  params: {
    examCode: string;
  };
}

export const dynamic = "force-dynamic";

export default async function ExamEntryPage({ params }: ExamPageProps) {
  const { examCode } = params;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch exam info
  const { data: exam, error } = await supabase
    .from("exams")
    .select("*")
    .eq("exam_code", examCode)
    .single();

  if (error || !exam) {
    return notFound();
  }

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-250px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 animate-fadeIn relative overflow-hidden">
          {/* Accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-accent" />

          {/* Heading */}
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-accent mb-4">
              <ClipboardList className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-black text-primary mb-3">
              {exam.title}
            </h1>
            <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm sm:text-base">
              {exam.description || "استعد لبدء الامتحان. يرجى قراءة التعليمات بعناية قبل البدء."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Info Cards */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                <span className="block text-xs text-slate-400 font-bold mb-0.5">مدة الامتحان</span>
                <span className="text-lg font-black text-primary">{exam.duration_minutes} دقيقة</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                <HelpCircle className="h-6 w-6 text-accent mx-auto mb-2" />
                <span className="block text-xs text-slate-400 font-bold mb-0.5">عدد الأسئلة</span>
                <span className="text-lg font-black text-primary">{exam.total_questions} سؤال</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-extrabold text-primary mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-accent" />
                <span>تعليمات هامة قبل بدء الامتحان:</span>
              </h3>
              <ul className="space-y-3 text-slate-600 text-sm font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    ١
                  </span>
                  <span>تأكد من كتابة اسمك الرباعي بشكل دقيق ومطابق لبطاقة التعريف الخاصة بك.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    ٢
                  </span>
                  <span>بمجرد الضغط على زر البدء، سيبدأ المؤقت التنازلي ولن يتمكن من إيقافه.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    ٣
                  </span>
                  <span>عند انتهاء الوقت المحدد، سيتم تسليم إجاباتك تلقائياً وبشكل فوري لحفظ درجاتك.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    ٤
                  </span>
                  <span>لا تغلق أو تحدث المتصفح أثناء تشغيل الامتحان، حتى لا تفقد إجاباتك السابقة.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 max-w-lg mx-auto">
            <h3 className="text-center text-lg font-extrabold text-primary mb-6">
              سجل بياناتك للبدء بالامتحان
            </h3>
            <StudentNameForm examCode={exam.exam_code} examTitle={exam.title} examPassword={exam.exam_password || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
