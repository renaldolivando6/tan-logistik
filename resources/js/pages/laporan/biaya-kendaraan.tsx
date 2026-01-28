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
import { FileBarChart, Filter, Download, Truck, Receipt, Wrench, Building2 } from 'lucide-react';

interface Kendaraan {
    id: number;
    nomor_polisi: string;
    jenis: string;
}

interface SummaryKendaraan {
    kendaraan_id: number;
    nomor_polisi: string;
    jenis: string;
    total_biaya: string;
    jumlah_transaksi: number;
}

interface SummaryKategori {
    nama: string;
    tipe: string;
    total: string;
}

interface BiayaDetail {
    id: number;
    tanggal: string;
    kendaraan_id: number | null;
    nomor_polisi: string | null;
    jenis_kendaraan: string | null;
    nama_kategori: string;
    tipe_kategori: string;
    jumlah: string;
    keterangan: string | null;
}

interface Props {
    filters: {
        start_date: string;
        end_date: string;
        kendaraan_id: string | null;
        show_umum: boolean;
    };
    kendaraanList: Kendaraan[];
    summaryPerKendaraan: SummaryKendaraan[];
    summaryPerKategori: SummaryKategori[];
    summaryPerTipe: Record<string, { tipe: string; total: string }>;
    detail: BiayaDetail[];
    grandTotal: number;
}

const formatRupiah = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TIPE_CONFIG = {
    maintenance: { label: 'Maintenance', color: 'bg-amber-50 text-amber-700', icon: Wrench },
    umum: { label: 'Umum', color: 'bg-gray-100 text-gray-700', icon: Building2 },
};

