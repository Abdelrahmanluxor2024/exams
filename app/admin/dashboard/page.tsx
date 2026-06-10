"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  Download,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

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
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [exams, setExams] = useState<{ id: string; title: string; exam_code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [selectedExamCode, setSelectedExamCode] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Authenticate on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_authenticated");
    if (isAuth !== "true") {
      router.push("/admin");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Fetch data
  useEffect(() => {
    if (!authorized) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();

        // 1. Fetch student results
        const { data: resultsData, error: resultsError } = await supabase
          .from("student_results")
          .select("*")
          .order("created_at", { ascending: false });

        if (resultsError) throw resultsError;
        setResults(resultsData || []);

        // 2. Fetch exams list for filter
        const { data: examsData, error: examsError } = await supabase
          .from("exams")
          .select("id, title, exam_code");

        if (examsError) throw examsError;
        setExams(examsData || []);
      } catch (err: any) {
        console.error("Fetch dashboard error:", err);
        setError(err.message || "حدث خطأ أثناء تحميل البيانات من السيرفر.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorized]);

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    router.push("/admin");
  };

  // Delete a result
  const handleDeleteResult = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه النتيجة نهائياً؟")) return;

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("student_results")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Update state
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert("فشل حذف النتيجة: " + err.message);
    }
  };

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesSearch = r.student_name.toLowerCase().includes(searchName.toLowerCase());
    const matchesExam = selectedExamCode === "all" || r.exam_code === selectedExamCode;
    const matchesDate = !selectedDate || r.created_at.startsWith(selectedDate);
    return matchesSearch && matchesExam && matchesDate;
  });

  // Calculate statistics
  const totalStudents = filteredResults.length;
  const averageScore =
    totalStudents > 0
      ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.score_percentage, 0) / totalStudents)
      : 0;
  const passRate =
    totalStudents > 0
      ? Math.round(
          (filteredResults.filter((r) => r.score_percentage >= 50).length / totalStudents) * 100
        )
      : 0;
  const highestScore =
    totalStudents > 0
      ? Math.max(...filteredResults.map((r) => r.score_percentage))
      : 0;

  // Recharts BarChart data (Average Score by Exam)
  const examGroupMap: Record<string, { sum: number; count: number }> = {};
  filteredResults.forEach((r) => {
    if (!examGroupMap[r.exam_title]) {
      examGroupMap[r.exam_title] = { sum: 0, count: 0 };
    }
    examGroupMap[r.exam_title].sum += r.score_percentage;
    examGroupMap[r.exam_title].count += 1;
  });

  const chartData = Object.entries(examGroupMap).map(([title, val]) => ({
    name: title,
    النسبة: Math.round(val.sum / val.count),
    عدد_الطلاب: val.count,
  }));

  // Export to Excel handler
  const handleExportExcel = () => {
    if (filteredResults.length === 0) {
      alert("لا توجد بيانات لتصديرها.");
      return;
    }

    const wsData = filteredResults.map((r, idx) => ({
      "م": idx + 1,
      "اسم الطالب": r.student_name,
      "رقم الهاتف": r.student_phone || "غير مسجل",
      "الامتحان": r.exam_title,
      "كود الامتحان": r.exam_code,
      "عدد الأسئلة الصحيحة": r.correct_answers,
      "عدد الأسئلة الخاطئة": r.wrong_answers,
      "إجمالي الأسئلة": r.total_questions,
      "النسبة المئوية %": `${Math.round(r.score_percentage)}%`,
      "الوقت المستغرق (ثانية)": r.time_taken_seconds,
      "تاريخ الإرسال": new Date(r.created_at).toLocaleDateString("ar-EG") + " " + new Date(r.created_at).toLocaleTimeString("ar-EG"),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النتائج");

    // Auto-fit columns
    const maxKeys = Object.keys(wsData[0]);
    ws["!cols"] = maxKeys.map(() => ({ wch: 20 }));

    XLSX.writeFile(wb, `نتائج_الطلاب_منصة_ابو_الفتيان_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const formatTableTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}ث`;
    return `${mins}د ${remainingSecs}ث`;
  };

  if (!authorized) {
    return null;
  }

  return (
    <div className="py-10 bg-slate-50 min-h-[calc(100vh-250px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        {/* Header Block */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <h1 className="text-2xl sm:text-3.5xl font-black text-primary">لوحة إدارة المعلم</h1>
            <p className="text-slate-500 font-bold text-sm mt-1">
              متابعة درجات الطلاب، إحصائيات الامتحانات، وتصدير التقارير.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-3 rounded-2xl font-bold text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <p className="font-extrabold text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/5 text-primary rounded-2xl">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">إجمالي الطلاب</span>
              <span className="text-2xl font-black text-primary">{totalStudents}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/5 text-primary rounded-2xl">
              <Award className="h-7 w-7 text-accent" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">متوسط الدرجات</span>
              <span className="text-2xl font-black text-primary">{averageScore}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/5 text-primary rounded-2xl">
              <CheckCircle className="h-7 w-7 text-accent" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">نسبة النجاح (50%+)</span>
              <span className="text-2xl font-black text-primary">{passRate}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/5 text-primary rounded-2xl">
              <Trophy className="h-7 w-7 text-accent" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">أعلى نسبة مئوية</span>
              <span className="text-2xl font-black text-primary">{highestScore}%</span>
            </div>
          </div>
        </div>

        {/* Charts & Statistics Block */}
        {!loading && chartData.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-6">متوسط درجات الطلاب لكل امتحان</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: "bold" }} />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, "متوسط الدرجة"]} />
                  <Bar dataKey="النسبة" fill="#1a2754" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry: any, index: number) => (
                      <Bar key={`bar-${index}`} dataKey="النسبة" fill={entry.النسبة >= 50 ? "#1a2754" : "#e63946"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Data Table & Filters */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto flex-grow max-w-4xl">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="ابحث باسم الطالب..."
                  className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-accent bg-white"
                />
              </div>

              {/* Exam select */}
              <select
                value={selectedExamCode}
                onChange={(e) => setSelectedExamCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-accent bg-white"
              >
                <option value="all">كل الامتحانات</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.exam_code}>
                    {ex.title}
                  </option>
                ))}
              </select>

              {/* Date Input */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-accent bg-white text-right"
                />
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-[#2ec4b6] hover:bg-[#28ab9e] text-white px-5 py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-emerald-500/20 transition-all flex-shrink-0 w-full md:w-auto justify-center"
            >
              <FileSpreadsheet className="h-4.5 w-4.5" />
              <span>تصدير Excel</span>
            </button>
          </div>

          {/* Results Table */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
              <span className="text-slate-400 text-sm font-bold">جاري تحميل كشوف الدرجات...</span>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-extrabold text-xs border-b border-slate-150">
                    <th className="px-6 py-4">اسم الطالب</th>
                    <th className="px-6 py-4">رقم الهاتف</th>
                    <th className="px-6 py-4">اسم الامتحان</th>
                    <th className="px-6 py-4 text-center">الدرجة</th>
                    <th className="px-6 py-4 text-center">النسبة المئوية</th>
                    <th className="px-6 py-4 text-center">الوقت المستغرق</th>
                    <th className="px-6 py-4">تاريخ التقديم</th>
                    <th className="px-6 py-4 text-center">خيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-semibold">
                  {filteredResults.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 select-all text-primary font-bold">{row.student_name}</td>
                      <td className="px-6 py-4 text-xs font-mono">{row.student_phone || "-"}</td>
                      <td className="px-6 py-4 text-slate-500">{row.exam_title}</td>
                      <td className="px-6 py-4 text-center text-xs font-black">
                        {row.correct_answers} / {row.total_questions}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                            row.score_percentage >= 50
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {Math.round(row.score_percentage)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-mono">
                        {formatTableTime(row.time_taken_seconds)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(row.created_at).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        <a
                          href={`/exams/${row.exam_code}/result?resultId=${row.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-primary hover:bg-slate-100 rounded-xl transition-colors"
                          title="عرض التقرير الكامل"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteResult(row.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="حذف النتيجة"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center max-w-md mx-auto">
              <div className="p-4 bg-slate-50 rounded-full inline-block text-slate-400 mb-4">
                <Users className="h-10 w-10" />
              </div>
              <h4 className="text-base font-bold text-primary mb-1">لم يتم العثور على أي نتائج</h4>
              <p className="text-slate-400 text-xs">
                لا توجد درجات تطابق فلاتر البحث الحالية، أو لم يتم تقديم امتحانات بعد.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
