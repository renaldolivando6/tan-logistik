import { ArrowRight } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="relative min-h-screen bg-slate-950 overflow-hidden">
            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Content */}
            <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
                <div className="max-w-3xl w-full text-center">

                    {/* Main Title with animated gradient */}
                    <div className="mb-6">
                        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-2">
                            TAN
                        </h1>
                        <h1
                            className="text-6xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent pb-2"
                            style={{
                                backgroundSize: '200% auto',
                                animation: 'shimmer 3s linear infinite'
                            }}
                        >
                            Logistik
                        </h1>
                    </div>

                    {/* Animated line */}
                    <div className="relative h-px w-32 mx-auto mt-4 mb-8 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                            style={{ animation: 'slide 2s ease-in-out infinite' }}></div>
                    </div>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-400 mb-3 font-light tracking-wide">
                        Sistem Manajemen Operasional
                    </p>
                    <p className="text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
                        Platform terintegrasi untuk tracking biaya operasional, uang sangu,
                        dan monitoring armada kendaraan secara real-time
                    </p>

                    {/* CTA Button with glow */}
                    <div className="mb-20">
                        <Link href={route('login')} className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white overflow-hidden rounded-full transition-all duration-300">
                            {/* Button glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                            {/* Button content */}
                            <span className="relative flex items-center gap-3">
                                Masuk ke Sistem
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="space-y-1">
                        <p className="font-medium text-gray-500">PT. Trans Anugerah Nusa</p>
                        <p className="text-gray-600 text-sm">Surabaya, Jawa Timur</p>
                        <p className="text-xs text-gray-700 mt-4">© 2025 TAN Logistik. All rights reserved.</p>
                    </div>
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
    );
}