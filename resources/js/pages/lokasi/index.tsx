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
import { MapPin, Plus, Search, Pencil, Trash2 } from 'lucide-react';

interface Lokasi {
    id: number;
    nama_kota: string;
    status_aktif: boolean;
    created_at: string;
}

interface Props {
    lokasi: Lokasi[];
}

const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {active ? 'Aktif' : 'Nonaktif'}
    </span>
);

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

export default function LokasiIndex({ lokasi }: Props) {
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<Lokasi | null>(null);

    const createForm = useForm({
        nama_kota: '',
        status_aktif: true,
    });

    const editForm = useForm({
        nama_kota: '',
        status_aktif: true,
    });

    const filtered = useMemo(() => {
        return lokasi.filter((item) =>
            item.nama_kota?.toLowerCase().includes(search.toLowerCase())
        );
    }, [lokasi, search]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('lokasi.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEdit = (item: Lokasi) => {
        setSelected(item);
        editForm.setData({
            nama_kota: item.nama_kota,
            status_aktif: Boolean(item.status_aktif),
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('lokasi.update', selected.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelected(null);
            },
        });
    };

    const handleDelete = (item: Lokasi) => {
        if (confirm(`Hapus lokasi "${item.nama_kota}"?`)) {
            router.delete(route('lokasi.destroy', item.id));
        }
    };

    const breadcrumbs = [
        { title: 'Master Data', href: route('dashboard') },
        { title: 'Lokasi', href: route('lokasi.index') },
    ];

    const stats = {
        total: lokasi.length,
        aktif: lokasi.filter(l => l.status_aktif).length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lokasi" />

            <div className="p-4 sm:p-6 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 rounded-xl">
                            <MapPin className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Master Lokasi</h1>
                            <p className="text-sm text-gray-500">Kelola data kota</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Lokasi
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total Lokasi</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600">Aktif</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.aktif}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Cari kota..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nama Kota
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
                                        <td colSpan={3} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <MapPin className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {search ? 'Tidak ditemukan' : 'Belum ada lokasi'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search ? 'Coba kata kunci lain' : 'Tambah lokasi pertama Anda'}
                                                </p>
                                                {!search && (
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
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{item.nama_kota}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge active={item.status_aktif} />
                                            </td>
                                            <td className="px-4 py-3">
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
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Lokasi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
                        <FormField label="Nama Kota" required error={createForm.errors.nama_kota}>
                            <Input
                                placeholder="Contoh: Jakarta, Surabaya"
                                value={createForm.data.nama_kota}
                                onChange={(e) => createForm.setData('nama_kota', e.target.value)}
                            />
                        </FormField>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createForm.data.status_aktif}
                                onChange={(e) => createForm.setData('status_aktif', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Lokasi aktif</span>
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
                        <DialogTitle>Edit Lokasi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
                        <FormField label="Nama Kota" required error={editForm.errors.nama_kota}>
                            <Input
                                value={editForm.data.nama_kota}
                                onChange={(e) => editForm.setData('nama_kota', e.target.value)}
                            />
                        </FormField>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.data.status_aktif}
                                onChange={(e) => editForm.setData('status_aktif', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Lokasi aktif</span>
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
        </AppLayout>
    );
}