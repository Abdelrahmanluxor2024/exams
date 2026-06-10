"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldAlert, GraduationCap } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, go to dashboard
    const isAuth = sessionStorage.getItem("admin_authenticated");
    if (isAuth === "true") {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.trim() === "admin123") {
      sessionStorage.setItem("admin_authenticated", "true");
      router.push("/admin/dashboard");
    } else {
      setError("كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
        {/* Top Accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-accent" />

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary/5 text-primary mb-4">
            <Lock className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">لوحة تحكم المشرف</h2>
          <p className="text-slate-500 font-bold text-sm">
            يرجى إدخال كلمة مرور المعلم لتسجيل الدخول
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="password" className="block text-sm font-extrabold text-primary mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور هنا"
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-right text-primary font-bold placeholder-slate-400 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-light text-white rounded-2xl font-black text-base shadow-md hover:shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
