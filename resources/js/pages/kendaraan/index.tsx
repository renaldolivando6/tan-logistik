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
import { Truck, Plus, Search, Eye, Pencil, Trash2, X } from 'lucide-react';

interface Kendaraan {
    id: number;
    nomor_polisi: string;
    jenis: string;
    merk: string | null;
    tahun: number | null;
    kapasitas_ton: string | null;
    status_aktif: boolean;
    keterangan: string | null;
    created_at: string;
}

interface Props {
    kendaraan: Kendaraan[];
}

// Reusable Badge Component
const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        {active ? 'Aktif' : 'Nonaktif'}
    </span>
);

// Reusable Action Button
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

// Form Field Component
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

export default function KendaraanIndex({ kendaraan }: Props) {
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selected, setSelected] = useState<Kendaraan | null>(null);

    const createForm = useForm({
        nomor_polisi: '', jenis: '', merk: '', tahun: '',
        kapasitas_ton: '', status_aktif: true, keterangan: '',
    });

    const editForm = useForm({
        nomor_polisi: '', jenis: '', merk: '', tahun: '',
        kapasitas_ton: '', status_aktif: true, keterangan: '',
    });

    const filtered = kendaraan.filter((item) =>
        item.nomor_polisi.toLowerCase().includes(search.toLowerCase()) ||
        item.jenis.toLowerCase().includes(search.toLowerCase()) ||
        (item.merk?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('kendaraan.store'), {
            onSuccess: () => { setCreateModalOpen(false); createForm.reset(); },
        });
    };

    const openEdit = (k: Kendaraan) => {
        setSelected(k);
        editForm.setData({
            nomor_polisi: k.nomor_polisi,
            jenis: k.jenis,
            merk: k.merk || '',
            tahun: k.tahun?.toString() || '',
            kapasitas_ton: k.kapasitas_ton || '',
            status_aktif: k.status_aktif,
            keterangan: k.keterangan || '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('kendaraan.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); editForm.reset(); },
        });
    };

    const openView = (k: Kendaraan) => { setSelected(k); setViewModalOpen(true); };

    const handleDelete = (k: Kendaraan) => {
        if (confirm(`Hapus kendaraan ${k.nomor_polisi}?`)) {
            router.delete(route('kendaraan.destroy', k.id));
        }
    };

    const breadcrumbs = [
        { title: 'Master Data', href: '#' },
        { title: 'Kendaraan', href: route('kendaraan.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kendaraan" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl">
                            <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Data Kendaraan</h1>
                            <p className="text-sm text-gray-500">Kelola armada kendaraan</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Kendaraan
                    </Button>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Cari plat, jenis, atau merk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-3 text-sm ml-auto">
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{kendaraan.length}</span></span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">Aktif: <span className="font-semibold text-emerald-600">{kendaraan.filter(k => k.status_aktif).length}</span></span>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Kendaraan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                        Detail
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                                        Kapasitas
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Truck className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {search ? 'Tidak ditemukan' : 'Belum ada kendaraan'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search ? 'Coba kata kunci lain' : 'Tambah kendaraan pertama Anda'}
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
                                                <span className="font-semibold text-gray-900">{item.nomor_polisi}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-700">{item.jenis}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-gray-600">{item.merk || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-sm text-gray-600">{item.tahun || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-sm text-gray-600">
                                                    {item.kapasitas_ton ? `${item.kapasitas_ton} ton` : '-'}
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Kendaraan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField label="Nomor Polisi" required error={createForm.errors.nomor_polisi}>
                                <Input
                                    placeholder="B 1234 XYZ"
                                    value={createForm.data.nomor_polisi}
                                    onChange={(e) => createForm.setData('nomor_polisi', e.target.value.toUpperCase())}
                                />
                            </FormField>
                            <FormField label="Jenis" required error={createForm.errors.jenis}>
                                <Input
                                    placeholder="Truk, Pickup, dll"
                                    value={createForm.data.jenis}
                                    onChange={(e) => createForm.setData('jenis', e.target.value)}
                                />
                            </FormField>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <FormField label="Merk">
                                <Input
                                    placeholder="Mitsubishi"
                                    value={createForm.data.merk}
                                    onChange={(e) => createForm.setData('merk', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Tahun">
                                <Input
                                    type="number"
                                    placeholder="2020"
                                    value={createForm.data.tahun}
                                    onChange={(e) => createForm.setData('tahun', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Kapasitas (Ton)">
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="10"
                                    value={createForm.data.kapasitas_ton}
                                    onChange={(e) => createForm.setData('kapasitas_ton', e.target.value)}
                                />
                            </FormField>
                        </div>

                        <FormField label="Keterangan">
                            <textarea
                                rows={2}
                                placeholder="Catatan tambahan..."
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
                            <span className="text-sm text-gray-700">Kendaraan aktif</span>
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Kendaraan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField label="Nomor Polisi" required error={editForm.errors.nomor_polisi}>
                                <Input
                                    value={editForm.data.nomor_polisi}
                                    onChange={(e) => editForm.setData('nomor_polisi', e.target.value.toUpperCase())}
                                />
                            </FormField>
                            <FormField label="Jenis" required>
                                <Input
                                    value={editForm.data.jenis}
                                    onChange={(e) => editForm.setData('jenis', e.target.value)}
                                />
                            </FormField>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <FormField label="Merk">
                                <Input
                                    value={editForm.data.merk}
                                    onChange={(e) => editForm.setData('merk', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Tahun">
                                <Input
                                    type="number"
                                    value={editForm.data.tahun}
                                    onChange={(e) => editForm.setData('tahun', e.target.value)}
                                />
                            </FormField>
                            <FormField label="Kapasitas (Ton)">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.data.kapasitas_ton}
                                    onChange={(e) => editForm.setData('kapasitas_ton', e.target.value)}
                                />
                            </FormField>
                        </div>

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
                            <span className="text-sm text-gray-700">Kendaraan aktif</span>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Kendaraan</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 mt-2">
                            {/* Plat Number Highlight */}
                            <div className="bg-gray-900 text-white rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold tracking-wider">{selected.nomor_polisi}</p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard label="Jenis" value={selected.jenis} />
                                <InfoCard label="Merk" value={selected.merk || '-'} />
                                <InfoCard label="Tahun" value={selected.tahun?.toString() || '-'} />
                                <InfoCard label="Kapasitas" value={selected.kapasitas_ton ? `${selected.kapasitas_ton} ton` : '-'} />
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Status</span>
                                <StatusBadge active={selected.status_aktif} />
                            </div>

                            {/* Keterangan */}
                            {selected.keterangan && (
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <p className="text-xs text-amber-600 font-medium mb-1">Keterangan</p>
                                    <p className="text-sm text-amber-900">{selected.keterangan}</p>
                                </div>
                            )}

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

// Small info card for view modal
const InfoCard = ({ label, value }: { label: string; value: string }) => (
    <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
);