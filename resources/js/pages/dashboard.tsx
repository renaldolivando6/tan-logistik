import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Truck, Navigation, Receipt, FileBarChart } from 'lucide-react';

const quickLinks = [
    { title: 'Kendaraan', desc: 'Kelola armada', href: 'kendaraan.index', icon: Truck, color: 'bg-blue-50 text-blue-600' },
    { title: 'Trip', desc: 'Kelola perjalanan', href: 'trip.index', icon: Navigation, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Biaya', desc: 'Catat pengeluaran', href: 'biaya-maintenance.index', icon: Receipt, color: 'bg-rose-50 text-rose-600' },
    { title: 'Laporan', desc: 'Lihat laporan', href: 'laporan.biaya-kendaraan', icon: FileBarChart, color: 'bg-emerald-50 text-emerald-600' },
];

function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="text-center">
            <div className="text-5xl sm:text-6xl font-mono font-bold text-gray-900 tracking-wider">
                {formatTime(time)}
            </div>
            <div className="mt-2 text-gray-500">{formatDate(time)}</div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('dashboard') }]}>
            <Head title="Dashboard" />

            <div className="p-6 space-y-8">
                {/* Clock */}
                <div className="py-8">
                    <LiveClock />
                </div>

                {/* Welcome */}
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900">Selamat Datang</h1>
                    <p className="text-gray-500 text-sm mt-1">Sistem Manajemen Operasional PT. Trans Anugerah Nusa</p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={route(item.href)}
                            className="flex flex-col items-center p-6 bg-white rounded-xl border hover:shadow-md transition-shadow"
                        >
                            <div className={`p-3 rounded-xl ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <p className="mt-3 font-semibold text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}