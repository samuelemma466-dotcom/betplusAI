
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Fingerprint, ArrowLeft, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  getAuth
} from "firebase/auth";
import { auth } from "../services/firebase";

interface AuthScreenProps {
  onAuthenticated: (user: any) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Verification State
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password Strength State
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    let score = 0;
    if (password.length > 6) score += 1;
    if (password.length > 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  // Resend Timer
  useEffect(() => {
      if (resendCooldown > 0) {
          const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
          return () => clearTimeout(timer);
      }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send Email Verification
        await sendEmailVerification(user);
        
        setPendingUser(user);
        setNeedsVerification(true);
        setResendCooldown(60);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user.emailVerified) {
             onAuthenticated(user);
        } else {
             setPendingUser(user);
             setNeedsVerification(true);
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "An error occurred.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      else if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      else if (err.code === 'auth/weak-password') msg = "Password is too weak.";
      else if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
      else if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      else if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Try again later.";
      else if (err.code === 'auth/network-request-failed') msg = "Network error. Check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Google accounts are auto-verified
        onAuthenticated(result.user);
    } catch (err: any) {
        console.error(err);
        let msg = "Google sign in failed.";
        if (err.code === 'auth/popup-closed-by-user') msg = "Sign in cancelled.";
        else if (err.code === 'auth/popup-blocked') msg = "Pop-up blocked by browser.";
        else if (err.code === 'auth/operation-not-allowed') msg = "Google Sign-In not enabled in Firebase Console.";
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("Please enter your email address.");
          return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      try {
          await sendPasswordResetEmail(auth, email);
          setSuccessMsg("Password reset link sent! Check your email.");
      } catch (err: any) {
          console.error(err);
          let msg = "Failed to send reset email.";
          if (err.code === 'auth/user-not-found') msg = "No account found with this email.";
          setError(msg);
      } finally {
          setIsLoading(false);
      }
  };

  const checkVerificationStatus = async () => {
      if (!pendingUser) return;
      setIsLoading(true);
      try {
          await pendingUser.reload();
          if (pendingUser.emailVerified) {
              onAuthenticated(pendingUser);
          } else {
              setError("Email not verified yet. Please click the link in your email.");
          }
      } catch (e) {
          console.error(e);
          setError("Failed to check status. Try again.");
      } finally {
          setIsLoading(false);
      }
  };

  const resendVerification = async () => {
      if (!pendingUser || resendCooldown > 0) return;
      try {
          await sendEmailVerification(pendingUser);
          setSuccessMsg("Verification link resent!");
          setResendCooldown(60);
          setError(null);
      } catch (e: any) {
          if (e.code === 'auth/too-many-requests') {
             setError("Please wait before requesting another email.");
          } else {
             setError("Failed to resend email.");
          }
      }
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col md:flex-row">
      {/* Left Panel: Hero / Branding */}
      <div className="hidden md:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden border-r border-slate-800">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950"></div>
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay"></div>
         
         <div className="relative z-10 text-center px-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8 mx-auto transform rotate-3">
               <span className="font-black text-white text-4xl italic">N</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">NXB</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
               The world's most advanced AI-powered betting simulation engine. Secure, fast, and intelligent.
            </p>
            
            <div className="mt-12 flex gap-4 justify-center">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                  <Fingerprint size={14} className="text-emerald-500" /> Biometric Ready
               </div>
            </div>
         </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 bg-white dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 relative">
         <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
            
            {/* VERIFICATION PENDING VIEW */}
            {needsVerification ? (
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Mail size={32} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Your Email</h2>
                        <p className="text-slate-500 text-sm">
                            We've sent a verification link to <br/> 
                            <span className="font-bold text-slate-900 dark:text-white">{email}</span>
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100 dark:border-slate-800">
                        <p>Click the link in the email to verify your account. If you don't see it, check your spam folder.</p>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-bold bg-red-100 dark:bg-red-900/20 p-3 rounded-lg flex items-center justify-center gap-2">
                           <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-lg flex items-center justify-center gap-2">
                           <Check size={14} /> {successMsg}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            onClick={checkVerificationStatus}
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                            I Have Verified
                        </button>
                        
                        <button 
                            onClick={resendVerification}
                            disabled={resendCooldown > 0}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
                        >
                            {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Email'}
                        </button>
                    </div>

                    <button 
                        onClick={() => { setNeedsVerification(false); setPendingUser(null); setError(null); }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold mt-4"
                    >
                        Back to Login
                    </button>
                </div>
            ) : (
                <>
                <div className="mb-10 text-center md:text-left">
                <div className="md:hidden w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mb-6 mx-auto">
                    <span className="font-black text-white text-2xl italic">N</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {mode === 'login' 
                        ? 'Enter your credentials to access your secure wallet.' 
                        : mode === 'register' 
                            ? 'Join the simulation engine today.'
                            : 'Enter your email to receive a reset link.'}
                </p>
                </div>

                {mode === 'forgot' ? (
                // --- FORGOT PASSWORD FORM ---
                <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl block pl-11 pr-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-bold bg-red-100 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                            <Check size={16} /> {successMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center mt-4">
                        <button 
                            type="button"
                            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </div>
                </form>
                ) : (
                // --- LOGIN / REGISTER FORM ---
                <div className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                                </div>
                                <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl block pl-11 pr-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                                placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2 ml-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Password</label>
                                {mode === 'login' && (
                                <button 
                                    type="button"
                                    onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500"
                                >
                                    Forgot?
                                </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                                </div>
                                <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl block pl-11 pr-11 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                                placeholder="••••••••••••"
                                />
                                <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            
                            {/* Password Strength Meter (Only in Register Mode) */}
                            {mode === 'register' && password && (
                                <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Strength</span>
                                    <span className={`text-[10px] font-bold ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4, 5].map((idx) => (
                                        <div 
                                        key={idx} 
                                        className={`flex-1 rounded-full transition-colors duration-300 ${strength >= idx ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-800'}`} 
                                        />
                                    ))}
                                </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold bg-red-100 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                            {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading || !email || !password || (mode === 'register' && strength < 2)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Authenticating...
                                </span>
                            ) : (
                                <>
                                {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Google Sign In Section */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-950 px-2 text-slate-400 font-bold">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                    </button>
                </div>
                )}

                {mode !== 'forgot' && (
                    <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button 
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                            className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                    </div>
                )}
            </>
            )}
         </div>
      </div>
    </div>
  );
};
