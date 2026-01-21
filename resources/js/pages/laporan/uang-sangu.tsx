import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Wallet, Filter, Download, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Kendaraan {
    id: number;
    nomor_polisi: string;
    jenis: string;
}

interface Trip {
    id: number;
    tanggal_trip: string;
    kendaraan_id: number;
    nomor_polisi: string;
    jenis_kendaraan: string;
    uang_sangu: string;
    total_biaya: string;
    sisa_uang: string;
    status: string;
    status_uang_sangu: 'belum_selesai' | 'selesai';
    uang_dikembalikan: string | null;
    tanggal_pengembalian: string | null;
    selisih_uang: string | null;
    catatan_trip: string | null;
    catatan_pengembalian: string | null;
}

interface Summary {
    total_trip: number;
    total_uang_sangu: number;
    total_biaya: number;
    total_sisa: number;
    total_dikembalikan: number;
    total_selisih: number;
    trip_belum_selesai: number;
    trip_selesai: number;
}

interface SummaryKendaraan {
    kendaraan_id: number;
    nomor_polisi: string;
    jenis: string;
    total_trip: number;
    total_uang_sangu: number;
    total_biaya: number;
    total_sisa: number;
}

interface Props {
    filters: {
        start_date: string;
        end_date: string;
        status: string | null;
        kendaraan_id: string | null;
    };
    kendaraanList: Kendaraan[];
    trips: Trip[];
    summary: Summary;
    summaryPerKendaraan: SummaryKendaraan[];
}

const formatRupiah = (num: string | number | null) => {
    if (num === null) return '-';
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const SanguStatusBadge = ({ status }: { status: 'belum_selesai' | 'selesai' }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
        ${status === 'selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        {status === 'selesai' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {status === 'selesai' ? 'Lunas' : 'Belum'}
    </span>
);

export default function LaporanUangSangu({
    filters,
    kendaraanList,
    trips,
    summary,
    summaryPerKendaraan,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [status, setStatus] = useState(filters.status || 'all');
    const [kendaraanId, setKendaraanId] = useState(filters.kendaraan_id || 'all');

    const handleFilter = () => {
        router.get(route('laporan.uang-sangu'), {
            start_date: startDate,
            end_date: endDate,
            status: status === 'all' ? null : status,
            kendaraan_id: kendaraanId === 'all' ? null : kendaraanId,
        }, { preserveState: true });
    };

    const handleExport = () => {
        const headers = ['Tanggal', 'Kendaraan', 'Uang Sangu', 'Total Biaya', 'Sisa', 'Dikembalikan', 'Selisih', 'Status'];
        const rows = trips.map(t => [
            t.tanggal_trip,
            t.nomor_polisi,
            t.uang_sangu,
            t.total_biaya,
            t.sisa_uang,
            t.uang_dikembalikan || '',
            t.selisih_uang || '',
            t.status_uang_sangu === 'selesai' ? 'Lunas' : 'Belum'
        ]);

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-uang-sangu-${startDate}-${endDate}.csv`;
        a.click();
    };

    const breadcrumbs = [
        { title: 'Laporan', href: '#' },
        { title: 'Rekap Uang Sangu', href: route('laporan.uang-sangu') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Uang Sangu" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-50 rounded-xl">
                            <Wallet className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Laporan Rekap Uang Sangu</h1>
                            <p className="text-sm text-gray-500">Tracking uang sangu dan pengembalian</p>
                        </div>
                    </div>
                    <Button onClick={handleExport} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1.5" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Filter</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm">Tanggal Mulai</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Tanggal Akhir</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Status Sangu</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="belum_selesai">Belum Selesai</SelectItem>
                                    <SelectItem value="selesai">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Kendaraan</Label>
                            <Select value={kendaraanId} onValueChange={setKendaraanId}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {kendaraanList.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.nomor_polisi}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleFilter} className="w-full">Terapkan</Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-900 text-white rounded-xl p-4">
                        <p className="text-xs text-gray-400">Total Trip</p>
                        <p className="text-2xl font-bold">{summary.total_trip}</p>
                        <div className="mt-2 flex gap-2 text-xs">
                            <span className="text-emerald-400">{summary.trip_selesai} lunas</span>
                            <span className="text-amber-400">{summary.trip_belum_selesai} pending</span>
                        </div>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-4">
                        <p className="text-xs text-violet-600">Total Uang Sangu</p>
                        <p className="text-xl font-bold text-violet-700">{formatRupiah(summary.total_uang_sangu)}</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4">
                        <p className="text-xs text-rose-600">Total Biaya</p>
                        <p className="text-xl font-bold text-rose-700">{formatRupiah(summary.total_biaya)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600">Total Sisa</p>
                        <p className="text-xl font-bold text-emerald-700">{formatRupiah(summary.total_sisa)}</p>
                    </div>
                </div>

                {/* Alert for pending */}
                {summary.trip_belum_selesai > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="font-medium text-amber-800">
                                {summary.trip_belum_selesai} trip belum dikonfirmasi pengembalian uang sangu
                            </p>
                            <p className="text-sm text-amber-600">
                                Total sisa yang harus dikembalikan: {formatRupiah(
                                    trips.filter(t => t.status_uang_sangu === 'belum_selesai').reduce((sum, t) => sum + parseFloat(t.sisa_uang), 0)
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary per Kendaraan */}
                {summaryPerKendaraan.length > 0 && (
                    <div className="bg-white rounded-xl border p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Ringkasan per Kendaraan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {summaryPerKendaraan.map((item) => (
                                <div key={item.kendaraan_id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.nomor_polisi}</p>
                                            <p className="text-xs text-gray-500">{item.jenis}</p>
                                        </div>
                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                            {item.total_trip} trip
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Sangu</p>
                                            <p className="font-semibold">{formatRupiah(item.total_uang_sangu)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Biaya</p>
                                            <p className="font-semibold">{formatRupiah(item.total_biaya)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detail Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Detail per Trip</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kendaraan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Uang Sangu</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Total Biaya</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Sisa</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Dikembalikan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Selisih</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            Tidak ada data untuk periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    trips.map((trip) => (
                                        <tr key={trip.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-sm font-medium">{formatDate(trip.tanggal_trip)}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{trip.nomor_polisi}</div>
                                                <div className="text-xs text-gray-500">{trip.jenis_kendaraan}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{formatRupiah(trip.uang_sangu)}</td>
                                            <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">{formatRupiah(trip.total_biaya)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-semibold ${parseFloat(trip.sisa_uang) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {formatRupiah(trip.sisa_uang)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm hidden md:table-cell">
                                                {formatRupiah(trip.uang_dikembalikan)}
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                {trip.selisih_uang !== null && (
                                                    <span className={`text-sm font-medium ${parseFloat(trip.selisih_uang) < 0 ? 'text-red-600' : parseFloat(trip.selisih_uang) > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                                                        {formatRupiah(trip.selisih_uang)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <SanguStatusBadge status={trip.status_uang_sangu} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}