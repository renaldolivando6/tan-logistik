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
import { Wallet, Filter, Download, Truck } from 'lucide-react';

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
    nama_asal: string | null;
    nama_tujuan: string | null;
    uang_sangu: string;
    status: 'draft' | 'sedang_jalan' | 'selesai' | 'batal';
    catatan_trip: string | null;
}

interface Summary {
    total_trip: number;
    total_uang_sangu: number;
    trip_draft: number;
    trip_sedang_jalan: number;
    trip_selesai: number;
    trip_batal: number;
}

interface SummaryKendaraan {
    kendaraan_id: number;
    nomor_polisi: string;
    jenis: string;
    total_trip: number;
    total_uang_sangu: number;
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

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    sedang_jalan: { label: 'Sedang Jalan', color: 'bg-blue-50 text-blue-700' },
    selesai: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700' },
    batal: { label: 'Batal', color: 'bg-red-50 text-red-700' },
};

const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[status].color}`}>
        {STATUS_CONFIG[status].label}
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
        const headers = ['Tanggal', 'Kendaraan', 'Rute', 'Uang Sangu', 'Status'];
        const rows = trips.map(t => [
            t.tanggal_trip,
            t.nomor_polisi,
            `${t.nama_asal || '-'} → ${t.nama_tujuan || '-'}`,
            t.uang_sangu,
            STATUS_CONFIG[t.status].label
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
        { title: 'Laporan', href: route('dashboard') },
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
                            <p className="text-sm text-gray-500">Monitoring uang sangu per trip</p>
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
                            <Label className="text-sm">Status Trip</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sedang_jalan">Sedang Jalan</SelectItem>
                                    <SelectItem value="selesai">Selesai</SelectItem>
                                    <SelectItem value="batal">Batal</SelectItem>
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-gray-900 text-white rounded-xl p-4">
                        <p className="text-xs text-gray-400">Total Trip</p>
                        <p className="text-2xl font-bold">{summary.total_trip}</p>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-4">
                        <p className="text-xs text-violet-600">Total Uang Sangu</p>
                        <p className="text-lg font-bold text-violet-700">{formatRupiah(summary.total_uang_sangu)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600">Sedang Jalan</p>
                        <p className="text-2xl font-bold text-blue-700">{summary.trip_sedang_jalan}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600">Selesai</p>
                        <p className="text-2xl font-bold text-emerald-700">{summary.trip_selesai}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-600">Draft</p>
                        <p className="text-2xl font-bold text-gray-700">{summary.trip_draft}</p>
                    </div>
                </div>

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
                                    <div>
                                        <p className="text-xs text-gray-500">Total Sangu</p>
                                        <p className="text-lg font-bold text-gray-900">{formatRupiah(item.total_uang_sangu)}</p>
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rute</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Uang Sangu</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trips.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
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
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {trip.nama_asal || '-'} → {trip.nama_tujuan || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">{formatRupiah(trip.uang_sangu)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={trip.status} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {trips.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                                        <td className="px-4 py-3 text-right text-lg">{formatRupiah(summary.total_uang_sangu)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}