const TipeBadge = ({ tipe }: { tipe: string }) => {
    const config = TIPE_CONFIG[tipe as keyof typeof TIPE_CONFIG];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config?.color || 'bg-gray-100'}`}>
            {config?.label || tipe}
        </span>
    );
};

export default function LaporanBiayaKendaraan({
    filters,
    kendaraanList,
    summaryPerKendaraan,
    summaryPerKategori,
    summaryPerTipe,
    detail,
    grandTotal,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [kendaraanId, setKendaraanId] = useState(filters.kendaraan_id || 'all');

    const handleFilter = () => {
        router.get(route('laporan.biaya-kendaraan'), {
            start_date: startDate,
            end_date: endDate,
            kendaraan_id: kendaraanId === 'all' ? null : kendaraanId,
        });
    };

    const handleShowUmum = () => {
        router.get(route('laporan.biaya-kendaraan'), {
            start_date: startDate,
            end_date: endDate,
            show_umum: true,
        });
    };

    const handleShowAll = () => {
        setKendaraanId('all');
        router.get(route('laporan.biaya-kendaraan'), {
            start_date: startDate,
            end_date: endDate,
        });
    };

    const handleExport = () => {
        const headers = ['Tanggal', 'Kendaraan', 'Kategori', 'Tipe', 'Jumlah', 'Keterangan'];
        const rows = detail.map(d => [
            d.tanggal,
            d.nomor_polisi || 'Umum',
            d.nama_kategori,
            d.tipe_kategori,
            d.jumlah,
            d.keterangan || ''
        ]);

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-biaya-${startDate}-${endDate}.csv`;
        a.click();
    };

    const breadcrumbs = [
        { title: 'Laporan', href: route('dashboard') },
        { title: 'Biaya per Kendaraan', href: route('laporan.biaya-kendaraan') },
    ];

    const maintenanceTotal = parseFloat(summaryPerTipe.maintenance?.total || '0');
    const umumTotal = parseFloat(summaryPerTipe.umum?.total || '0');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Biaya per Kendaraan" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-xl">
                            <FileBarChart className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Laporan Biaya per Kendaraan</h1>
                            <p className="text-sm text-gray-500">Analisis biaya maintenance & operasional</p>
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
                            <Label className="text-sm">Kendaraan</Label>
                            <Select value={kendaraanId} onValueChange={setKendaraanId}>
                                <SelectTrigger><SelectValue placeholder="Semua" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kendaraan</SelectItem>
                                    {kendaraanList.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.nomor_polisi}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2 sm:col-span-2">
                            <Button onClick={handleFilter} className="flex-1">Terapkan</Button>
                            <Button
                                onClick={handleShowUmum}
                                variant={filters.show_umum ? "default" : "outline"}
                                className="flex-1"
                            >
                                <Building2 className="w-4 h-4 mr-1.5" />
                                Biaya Umum
                            </Button>
                        </div>
                    </div>
                    {/* Active filter indicator */}
                    {(filters.kendaraan_id || filters.show_umum) && (
                        <div className="mt-4 pt-4 border-t flex items-center gap-2">
                            <span className="text-sm text-gray-500">Filter aktif:</span>
                            {filters.kendaraan_id && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                    <Truck className="w-3 h-3" />
                                    {kendaraanList.find(k => k.id.toString() === filters.kendaraan_id)?.nomor_polisi}
                                </span>
                            )}
                            {filters.show_umum && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                    <Building2 className="w-3 h-3" />
                                    Biaya Umum Saja
                                </span>
                            )}
                            <button onClick={handleShowAll} className="text-sm text-red-600 hover:underline ml-2">
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-900 text-white rounded-xl p-4">
                        <p className="text-xs text-gray-400">Total Biaya</p>
                        <p className="text-xl font-bold">{formatRupiah(grandTotal)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Wrench className="w-4 h-4 text-amber-600" />
                            <p className="text-xs text-amber-600">Maintenance</p>
                        </div>
                        <p className="text-xl font-bold text-amber-700">{formatRupiah(maintenanceTotal)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-gray-600" />
                            <p className="text-xs text-gray-600">Biaya Umum</p>
                        </div>
                        <p className="text-xl font-bold text-gray-700">{formatRupiah(umumTotal)}</p>
                    </div>
                </div>

                {/* Summary per Kendaraan */}
                {summaryPerKendaraan.length > 0 && !filters.show_umum && (
                    <div className="bg-white rounded-xl border p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Ringkasan per Kendaraan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {summaryPerKendaraan.map((item) => (
                                <div key={item.kendaraan_id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.nomor_polisi}</p>
                                            <p className="text-xs text-gray-500">{item.jenis}</p>
                                        </div>
                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                            {item.jumlah_transaksi} transaksi
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{formatRupiah(item.total_biaya)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary per Kategori */}
                {summaryPerKategori.length > 0 && (
                    <div className="bg-white rounded-xl border p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Ringkasan per Kategori
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 text-sm font-medium text-gray-600">Kategori</th>
                                        <th className="text-left py-2 text-sm font-medium text-gray-600">Tipe</th>
                                        <th className="text-right py-2 text-sm font-medium text-gray-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {summaryPerKategori.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2 font-medium text-gray-900">{item.nama}</td>
                                            <td className="py-2"><TipeBadge tipe={item.tipe} /></td>
                                            <td className="py-2 text-right font-semibold">{formatRupiah(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Detail Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Detail Transaksi</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kendaraan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Keterangan</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {detail.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                            Tidak ada data untuk periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    detail.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-sm">{formatDate(item.tanggal)}</td>
                                            <td className="px-4 py-3">
                                                {item.nomor_polisi ? (
                                                    <span className="font-medium text-gray-900">{item.nomor_polisi}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Umum</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{item.nama_kategori}</div>
                                                <TipeBadge tipe={item.tipe_kategori} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                                                {item.keterangan || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                {formatRupiah(item.jumlah)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {detail.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={4} className="px-4 py-3 text-right">Total</td>
                                        <td className="px-4 py-3 text-right text-lg">{formatRupiah(grandTotal)}</td>
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