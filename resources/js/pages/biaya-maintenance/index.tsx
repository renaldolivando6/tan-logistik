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
import { Receipt, Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Kendaraan {
    id: number;
    nomor_polisi: string;
    jenis: string;
}

interface KategoriBiaya {
    id: number;
    nama: string;
    tipe: 'maintenance' | 'umum';
}

interface BiayaMaintenance {
    id: number;
    tanggal: string;
    kendaraan_id: number | null;
    nomor_polisi: string | null;
    jenis_kendaraan: string | null;
    kategori_id: number;
    nama_kategori: string;
    tipe_kategori: 'maintenance' | 'umum';
    jumlah: string;
    keterangan: string | null;
    created_at: string;
}

interface Props {
    biayaMaintenance: BiayaMaintenance[];
    kendaraan: Kendaraan[];
    kategoriBiaya: KategoriBiaya[];
    filters?: {
        start_date?: string;
        end_date?: string;
    };
}

const TIPE_CONFIG = {
    maintenance: { label: 'Maintenance', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    umum: { label: 'Umum', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' },
};

const TipeBadge = ({ tipe }: { tipe: 'maintenance' | 'umum' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${TIPE_CONFIG[tipe].color}`}>
        {TIPE_CONFIG[tipe].label}
    </span>
);

const formatRupiah = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ActionButton = ({ onClick, icon: Icon, variant, title }: {
    onClick: () => void;
    icon: React.ElementType;
    variant: 'edit' | 'delete';
    title: string;
}) => {
    const styles = {
        edit: 'text-amber-600 hover:bg-amber-50',
        delete: 'text-red-600 hover:bg-red-50',
    };
    return (
        <button onClick={onClick} className={`p-2 rounded-lg transition-colors ${styles[variant]}`} title={title}>
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

export default function BiayaMaintenanceIndex({ biayaMaintenance, kendaraan, kategoriBiaya, filters }: Props) {
    const [search, setSearch] = useState('');
    const [filterTipe, setFilterTipe] = useState<string>('all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<BiayaMaintenance | null>(null);
    const [selectedTipe, setSelectedTipe] = useState<'maintenance' | 'umum' | ''>('');
    const [editSelectedTipe, setEditSelectedTipe] = useState<'maintenance' | 'umum' | ''>('');

    const createForm = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        tipe: '',
        kategori_id: '',
        kendaraan_id: '',
        jumlah: '',
        keterangan: '',
    });

    const editForm = useForm({
        tanggal: '',
        tipe: '',
        kategori_id: '',
        kendaraan_id: '',
        jumlah: '',
        keterangan: '',
    });

    const filteredKategori = useMemo(() => {
        return kategoriBiaya.filter(k => k.tipe === selectedTipe);
    }, [kategoriBiaya, selectedTipe]);

    const editFilteredKategori = useMemo(() => {
        return kategoriBiaya.filter(k => k.tipe === editSelectedTipe);
    }, [kategoriBiaya, editSelectedTipe]);

    const filtered = useMemo(() => {
        return biayaMaintenance.filter((item) => {
            const matchSearch = item.nama_kategori?.toLowerCase().includes(search.toLowerCase()) ||
                item.nomor_polisi?.toLowerCase().includes(search.toLowerCase()) ||
                item.keterangan?.toLowerCase().includes(search.toLowerCase());
            const matchTipe = filterTipe === 'all' || item.tipe_kategori === filterTipe;
            return matchSearch && matchTipe;
        });
    }, [biayaMaintenance, search, filterTipe]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterPeriode = () => {
        router.get(route('biaya-maintenance.index'), {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        });
    };

    const handleKategoriChange = (kategoriId: string, formType: 'create' | 'edit') => {
        if (formType === 'create') {
            createForm.setData('kategori_id', kategoriId);
        } else {
            editForm.setData('kategori_id', kategoriId);
        }
    };

    const handleTipeChange = (tipe: string) => {
        setSelectedTipe(tipe as 'maintenance' | 'umum');
        createForm.setData({
            ...createForm.data,
            tipe: tipe,
            kategori_id: '',
            kendaraan_id: '',
        });
    };

    const handleEditTipeChange = (tipe: string) => {
        setEditSelectedTipe(tipe as 'maintenance' | 'umum');
        editForm.setData({
            ...editForm.data,
            tipe: tipe,
            kategori_id: '',
            kendaraan_id: '',
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('biaya-maintenance.store'), {
            onSuccess: () => { 
                setCreateModalOpen(false); 
                createForm.reset(); 
                setSelectedTipe('');
            },
        });
    };

    const openEdit = (item: BiayaMaintenance) => {
        setSelected(item);
        setEditSelectedTipe(item.tipe_kategori);
        editForm.setData({
            tanggal: item.tanggal,
            tipe: item.tipe_kategori,
            kategori_id: item.kategori_id.toString(),
            kendaraan_id: item.kendaraan_id?.toString() || '',
            jumlah: item.jumlah,
            keterangan: item.keterangan || '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('biaya-maintenance.update', selected.id), {
            onSuccess: () => { 
                setEditModalOpen(false); 
                setSelected(null); 
                setEditSelectedTipe('');
            },
        });
    };

    const handleDelete = (item: BiayaMaintenance) => {
        if (confirm(`Hapus biaya ${item.nama_kategori} tanggal ${formatDate(item.tanggal)}?`)) {
            router.delete(route('biaya-maintenance.destroy', item.id));
        }
    };

    const breadcrumbs = [
        { title: 'Transaksi', href: route('dashboard') },
        { title: 'Biaya Maintenance', href: route('biaya-maintenance.index') },
    ];

    const stats = {
        total: biayaMaintenance.length,
        maintenance: biayaMaintenance.filter(b => b.tipe_kategori === 'maintenance').length,
        umum: biayaMaintenance.filter(b => b.tipe_kategori === 'umum').length,
        totalBiaya: biayaMaintenance.reduce((sum, b) => sum + parseFloat(b.jumlah), 0),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biaya Maintenance" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 rounded-xl">
                            <Receipt className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Biaya Maintenance</h1>
                            <p className="text-sm text-gray-500">Kelola biaya operasional & maintenance</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Biaya
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total Transaksi</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600">Maintenance</p>
                        <p className="text-2xl font-bold text-amber-700">{stats.maintenance}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-600">Umum</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.umum}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs text-purple-600">Total Biaya</p>
                        <p className="text-lg font-bold text-purple-700">{formatRupiah(stats.totalBiaya)}</p>
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
                            <Button onClick={() => { setStartDate(''); setEndDate(''); router.get(route('biaya-maintenance.index')); }} variant="ghost" className="w-full">Reset</Button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Cari kategori, kendaraan..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterTipe} onValueChange={(v) => { setFilterTipe(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="umum">Umum</SelectItem>
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
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kendaraan</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Receipt className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {search || filterTipe !== 'all' ? 'Tidak ditemukan' : 'Belum ada biaya'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search || filterTipe !== 'all' ? 'Coba filter lain' : 'Tambah biaya pertama Anda'}
                                                </p>
                                                {!search && filterTipe === 'all' && (
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
                                                <span className="text-sm text-gray-500 font-mono">#{item.id}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm font-medium text-gray-900">{formatDate(item.tanggal)}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-semibold text-gray-900 text-sm">{item.nama_kategori}</div>
                                                {item.keterangan && (
                                                    <div className="text-xs text-gray-500 line-clamp-1">{item.keterangan}</div>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm text-gray-900">{item.nomor_polisi || '-'}</span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className="text-sm font-medium text-gray-900">{formatRupiah(item.jumlah)}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <TipeBadge tipe={item.tipe_kategori} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <ActionButton onClick={() => openEdit(item)} icon={Pencil} variant="edit" title="Edit" />
                                                    <ActionButton onClick={() => handleDelete(item)} icon={Trash2} variant="delete" title="Hapus" />
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
                        <DialogTitle>Tambah Biaya</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
                        <FormField label="Tanggal" required error={createForm.errors.tanggal}>
                            <Input
                                type="date"
                                value={createForm.data.tanggal}
                                onChange={(e) => createForm.setData('tanggal', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tipe Biaya" required error={createForm.errors.tipe}>
                            <Select value={createForm.data.tipe} onValueChange={handleTipeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe biaya" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance - Perawatan Kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya Operasional</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        {selectedTipe && (
                            <FormField label="Kategori" required error={createForm.errors.kategori_id}>
                                <Select value={createForm.data.kategori_id} onValueChange={(v) => handleKategoriChange(v, 'create')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredKategori.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {selectedTipe === 'maintenance' && (
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
                        )}

                        <FormField label="Jumlah" required error={createForm.errors.jumlah}>
                            <Input
                                type="number"
                                placeholder="0"
                                value={createForm.data.jumlah}
                                onChange={(e) => createForm.setData('jumlah', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Keterangan">
                            <textarea
                                rows={2}
                                placeholder="Keterangan (opsional)"
                                value={createForm.data.keterangan}
                                onChange={(e) => createForm.setData('keterangan', e.target.value)}
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
                        <DialogTitle>Edit Biaya</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
                        <FormField label="Tanggal" required>
                            <Input type="date" value={editForm.data.tanggal} onChange={(e) => editForm.setData('tanggal', e.target.value)} />
                        </FormField>

                        <FormField label="Tipe Biaya" required>
                            <Select value={editForm.data.tipe} onValueChange={handleEditTipeChange}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance - Perawatan Kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya Operasional</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        {editSelectedTipe && (
                            <FormField label="Kategori" required>
                                <Select value={editForm.data.kategori_id} onValueChange={(v) => handleKategoriChange(v, 'edit')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {editFilteredKategori.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {editSelectedTipe === 'maintenance' && (
                            <FormField label="Kendaraan" required>
                                <Select value={editForm.data.kendaraan_id} onValueChange={(v) => editForm.setData('kendaraan_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                                    <SelectContent>
                                        {kendaraan.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.nomor_polisi} - {k.jenis}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        <FormField label="Jumlah" required>
                            <Input type="number" value={editForm.data.jumlah} onChange={(e) => editForm.setData('jumlah', e.target.value)} />
                        </FormField>

                        <FormField label="Keterangan">
                            <textarea rows={2} value={editForm.data.keterangan} onChange={(e) => editForm.setData('keterangan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
                            <Button type="submit" className="flex-1" disabled={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Update'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}