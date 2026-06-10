import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ExamCard from "@/components/ExamCard";
import { BookOpenCheck, AlertCircle } from "lucide-react";

// Force dynamic rendering to ensure exams are always up to date
export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch only active exams
  const { data: exams, error } = await supabase
    .from("exams")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-250px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeIn">
          <div className="inline-flex p-3 rounded-3xl bg-primary/5 text-primary mb-4">
            <BookOpenCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4.5xl font-black text-primary mb-4">
            الامتحانات التفاعلية مادة التاريخ
          </h1>
          <p className="text-slate-600 font-medium">
            اختر الامتحان المناسب وابدأ التقييم فوراً لمراجعة معلوماتك ومستوى استيعابك للمنهج الوطني للصف الثاني الثانوي.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto mb-10">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div className="text-right">
              <p className="font-bold">حدث خطأ أثناء تحميل الامتحانات</p>
              <p className="text-sm opacity-90">{error.message}</p>
            </div>
          </div>
        )}

        {/* Exams Grid */}
        {!error && exams && exams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          !error && (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
              <div className="p-4 rounded-full bg-slate-50 inline-block mb-4 text-slate-400">
                <BookOpenCheck className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">لا يوجد امتحانات حالياً</h3>
              <p className="text-slate-500 text-sm">
                تابع هذه الصفحة باستمرار، حيث يقوم الأستاذ أبو الفتيان بإضافة امتحانات واختبارات دورية جديدة.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
