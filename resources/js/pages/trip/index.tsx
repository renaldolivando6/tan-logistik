import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Navigation, Plus, Search, Pencil, Trash2, Play, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Kendaraan {
    id: number;
    nomor_polisi: string;
    jenis: string;
}

interface Lokasi {
    id: number;
    nama_kota: string;
    status_aktif: boolean;
}

interface Pelanggan {
    id: number;
    nama: string;
    status_aktif: boolean;
}

interface Trip {
    id: number;
    tanggal_trip: string;
    kendaraan_id: number;
    pelanggan_id: number;
    nomor_polisi: string;
    jenis_kendaraan: string;
    nama_pelanggan: string;
    asal_id: number | null;
    tujuan_id: number | null;
    nama_asal: string | null;
    nama_tujuan: string | null;
    uang_sangu: string;
    status: 'draft' | 'sedang_jalan' | 'selesai' | 'batal';
    catatan_trip: string | null;
    created_at: string;
}

interface Props {
    trips: Trip[];
    kendaraan: Kendaraan[];
    lokasi: Lokasi[];
    pelanggan: Pelanggan[];
    filters?: {
        start_date?: string;
        end_date?: string;
    };
}

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
    sedang_jalan: { label: 'Sedang Jalan', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    selesai: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
    batal: { label: 'Batal', color: 'bg-red-50 text-red-700 ring-red-600/20' },
};

