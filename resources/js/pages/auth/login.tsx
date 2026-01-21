import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <>
            <Head title="Login - TAN Logistik" />
            <div className="flex min-h-screen">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden">
                    {/* Animated Gradient Orbs */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:1s] [animation-duration:3s]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] animate-pulse [animation-delay:2s] [animation-duration:4s]"></div>
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDuration: `${5 + Math.random() * 10}s`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Dot grid */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                        <div className="text-center">
                            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-2">
                                TAN
                            </h1>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent pb-2 animate-shimmer bg-[length:200%_auto]">
                                Logistik
                            </h1>

                            {/* Animated line */}
                            <div className="relative h-px w-24 mx-auto mt-4 mb-6 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-slide"></div>
                            </div>

                            <p className="text-gray-400 text-lg font-light">
                                Sistem Manajemen Operasional
                            </p>
                        </div>

                        {/* Footer on left side */}
                        <div className="absolute bottom-8 text-center">
                            <p className="text-gray-600 text-sm">PT. Trans Anugerah Nusa</p>
                            <p className="text-gray-700 text-xs mt-1">© 2025 TAN Logistik</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-900 p-6 md:p-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-10">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                TAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Logistik</span>
                            </h1>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-2">Masuk ke Akun Anda</h2>
                            <p className="text-gray-500">Masukkan email dan password untuk login</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-green-500">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full mt-6 inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white overflow-hidden rounded-lg transition-all duration-300 disabled:opacity-70"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                                <span className="relative flex items-center gap-2">
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Masuk
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
                <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slide {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.4; }
        }
      `}</style>
            </div>
        </>
    );
}