"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../../actions/authActions";
import { Lock, Mail, AlertCircle, ArrowRight, User as UserIcon, Shield, Truck } from "lucide-react";
function LoginFormContent() {
  const searchParams = useSearchParams();
  const targetRole = searchParams.get("role") || "user";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const targetUrl = targetRole === "admin" ? "/admin" : targetRole === "staff" ? "/staff" : "/dashboard";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("role", targetRole === "staff" ? "DELIVERY_STAFF" : targetRole.toUpperCase());
      const res = await loginAction(null, formData);
      if (res && res.token) {
        document.cookie = `session_token=${res.token}; path=/; max-age=604800; SameSite=Lax;`;
        document.cookie = `user_role=${res.role}; path=/; max-age=604800; SameSite=Lax;`;
      }
    } catch (err) {
      console.error("Login action error:", err);
    } finally {
      setTimeout(() => {
        window.location.replace(targetUrl);
      }, 100);
    }
  };
  const handleQuickDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
  };
  const getRoleHeader = () => {
    if (targetRole === "admin") return { title: "Admin Workspace", icon: Shield, color: "text-blue-500 bg-blue-50" };
    if (targetRole === "staff") return { title: "Delivery Partner Portal", icon: Truck, color: "text-emerald-600 bg-emerald-50" };
    return { title: "User Account", icon: UserIcon, color: "text-blue-500 bg-blue-50" };
  };
  const config = getRoleHeader();
  const Icon = config.icon;
  return <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-800 font-sans select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {
    /* Logo */
  }
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl">B</div>
          <span className="font-extrabold text-slate-800 text-2xl tracking-tight">BookBridge AI</span>
        </Link>
        
        <div className="flex items-center justify-center space-x-1.5 py-1">
          <div className={`p-1.5 rounded-lg ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{config.title}</span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to your account</h2>
        {targetRole === "user" && <p className="text-xs text-slate-500">
            Or{" "}
            <Link href="/register?role=user" className="font-semibold text-blue-500 hover:text-blue-600">
              create a new account for free
            </Link>
          </p>}
        {targetRole === "staff" && <p className="text-xs text-slate-500">
            Don't have a partner account?{" "}
            <Link href="/register?role=staff" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
              Register as Delivery Staff Partner
            </Link>
          </p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-md sm:rounded-xl sm:px-10 space-y-6">
          {error && <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start space-x-2.5 text-rose-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="hidden" name="role" value={targetRole === "staff" ? "DELIVERY_STAFF" : targetRole.toUpperCase()} />

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
    id="email"
    name="email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter email address"
    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
  />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-blue-500 hover:text-blue-600">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
    id="password"
    name="password"
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter password"
    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium"
  />
              </div>
            </div>

            <button
    type="submit"
    disabled={isPending}
    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
  >
              <span>{isPending ? "Signing in..." : "Sign In"}</span>
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {
    /* OAuth 2.0 Providers */
  }
          <div className="space-y-3 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">Or Continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
    href="/api/auth/oauth/google"
    className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 transition-colors shadow-2xs"
  >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </a>

              <a
    href="/api/auth/oauth/github"
    className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 transition-colors shadow-2xs"
  >
                <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">Loading login portal...</div>}>
      <LoginFormContent />
    </Suspense>;
}
export {
  LoginPage as default
};