const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_CONFIG[status].color}`}>
        {STATUS_CONFIG[status].label}
    </span>
);

const formatRupiah = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ActionButton = ({ onClick, icon: Icon, variant, title, disabled }: {
    onClick: () => void;
    icon: React.ElementType;
    variant: 'edit' | 'delete' | 'success' | 'danger';
    title: string;
    disabled?: boolean;
}) => {
    const styles = {
        edit: 'text-amber-600 hover:bg-amber-50',
        delete: 'text-red-600 hover:bg-red-50',
        success: 'text-emerald-600 hover:bg-emerald-50',
        danger: 'text-red-600 hover:bg-red-50',
    };
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors ${styles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
            disabled={disabled}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

const FormField = ({ label, required, error, children }: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {children}
        {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
);

const ITEMS_PER_PAGE = 10;

export default function TripIndex({ trips, kendaraan, lokasi, pelanggan, filters }: Props) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<Trip | null>(null);

    const createForm = useForm({
        tanggal_trip: new Date().toISOString().split('T')[0],
        kendaraan_id: '',
        pelanggan_id: '',
        asal_id: '',
        tujuan_id: '',
        uang_sangu: '',
        catatan_trip: '',
    });

    const editForm = useForm({
        tanggal_trip: '',
        kendaraan_id: '',
        pelanggan_id: '',
        asal_id: '',
        tujuan_id: '',
        uang_sangu: '',
        catatan_trip: '',
    });

    const filtered = useMemo(() => {
        return trips.filter((item) => {
            const matchSearch = item.nomor_polisi?.toLowerCase().includes(search.toLowerCase()) ||
                item.nama_pelanggan?.toLowerCase().includes(search.toLowerCase()) ||
                item.nama_asal?.toLowerCase().includes(search.toLowerCase()) ||
                item.nama_tujuan?.toLowerCase().includes(search.toLowerCase()) ||
                item.catatan_trip?.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [trips, search, filterStatus]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterPeriode = () => {
        router.get(route('trip.index'), {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('trip.store'), {
            onSuccess: () => { setCreateModalOpen(false); createForm.reset(); },
        });
    };

    const openEdit = (t: Trip) => {
        setSelected(t);
        editForm.setData({
            tanggal_trip: t.tanggal_trip,
            kendaraan_id: t.kendaraan_id.toString(),
            pelanggan_id: t.pelanggan_id.toString(),
            asal_id: t.asal_id?.toString() || '',
            tujuan_id: t.tujuan_id?.toString() || '',
            uang_sangu: t.uang_sangu,
            catatan_trip: t.catatan_trip || '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('trip.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); },
        });
    };

    const handleDelete = (t: Trip) => {
        if (confirm(`Hapus trip ${t.nomor_polisi} tanggal ${formatDate(t.tanggal_trip)}?`)) {
            router.delete(route('trip.destroy', t.id));
        }
    };

    const handleUpdateStatus = (t: Trip, newStatus: string) => {
        const confirmMsg = {
            sedang_jalan: 'Tandai trip ini SEDANG JALAN?',
            selesai: 'Tandai trip ini sudah SELESAI?',
            batal: 'BATALKAN trip ini?',
        };
        if (confirm(confirmMsg[newStatus as keyof typeof confirmMsg])) {
            router.patch(route('trip.update-status', t.id), { status: newStatus });
        }
    };

    const breadcrumbs = [
        { title: 'Transaksi', href: route('dashboard') },
        { title: 'Trip', href: route('trip.index') },
    ];

    const stats = {
        total: trips.length,
        sedang_jalan: trips.filter(t => t.status === 'sedang_jalan').length,
        selesai: trips.filter(t => t.status === 'selesai').length,
        totalSangu: trips.reduce((sum, t) => sum + parseFloat(t.uang_sangu), 0),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trip" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <Navigation className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Data Trip</h1>
                            <p className="text-sm text-gray-500">Kelola perjalanan kendaraan</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Trip
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total Trip</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600">Sedang Jalan</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.sedang_jalan}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600">Selesai</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.selesai}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600">Total Uang Sangu</p>
                        <p className="text-lg font-bold text-amber-700">{formatRupiah(stats.totalSangu)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Dari Tanggal</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Sampai Tanggal</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleFilterPeriode} variant="outline" className="w-full">Filter Periode</Button>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={() => { setStartDate(''); setEndDate(''); router.get(route('trip.index')); }} variant="ghost" className="w-full">Reset</Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Cari plat, pelanggan, rute..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Status Trip" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sedang_jalan">Sedang Jalan</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="batal">Batal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">ID</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kendaraan</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pelanggan</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rute</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Uang Sangu</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Catatan</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Navigation className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {search || filterStatus !== 'all' ? 'Tidak ditemukan' : 'Belum ada trip'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search || filterStatus !== 'all' ? 'Coba filter lain' : 'Tambah trip pertama Anda'}
                                                </p>
                                                {!search && filterStatus === 'all' && (
                                                    <Button size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                                                        <Plus className="w-4 h-4 mr-1" /> Tambah
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-3 py-3">
                                                <span className="text-xs font-mono text-gray-500">#{item.id}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm font-medium text-gray-900">{formatDate(item.tanggal_trip)}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-gray-900 text-sm">{item.nomor_polisi}</div>
                                                <div className="text-xs text-gray-500">{item.jenis_kendaraan}</div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm text-gray-900">{item.nama_pelanggan}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="text-sm text-gray-900">
                                                    {item.nama_asal || '-'} → {item.nama_tujuan || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className="text-sm font-medium text-gray-900">{formatRupiah(item.uang_sangu)}</span>
                                            </td>
                                            <td className="px-3 py-3 max-w-xs">
                                                <span className="text-sm text-gray-600 truncate block" title={item.catatan_trip || ''}>
                                                    {item.catatan_trip || '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    {item.status === 'draft' && (
                                                        <>
                                                            <ActionButton onClick={() => openEdit(item)} icon={Pencil} variant="edit" title="Edit" />
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'sedang_jalan')} icon={Play} variant="success" title="Sedang Jalan" />
                                                            <ActionButton onClick={() => handleDelete(item)} icon={Trash2} variant="delete" title="Hapus" />
                                                        </>
                                                    )}
                                                    {item.status === 'sedang_jalan' && (
                                                        <>
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'selesai')} icon={CheckCircle} variant="success" title="Selesai" />
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'batal')} icon={XCircle} variant="danger" title="Batalkan" />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-gray-500">
                                Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Trip Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 mt-2">
                        <FormField label="Tanggal Trip" required error={createForm.errors.tanggal_trip}>
                            <Input
                                type="date"
                                value={createForm.data.tanggal_trip}
                                onChange={(e) => createForm.setData('tanggal_trip', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Kendaraan" required error={createForm.errors.kendaraan_id}>
                            <Select value={createForm.data.kendaraan_id} onValueChange={(v) => createForm.setData('kendaraan_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kendaraan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kendaraan.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>
                                            {k.nomor_polisi} - {k.jenis}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Pelanggan" required error={createForm.errors.pelanggan_id}>
                            <Select value={createForm.data.pelanggan_id} onValueChange={(v) => createForm.setData('pelanggan_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih pelanggan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pelanggan.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Asal" error={createForm.errors.asal_id}>
                                <Select value={createForm.data.asal_id || 'none'} onValueChange={(v) => createForm.setData('asal_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih asal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {lokasi.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>
                                                {l.nama_kota}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Tujuan" error={createForm.errors.tujuan_id}>
                                <Select value={createForm.data.tujuan_id || 'none'} onValueChange={(v) => createForm.setData('tujuan_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tujuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {lokasi.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>
                                                {l.nama_kota}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <FormField label="Uang Sangu" required error={createForm.errors.uang_sangu}>
                            <Input
                                type="number"
                                placeholder="0"
                                value={createForm.data.uang_sangu}
                                onChange={(e) => createForm.setData('uang_sangu', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Catatan">
                            <textarea
                                rows={2}
                                placeholder="Catatan trip (opsional)"
                                value={createForm.data.catatan_trip}
                                onChange={(e) => createForm.setData('catatan_trip', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModalOpen(false)}>Batal</Button>
                            <Button className="flex-1" disabled={createForm.processing} onClick={handleCreate}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Trip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 mt-2">
                        <FormField label="Tanggal Trip" required>
                            <Input type="date" value={editForm.data.tanggal_trip} onChange={(e) => editForm.setData('tanggal_trip', e.target.value)} />
                        </FormField>

                        <FormField label="Kendaraan" required>
                            <Select value={editForm.data.kendaraan_id} onValueChange={(v) => editForm.setData('kendaraan_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {kendaraan.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.nomor_polisi} - {k.jenis}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Pelanggan" required>
                            <Select value={editForm.data.pelanggan_id} onValueChange={(v) => editForm.setData('pelanggan_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {pelanggan.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Asal">
                                <Select value={editForm.data.asal_id || 'none'} onValueChange={(v) => editForm.setData('asal_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih asal" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {lokasi.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>{l.nama_kota}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Tujuan">
                                <Select value={editForm.data.tujuan_id || 'none'} onValueChange={(v) => editForm.setData('tujuan_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih tujuan" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {lokasi.map((l) => (
                                            <SelectItem key={l.id} value={l.id.toString()}>{l.nama_kota}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <FormField label="Uang Sangu" required>
                            <Input type="number" value={editForm.data.uang_sangu} onChange={(e) => editForm.setData('uang_sangu', e.target.value)} />
                        </FormField>

                        <FormField label="Catatan">
                            <textarea rows={2} value={editForm.data.catatan_trip} onChange={(e) => editForm.setData('catatan_trip', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
                            <Button className="flex-1" disabled={editForm.processing} onClick={handleUpdate}>{editForm.processing ? 'Menyimpan...' : 'Update'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}