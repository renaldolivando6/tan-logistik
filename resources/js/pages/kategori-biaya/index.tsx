import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import { Tags, Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';

interface KategoriBiaya {
    id: number;
    nama: string;
    tipe: 'maintenance' | 'umum';
    keterangan: string | null;
    status_aktif: boolean;
    created_at: string;
}

interface Props {
    kategoriBiaya: KategoriBiaya[];
}

const TIPE_OPTIONS = [
    { value: 'maintenance', label: 'Maintenance', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    { value: 'umum', label: 'Umum', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' },
];

const getTipeStyle = (tipe: string) => {
    return TIPE_OPTIONS.find(t => t.value === tipe)?.color || 'bg-gray-50 text-gray-700';
};

const getTipeLabel = (tipe: string) => {
    return TIPE_OPTIONS.find(t => t.value === tipe)?.label || tipe;
};

const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {active ? 'Aktif' : 'Nonaktif'}
    </span>
);

const TipeBadge = ({ tipe }: { tipe: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${getTipeStyle(tipe)}`}>
        {getTipeLabel(tipe)}
    </span>
);

const ActionButton = ({ onClick, icon: Icon, variant, title }: {
    onClick: () => void;
    icon: React.ElementType;
    variant: 'view' | 'edit' | 'delete';
    title: string;
}) => {
    const styles = {
        view: 'text-blue-600 hover:bg-blue-50',
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

export default function KategoriBiayaIndex({ kategoriBiaya }: Props) {
    const [search, setSearch] = useState('');
    const [filterTipe, setFilterTipe] = useState<string>('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selected, setSelected] = useState<KategoriBiaya | null>(null);

    const createForm = useForm({
        nama: '',
        tipe: 'maintenance' as 'maintenance' | 'umum',
        keterangan: '',
        status_aktif: true,
    });

    const editForm = useForm({
        nama: '',
        tipe: 'maintenance' as 'maintenance' | 'umum',
        keterangan: '',
        status_aktif: true,
    });

    const filtered = kategoriBiaya.filter((item) => {
        const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) ||
            (item.keterangan?.toLowerCase().includes(search.toLowerCase()));
        const matchTipe = filterTipe === 'all' || item.tipe === filterTipe;
        return matchSearch && matchTipe;
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('kategori-biaya.store'), {
            onSuccess: () => { setCreateModalOpen(false); createForm.reset(); },
        });
    };

    const openEdit = (k: KategoriBiaya) => {
        setSelected(k);
        editForm.setData({
            nama: k.nama,
            tipe: k.tipe,
            keterangan: k.keterangan || '',
            status_aktif: k.status_aktif,
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('kategori-biaya.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); editForm.reset(); },
        });
    };

    const openView = (k: KategoriBiaya) => { setSelected(k); setViewModalOpen(true); };

    const handleDelete = (k: KategoriBiaya) => {
        if (confirm(`Hapus kategori "${k.nama}"?`)) {
            router.delete(route('kategori-biaya.destroy', k.id));
        }
    };

    const breadcrumbs = [
        { title: 'Master Data', href: route('dashboard') },
        { title: 'Kategori Biaya', href: route('kategori-biaya.index') },
    ];

    const stats = {
        total: kategoriBiaya.length,
        maintenance: kategoriBiaya.filter(k => k.tipe === 'maintenance').length,
        umum: kategoriBiaya.filter(k => k.tipe === 'umum').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Biaya" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                            <Tags className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Kategori Biaya</h1>
                            <p className="text-sm text-gray-500">Kelola kategori biaya operasional</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Kategori
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600 font-medium">Maintenance</p>
                        <p className="text-2xl font-bold text-amber-700">{stats.maintenance}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-600 font-medium">Umum</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.umum}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Cari nama kategori..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterTipe} onValueChange={setFilterTipe}>
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
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                        Keterangan
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Tags className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {search || filterTipe !== 'all' ? 'Tidak ditemukan' : 'Belum ada kategori'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search || filterTipe !== 'all' ? 'Coba filter lain' : 'Tambah kategori pertama Anda'}
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
                                    filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-900">{item.nama}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <TipeBadge tipe={item.tipe} />
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-gray-600 line-clamp-1">
                                                    {item.keterangan || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge active={item.status_aktif} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <ActionButton onClick={() => openView(item)} icon={Eye} variant="view" title="Lihat" />
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
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Kategori Biaya</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
                        <FormField label="Nama Kategori" required error={createForm.errors.nama}>
                            <Input
                                placeholder="Contoh: Ganti Oli, Listrik, dll"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tipe" required error={createForm.errors.tipe}>
                            <Select
                                value={createForm.data.tipe}
                                onValueChange={(v) => createForm.setData('tipe', v as 'maintenance' | 'umum')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance - Perawatan kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya operasional kantor</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Keterangan">
                            <textarea
                                rows={2}
                                placeholder="Deskripsi kategori (opsional)"
                                value={createForm.data.keterangan}
                                onChange={(e) => createForm.setData('keterangan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </FormField>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createForm.data.status_aktif}
                                onChange={(e) => createForm.setData('status_aktif', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Kategori aktif</span>
                        </label>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModalOpen(false)}>
                                Batal
                            </Button>
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
                        <DialogTitle>Edit Kategori Biaya</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
                        <FormField label="Nama Kategori" required error={editForm.errors.nama}>
                            <Input
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tipe" required error={editForm.errors.tipe}>
                            <Select
                                value={editForm.data.tipe}
                                onValueChange={(v) => editForm.setData('tipe', v as 'maintenance' | 'umum')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="maintenance">Maintenance - Perawatan kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya operasional kantor</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Keterangan">
                            <textarea
                                rows={2}
                                value={editForm.data.keterangan}
                                onChange={(e) => editForm.setData('keterangan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </FormField>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.data.status_aktif}
                                onChange={(e) => editForm.setData('status_aktif', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Kategori aktif</span>
                        </label>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="flex-1" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Update'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Detail Kategori</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 mt-2">
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-xl font-bold text-gray-900">{selected.nama}</p>
                                <div className="mt-2">
                                    <TipeBadge tipe={selected.tipe} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <StatusBadge active={selected.status_aktif} />
                                </div>

                                {selected.keterangan && (
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <p className="text-xs text-amber-600 font-medium mb-1">Keterangan</p>
                                        <p className="text-sm text-amber-900">{selected.keterangan}</p>
                                    </div>
                                )}
                            </div>

                            <Button className="w-full" onClick={() => setViewModalOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}