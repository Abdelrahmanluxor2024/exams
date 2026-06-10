"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ResultSummary from "@/components/ResultSummary";
import { AlertCircle, ArrowRight, ClipboardList } from "lucide-react";
import Link from "next/link";

function ResultPageContent({ examCode }: { examCode: string }) {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError("لم يتم العثور على معرّف النتيجة المحددة. يرجى مراجعة المعلم أو التأكد من إكمال الامتحان.");
        setLoading(false);
        return;
      }

      // 1. Try to read from sessionStorage first
      let cachedResult = null;
      try {
        const sessionKeys = Object.keys(sessionStorage);
        for (const key of sessionKeys) {
          if (key.startsWith("result_")) {
            const cached = sessionStorage.getItem(key);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed.id === resultId) {
                cachedResult = parsed;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.error("Session storage parse failed", e);
      }

      if (cachedResult) {
        setResult(cachedResult);
        setLoading(false);
        return;
      }

      // 2. Fetch from Supabase
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("student_results")
          .select("*")
          .eq("id", resultId)
          .single();

        if (fetchError || !data) {
          throw new Error(fetchError?.message || "لم نتمكن من العثور على النتيجة المحددة في قاعدة البيانات.");
        }

        setResult(data);
      } catch (err: any) {
        setError(err.message || "حدث خطأ غير متوقع أثناء تحميل النتيجة.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="text-slate-500 font-bold text-sm">جاري حساب درجاتك ومراجعة إجاباتك...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center gap-3 mb-6 justify-center">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <p className="font-extrabold text-sm">{error}</p>
        </div>
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة لقائمة الامتحانات</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-250px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ResultSummary result={result} />
      </div>
    </div>
  );
}

interface ResultPageProps {
  params: {
    examCode: string;
  };
}

export default function ResultPage({ params }: ResultPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <p className="text-slate-500 font-bold text-sm">جاري تحميل صفحة النتيجة...</p>
        </div>
      }
    >
      <ResultPageContent examCode={params.examCode} />
    </Suspense>
  );
}
