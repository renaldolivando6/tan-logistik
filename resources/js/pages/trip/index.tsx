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
import { Navigation, Plus, Search, Pencil, Trash2, Play, CheckCircle, XCircle, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

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
    status: 'draft' | 'berangkat' | 'selesai' | 'batal';
    status_uang_sangu: 'belum_selesai' | 'selesai';
    uang_dikembalikan: string | null;
    tanggal_pengembalian: string | null;
    selisih_uang: string | null;
    catatan_trip: string | null;
    catatan_pengembalian: string | null;
    created_at: string;
}

interface Props {
    trips: Trip[];
    kendaraan: Kendaraan[];
    filters?: {
        start_date?: string;
        end_date?: string;
    };
}

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 ring-gray-500/20' },
    berangkat: { label: 'Berangkat', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    selesai: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
    batal: { label: 'Batal', color: 'bg-red-50 text-red-700 ring-red-600/20' },
};

const StatusBadge = ({ status }: { status: keyof typeof STATUS_CONFIG }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_CONFIG[status].color}`}>
        {STATUS_CONFIG[status].label}
    </span>
);

const SanguBadge = ({ status }: { status: 'belum_selesai' | 'selesai' }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${status === 'selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        {status === 'selesai' ? 'Lunas' : 'Belum'}
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
    variant: 'view' | 'edit' | 'delete' | 'success' | 'danger' | 'warning';
    title: string;
    disabled?: boolean;
}) => {
    const styles = {
        view: 'text-blue-600 hover:bg-blue-50',
        edit: 'text-amber-600 hover:bg-amber-50',
        delete: 'text-red-600 hover:bg-red-50',
        success: 'text-emerald-600 hover:bg-emerald-50',
        danger: 'text-red-600 hover:bg-red-50',
        warning: 'text-amber-600 hover:bg-amber-50',
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

export default function TripIndex({ trips, kendaraan, filters }: Props) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [pengembalianModalOpen, setPengembalianModalOpen] = useState(false);
    const [selected, setSelected] = useState<Trip | null>(null);

    const createForm = useForm({
        tanggal_trip: new Date().toISOString().split('T')[0],
        kendaraan_id: '',
        uang_sangu: '',
        catatan_trip: '',
    });

    const editForm = useForm({
        tanggal_trip: '',
        kendaraan_id: '',
        uang_sangu: '',
        catatan_trip: '',
    });

    const pengembalianForm = useForm({
        uang_dikembalikan: '',
        tanggal_pengembalian: new Date().toISOString().split('T')[0],
        catatan_pengembalian: '',
    });

    const filtered = useMemo(() => {
        return trips.filter((item) => {
            const matchSearch = item.nomor_polisi?.toLowerCase().includes(search.toLowerCase()) ||
                item.catatan_trip?.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [trips, search, filterStatus]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterPeriode = () => {
        router.get(route('trip.index'), {
            start_date: startDate || null,
            end_date: endDate || null,
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
            berangkat: 'Tandai trip ini sudah BERANGKAT?',
            selesai: 'Tandai trip ini sudah SELESAI?',
            batal: 'BATALKAN trip ini?',
        };
        if (confirm(confirmMsg[newStatus as keyof typeof confirmMsg])) {
            router.patch(route('trip.update-status', t.id), { status: newStatus });
        }
    };

    const openPengembalian = (t: Trip) => {
        setSelected(t);
        pengembalianForm.setData({
            uang_dikembalikan: t.sisa_uang,
            tanggal_pengembalian: new Date().toISOString().split('T')[0],
            catatan_pengembalian: '',
        });
        setPengembalianModalOpen(true);
    };

    const handlePengembalian = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        pengembalianForm.post(route('trip.konfirmasi-pengembalian', selected.id), {
            onSuccess: () => { setPengembalianModalOpen(false); setSelected(null); },
        });
    };

    const breadcrumbs = [
        { title: 'Transaksi', href: route('dashboard') },
        { title: 'Trip', href: route('trip.index') },
    ];

    const stats = {
        total: trips.length,
        berangkat: trips.filter(t => t.status === 'berangkat').length,
        selesai: trips.filter(t => t.status === 'selesai').length,
        totalSangu: trips.reduce((sum, t) => sum + parseFloat(t.uang_sangu), 0),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trip" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
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

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total Trip</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600">Sedang Jalan</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.berangkat}</p>
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

                {/* Filter Periode */}
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

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Cari nomor polisi..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="berangkat">Berangkat</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
                            <SelectItem value="batal">Batal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">ID</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kendaraan</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Sangu</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Biaya</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Sisa</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Kembali</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
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
                                                <p className="font-medium text-gray-900">Belum ada trip</p>
                                                <Button size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                                                    <Plus className="w-4 h-4 mr-1" /> Tambah
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50">
                                            <td className="px-3 py-3">
                                                <span className="text-xs font-mono text-gray-500">#{item.id}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm font-medium text-gray-900">{formatDate(item.tanggal_trip)}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-gray-900 text-sm">{item.nomor_polisi}</div>
                                            </td>
                                            <td className="px-3 py-3 text-right hidden sm:table-cell">
                                                <span className="text-sm font-medium text-gray-900">{formatRupiah(item.uang_sangu)}</span>
                                            </td>
                                            <td className="px-3 py-3 text-right hidden md:table-cell">
                                                <span className="text-sm text-gray-600">{formatRupiah(item.total_biaya)}</span>
                                            </td>
                                            <td className="px-3 py-3 text-right hidden md:table-cell">
                                                <span className={`text-sm font-medium ${parseFloat(item.sisa_uang) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {formatRupiah(item.sisa_uang)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right hidden lg:table-cell">
                                                {item.uang_dikembalikan ? (
                                                    <span className="text-sm font-medium text-gray-900">{formatRupiah(item.uang_dikembalikan)}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    {/* Draft: Edit, Berangkat, Hapus */}
                                                    {item.status === 'draft' && (
                                                        <>
                                                            <ActionButton onClick={() => openEdit(item)} icon={Pencil} variant="edit" title="Edit" />
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'berangkat')} icon={Play} variant="success" title="Berangkat" />
                                                            <ActionButton onClick={() => handleDelete(item)} icon={Trash2} variant="delete" title="Hapus" />
                                                        </>
                                                    )}
                                                    {/* Berangkat + Sangu belum selesai: hanya Konfirmasi Sangu */}
                                                    {item.status === 'berangkat' && item.status_uang_sangu === 'belum_selesai' && (
                                                        <ActionButton onClick={() => openPengembalian(item)} icon={Wallet} variant="warning" title="Konfirmasi Sangu" />
                                                    )}
                                                    {/* Berangkat + Sangu sudah selesai: Selesai atau Batal */}
                                                    {item.status === 'berangkat' && item.status_uang_sangu === 'selesai' && (
                                                        <>
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'selesai')} icon={CheckCircle} variant="success" title="Selesai" />
                                                            <ActionButton onClick={() => handleUpdateStatus(item, 'batal')} icon={XCircle} variant="danger" title="Batalkan" />
                                                        </>
                                                    )}
                                                    {/* Selesai/Batal: tidak ada tombol */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Trip Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
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
                            <Button type="submit" className="flex-1" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Trip</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
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

                        <FormField label="Uang Sangu" required>
                            <Input type="number" value={editForm.data.uang_sangu} onChange={(e) => editForm.setData('uang_sangu', e.target.value)} />
                        </FormField>

                        <FormField label="Catatan">
                            <textarea rows={2} value={editForm.data.catatan_trip} onChange={(e) => editForm.setData('catatan_trip', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
                            <Button type="submit" className="flex-1" disabled={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Update'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Pengembalian Modal */}
            <Dialog open={pengembalianModalOpen} onOpenChange={setPengembalianModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Pengembalian Uang Sangu</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <form onSubmit={handlePengembalian} className="space-y-5 mt-2">
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Uang Sangu:</span>
                                    <span className="font-medium">{formatRupiah(selected.uang_sangu)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Biaya:</span>
                                    <span className="font-medium">{formatRupiah(selected.total_biaya)}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sisa Seharusnya:</span>
                                    <span className="font-semibold text-emerald-600">{formatRupiah(selected.sisa_uang)}</span>
                                </div>
                            </div>

                            <FormField label="Uang Dikembalikan" required error={pengembalianForm.errors.uang_dikembalikan}>
                                <Input
                                    type="number"
                                    value={pengembalianForm.data.uang_dikembalikan}
                                    onChange={(e) => pengembalianForm.setData('uang_dikembalikan', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Tanggal Pengembalian" required>
                                <Input
                                    type="date"
                                    value={pengembalianForm.data.tanggal_pengembalian}
                                    onChange={(e) => pengembalianForm.setData('tanggal_pengembalian', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Catatan">
                                <textarea
                                    rows={2}
                                    placeholder="Catatan jika ada selisih"
                                    value={pengembalianForm.data.catatan_pengembalian}
                                    onChange={(e) => pengembalianForm.setData('catatan_pengembalian', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                />
                            </FormField>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setPengembalianModalOpen(false)}>Batal</Button>
                                <Button type="submit" className="flex-1" disabled={pengembalianForm.processing}>
                                    {pengembalianForm.processing ? 'Menyimpan...' : 'Konfirmasi'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}