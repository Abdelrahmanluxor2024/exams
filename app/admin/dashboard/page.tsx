"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  Award,
  BookOpen,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Eye,
  X,
  Copy,
  BarChart2,
  FileText,
  Activity,
  ClipboardList,
  Phone,
  User,
  Calendar,
  Clock,
  GraduationCap,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnswerDetail {
  question_number?: number;
  question?: string;        // stored by API as q.question_text
  question_text?: string;
  student_answer?: string | string[] | null;
  correct_answer?: string | string[];
  correct_answers?: string | string[];
  is_correct?: boolean;
  is_unanswered?: boolean;
  options?: Record<string, string>;
  explanation?: string | null;
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
  created_at: string;
  submitted_at?: string;
  answers?: AnswerDetail[];
}

interface Exam {
  id: string;
  title: string;
  exam_code: string;
  exam_password: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
}

type ActiveTab = "results" | "exams" | "charts";

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  if (mins === 0) return `${remainingSecs} ثانية`;
  if (remainingSecs === 0) return `${mins} دقيقة`;
  return `${mins}د ${remainingSecs}ث`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function exportToCSV(results: StudentResult[]) {
  if (results.length === 0) {
    alert("لا توجد بيانات لتصديرها.");
    return;
  }

  const headers = [
    "#",
    "اسم الطالب",
    "رقم الهاتف",
    "الامتحان",
    "الدرجة",
    "النسبة %",
    "الوقت (ثانية)",
    "التاريخ",
  ];

  const rows = results.map((r, i) => [
    i + 1,
    r.student_name,
    r.student_phone || "-",
    r.exam_title,
    `${r.correct_answers}/${r.total_questions}`,
    `${Math.round(r.score_percentage)}%`,
    r.time_taken_seconds,
    formatDate(r.created_at || r.submitted_at || ""),
  ]);

  const csvContent =
    "\uFEFF" + // BOM for Arabic support
    [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `نتائج_الطلاب_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 card-hover">
      <div className="text-right">
        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-primary">{value}</p>
      </div>
      <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>{icon}</div>
    </div>
  );
}

// ─── Result Details Modal ─────────────────────────────────────────────────────

function ResultModal({
  result,
  onClose,
}: {
  result: StudentResult;
  onClose: () => void;
}) {
  // الإجابات محفوظة في قاعدة البيانات كـ Object مش Array
  // { "question-uuid": { question, student_answer, ... }, ... }
  // نحولها لـ Array مرتبة بـ question_number
  const rawAnswers = result.answers;
  const answers: AnswerDetail[] = Array.isArray(rawAnswers)
    ? rawAnswers
    : rawAnswers && typeof rawAnswers === "object"
    ? (Object.values(rawAnswers) as AnswerDetail[]).sort(
        (a, b) => (a.question_number || 0) - (b.question_number || 0)
      )
    : [];

  const dateStr = result.created_at || result.submitted_at || "";

  const optionLabels: Record<string, string> = {
    a: "أ",
    b: "ب",
    c: "ج",
    d: "د",
    e: "هـ",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.50)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-black text-primary">تفاصيل النتيجة</h2>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-5">

          {/* Student Info Banner */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-right">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-black px-3 py-1.5 rounded-xl ${
                    result.score_percentage >= 50
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {Math.round(result.score_percentage)}%
                </span>
                <span className="text-sm font-black text-primary">
                  {result.correct_answers}/{result.total_questions}
                </span>
              </div>
              <div>
                <p className="text-base font-black text-primary">{result.student_name}</p>
                <p className="text-xs font-mono text-slate-400">{result.student_phone || "بدون رقم"}</p>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-right">
              <p className="text-xs font-bold text-slate-400 mb-0.5">الامتحان</p>
              <p className="text-xs font-black text-primary">{result.exam_title}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-right">
              <p className="text-xs font-bold text-slate-400 mb-0.5">الوقت المستغرق</p>
              <p className="text-xs font-black text-primary">
                {result.time_taken_seconds ? formatTime(result.time_taken_seconds) : "-"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-right">
              <p className="text-xs font-bold text-slate-400 mb-0.5">التاريخ</p>
              <p className="text-xs font-black text-primary">
                {dateStr ? formatDate(dateStr) : "-"}
              </p>
            </div>
          </div>

          {/* Answers Section */}
          {answers.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex gap-3 text-xs font-bold">
                  <span className="text-green-600">✓ صح: {answers.filter(a => a.is_correct).length}</span>
                  <span className="text-red-500">✗ خطأ: {answers.filter(a => !a.is_correct).length}</span>
                </div>
                <h3 className="text-sm font-black text-primary">الإجابات</h3>
              </div>
              <div className="space-y-3">
                {answers.map((ans, idx) => {
                  const isCorrect = ans.is_correct;
                  const questionText =
                    ans.question_text || ans.question || `سؤال ${idx + 1}`;

                  // Normalize student answer
                  const studentAnsRaw = Array.isArray(ans.student_answer)
                    ? ans.student_answer
                    : ans.student_answer ? [ans.student_answer] : [];

                  // Normalize correct answer
                  const rawCorrect = ans.correct_answer || ans.correct_answers;
                  const correctAnsRaw = Array.isArray(rawCorrect)
                    ? rawCorrect
                    : rawCorrect ? String(rawCorrect).split(",").map(s => s.trim()) : [];

                  // Options map
                  const opts = ans.options || {};

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border text-right overflow-hidden ${
                        isCorrect
                          ? "border-green-200"
                          : "border-red-200"
                      }`}
                    >
                      {/* Question header */}
                      <div className={`px-4 py-2.5 ${
                        isCorrect ? "bg-green-50" : "bg-red-50"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-black mt-0.5 flex-shrink-0 ${
                            isCorrect ? "text-green-600" : "text-red-500"
                          }`}>
                            {isCorrect ? "✓" : "✗"}
                          </span>
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">
                            س{idx + 1}: {questionText}
                          </p>
                        </div>
                      </div>

                      {/* Options */}
                      {Object.keys(opts).length > 0 && (
                        <div className="px-4 py-3 space-y-1.5 bg-white">
                          {Object.entries(opts).map(([key, val]) => {
                            const isStudentChoice = studentAnsRaw.includes(key);
                            const isCorrectChoice = correctAnsRaw.includes(key);
                            return (
                              <div
                                key={key}
                                className={`flex items-center gap-2 justify-end px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                  isCorrectChoice
                                    ? "bg-green-100 text-green-800 font-black"
                                    : isStudentChoice && !isCorrect
                                    ? "bg-red-100 text-red-700"
                                    : "text-slate-600"
                                }`}
                              >
                                {isCorrectChoice && <span className="text-green-600 font-black">✓</span>}
                                {isStudentChoice && !isCorrectChoice && <span className="text-red-500 font-black">✗</span>}
                                <span>{val}</span>
                                <span className={`font-black text-xs w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                                  isCorrectChoice
                                    ? "bg-green-600 text-white"
                                    : isStudentChoice && !isCorrect
                                    ? "bg-red-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}>
                                  {optionLabels[key] || key.toUpperCase()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Fallback: no options stored */}
                      {Object.keys(opts).length === 0 && (
                        <div className="px-4 py-2.5 bg-white space-y-1">
                          <p className="text-xs text-slate-500">
                            إجابة الطالب:{" "}
                            <span className={isCorrect ? "text-green-600 font-black" : "text-red-500 font-black"}>
                              {studentAnsRaw.join(", ") || "لم يُجب"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-xs text-slate-500">
                              الإجابة الصحيحة:{" "}
                              <span className="text-green-600 font-black">
                                {correctAnsRaw.join(", ") || "-"}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm font-bold">لا توجد تفاصيل إجابات محفوظة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  // Auth
  const [authorized, setAuthorized] = useState(false);

  // Data
  const [results, setResults] = useState<StudentResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>("results");
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState("all");

  // ── Auth Check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_authenticated");
    if (isAuth !== "true") {
      router.push("/admin");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // ── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();

      // Fetch results - try submitted_at first, fallback to created_at
      const resultsRes = await supabase
        .from("student_results")
        .select("*")
        .order("submitted_at", { ascending: false });

      // Fetch exams independently - include exam_password
      const examsRes = await supabase
        .from("exams")
        .select("id, title, exam_code, exam_password, description, duration_minutes, total_questions, is_active, created_at")
        .order("created_at", { ascending: false });

      // Extract error message from Supabase PostgrestError or regular Error
      const extractMsg = (e: unknown) =>
        (e as { message?: string })?.message || "حدث خطأ في الاتصال بالسيرفر";

      if (resultsRes.error) throw new Error(extractMsg(resultsRes.error));
      if (examsRes.error) throw new Error(extractMsg(examsRes.error));

      setResults(resultsRes.data || []);
      setExams(examsRes.data || []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "حدث خطأ غير متوقع";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [authorized]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    router.push("/admin");
  };

  const handleToggleExam = async (exam: Exam) => {
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("exams")
        .update({ is_active: !exam.is_active })
        .eq("id", exam.id);

      if (updateError) throw updateError;
      setExams((prev) =>
        prev.map((e) =>
          e.id === exam.id ? { ...e, is_active: !e.is_active } : e
        )
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "فشلت العملية";
      alert("فشل التحديث: " + msg);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ── Computed Values ──────────────────────────────────────────────────────────
  const filteredResults = results.filter((r) => {
    const matchesSearch = r.student_name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesExam =
      selectedExamFilter === "all" || r.exam_code === selectedExamFilter;
    return matchesSearch && matchesExam;
  });

  const activeExamsCount = exams.filter((e) => e.is_active).length;
  const completedExamsCount = new Set(results.map((r) => r.exam_code)).size;
  const totalStudents = results.length;
  const averageScore =
    results.length > 0
      ? (
          results.reduce((acc, r) => acc + r.score_percentage, 0) /
          results.length
        ).toFixed(1)
      : "0";

  // Chart data
  const examGroupMap: Record<string, { sum: number; count: number }> = {};
  results.forEach((r) => {
    if (!examGroupMap[r.exam_title]) {
      examGroupMap[r.exam_title] = { sum: 0, count: 0 };
    }
    examGroupMap[r.exam_title].sum += r.score_percentage;
    examGroupMap[r.exam_title].count += 1;
  });
  const chartData = Object.entries(examGroupMap).map(([title, val]) => ({
    name: title.length > 20 ? title.slice(0, 20) + "..." : title,
    النسبة: Math.round(val.sum / val.count),
    الطلاب: val.count,
  }));

  if (!authorized) return null;

  return (
    <>
      {/* Result Details Modal */}
      {selectedResult && (
        <ResultModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

      <div className="min-h-screen bg-[#f0f2f8] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5 animate-fadeIn">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">
            {/* Left: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>خروج</span>
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-all"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>تحديث</span>
              </button>
            </div>

            {/* Right: Title */}
            <div className="text-right">
              <h1 className="text-2xl font-black text-primary">لوحة التحكم</h1>
              <p className="text-xs font-semibold text-slate-400">
                إدارة الامتحانات والنتائج
              </p>
            </div>
          </div>

          {/* ── Error Banner ────────────────────────────────────────────────── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {/* ── Stats Grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="امتحانات نشطة"
              value={activeExamsCount}
              icon={<Activity className="h-6 w-6 text-purple-500" />}
              color="bg-purple-50"
            />
            <StatCard
              label="متوسط الدرجات"
              value={`${averageScore}%`}
              icon={<Award className="h-6 w-6 text-amber-500" />}
              color="bg-amber-50"
            />
            <StatCard
              label="امتحانات مؤداة"
              value={completedExamsCount}
              icon={<ClipboardList className="h-6 w-6 text-emerald-500" />}
              color="bg-emerald-50"
            />
            <StatCard
              label="إجمالي الطلاب"
              value={totalStudents}
              icon={<Users className="h-6 w-6 text-sky-500" />}
              color="bg-sky-50"
            />
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center justify-end gap-1 p-3 border-b border-slate-100 bg-slate-50/50">
              {[
                {
                  key: "results" as ActiveTab,
                  label: "النتائج",
                  icon: <FileText className="h-4 w-4" />,
                },
                {
                  key: "exams" as ActiveTab,
                  label: "الامتحانات",
                  icon: <Activity className="h-4 w-4" />,
                },
                {
                  key: "charts" as ActiveTab,
                  label: "الرسوم البيانية",
                  icon: <BarChart2 className="h-4 w-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Results Tab ───────────────────────────────────────────────── */}
            {activeTab === "results" && (
              <div>
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-slate-100">
                  {/* Search */}
                  <div className="relative flex-grow max-w-xs ms-auto">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="بحث بالاسم..."
                      className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-accent bg-white text-right"
                    />
                  </div>

                  {/* Exam Filter */}
                  <select
                    value={selectedExamFilter}
                    onChange={(e) => setSelectedExamFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-accent bg-white"
                  >
                    <option value="all">كل الامتحانات</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.exam_code}>
                        {ex.title}
                      </option>
                    ))}
                  </select>

                  {/* Export CSV */}
                  <button
                    onClick={() => exportToCSV(filteredResults)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>تصدير CSV</span>
                  </button>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent" />
                    <span className="text-slate-400 text-sm font-bold">
                      جاري تحميل النتائج...
                    </span>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold border-b border-slate-100">
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">الاسم</th>
                            <th className="px-4 py-3">الهاتف</th>
                            <th className="px-4 py-3">الامتحان</th>
                            <th className="px-4 py-3 text-center">الدرجة</th>
                            <th className="px-4 py-3 text-center">النسبة</th>
                            <th className="px-4 py-3">التاريخ</th>
                            <th className="px-4 py-3 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredResults.map((row, idx) => {
                            const dateStr =
                              row.created_at || row.submitted_at || "";
                            return (
                              <tr
                                key={row.id}
                                className="hover:bg-slate-50/60 transition-colors"
                              >
                                <td className="px-4 py-3 text-xs font-bold text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="px-4 py-3 font-black text-primary text-sm">
                                  {row.student_name}
                                </td>
                                <td className="px-4 py-3 text-xs font-mono text-slate-500">
                                  {row.student_phone || "-"}
                                </td>
                                <td className="px-4 py-3 text-xs font-semibold text-slate-600 max-w-[160px] truncate">
                                  {row.exam_title}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-black text-primary">
                                  {row.correct_answers}/{row.total_questions}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                      row.score_percentage >= 50
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-600"
                                    }`}
                                  >
                                    {Math.round(row.score_percentage)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400 font-medium">
                                  {dateStr ? formatDate(dateStr) : "-"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => setSelectedResult(row)}
                                    className="p-2 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                                    title="عرض التفاصيل"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Footer count */}
                    <div className="px-4 py-3 border-t border-slate-100 text-xs font-bold text-slate-400 text-right">
                      عرض {filteredResults.length} من {results.length} نتيجة
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full inline-block text-slate-300 mb-4">
                      <Users className="h-10 w-10" />
                    </div>
                    <h4 className="text-base font-bold text-primary mb-1">
                      لا توجد نتائج
                    </h4>
                    <p className="text-slate-400 text-xs">
                      لم يتقدم أي طالب للامتحان بعد، أو لا توجد نتائج تطابق
                      البحث.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Exams Tab ─────────────────────────────────────────────────── */}
            {activeTab === "exams" && (
              <div className="p-4">
                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent" />
                    <span className="text-slate-400 text-sm font-bold">
                      جاري تحميل الامتحانات...
                    </span>
                  </div>
                ) : exams.length > 0 ? (
                  <div className="space-y-3">
                    {exams.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:border-slate-200"
                      >
                        {/* Left: Toggle Button */}
                        <button
                          onClick={() => handleToggleExam(exam)}
                          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            exam.is_active
                              ? "bg-red-50 text-red-500 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {exam.is_active ? (
                            <>
                              <ToggleLeft className="h-4 w-4" />
                              <span>تعطيل</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4" />
                              <span>تفعيل</span>
                            </>
                          )}
                        </button>

                        {/* Right: Exam Info */}
                        <div className="text-right flex-grow">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-full ${
                                exam.is_active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {exam.is_active ? "مفعّل" : "مغلق"}
                            </span>
                            <h3 className="text-base font-black text-primary">
                              {exam.title}
                            </h3>
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mb-2">
                            {exam.duration_minutes} دقيقة •{" "}
                            {exam.total_questions} سؤال
                          </p>
                          {/* كود الطالب (exam_password) */}
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <button
                              onClick={() => handleCopyCode(exam.exam_password || exam.exam_code)}
                              className="p-1 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-200 transition-colors"
                              title="نسخ كود الطالب"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-mono">
                              {copiedCode === (exam.exam_password || exam.exam_code)
                                ? "✓ تم النسخ"
                                : exam.exam_password || "—"}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              🔑 كود الطالب:
                            </span>
                          </div>
                          {/* كود الامتحان الداخلي */}
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {exam.exam_code}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              ID:
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full inline-block text-slate-300 mb-4">
                      <BookOpen className="h-10 w-10" />
                    </div>
                    <h4 className="text-base font-bold text-primary mb-1">
                      لا توجد امتحانات
                    </h4>
                    <p className="text-slate-400 text-xs">
                      لم يتم إنشاء أي امتحان بعد.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Charts Tab ────────────────────────────────────────────────── */}
            {activeTab === "charts" && (
              <div className="p-6">
                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent" />
                  </div>
                ) : chartData.length > 0 ? (
                  <div>
                    <h3 className="text-base font-black text-primary mb-6 text-right">
                      متوسط درجات الطلاب لكل امتحان
                    </h3>
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fontWeight: "bold" }}
                            angle={-15}
                            textAnchor="end"
                          />
                          <YAxis
                            domain={[0, 100]}
                            tickFormatter={(val) => `${val}%`}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value) => [
                              `${value}%`,
                              "متوسط الدرجة",
                            ]}
                            contentStyle={{
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              fontFamily: "Cairo, sans-serif",
                            }}
                          />
                          <Bar dataKey="النسبة" radius={[8, 8, 0, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.النسبة >= 50 ? "#1a2754" : "#ef4444"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Extra stats */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {chartData.map((d, i) => (
                        <div
                          key={i}
                          className="bg-slate-50 rounded-xl p-4 text-right"
                        >
                          <p
                            className="text-xs font-bold text-slate-500 mb-1 truncate"
                            title={d.name}
                          >
                            {d.name}
                          </p>
                          <p className="text-xl font-black text-primary">
                            {d.النسبة}%
                          </p>
                          <p className="text-xs text-slate-400 font-semibold">
                            {d.الطلاب} طالب
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full inline-block text-slate-300 mb-4">
                      <BarChart2 className="h-10 w-10" />
                    </div>
                    <h4 className="text-base font-bold text-primary mb-1">
                      لا توجد بيانات كافية
                    </h4>
                    <p className="text-slate-400 text-xs">
                      بمجرد تقديم الطلاب للامتحانات، ستظهر الرسوم البيانية
                      هنا.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
