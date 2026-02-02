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
import { Users, Plus, Search, Eye, Pencil, Trash2, Phone, MapPin } from 'lucide-react';

interface Pelanggan {
    id: number;
    nama: string;
    no_telepon: string;
    alamat: string | null;
    status_aktif: boolean;
    created_at: string;
}

interface Props {
    pelanggan: Pelanggan[];
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

export default function PelangganIndex({ pelanggan }: Props) {
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selected, setSelected] = useState<Pelanggan | null>(null);

    const createForm = useForm({
        nama: '',
        no_telepon: '',
        alamat: '',
        status_aktif: true,
    });

    const editForm = useForm({
        nama: '',
        no_telepon: '',
        alamat: '',
        status_aktif: true,
    });

    const filtered = pelanggan.filter((item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.no_telepon.toLowerCase().includes(search.toLowerCase()) ||
        (item.alamat?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('pelanggan.store'), {
            onSuccess: () => { setCreateModalOpen(false); createForm.reset(); },
        });
    };

    const openEdit = (p: Pelanggan) => {
        setSelected(p);
        editForm.setData({
            nama: p.nama,
            no_telepon: p.no_telepon,
            alamat: p.alamat || '',
            status_aktif: p.status_aktif,
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('pelanggan.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); editForm.reset(); },
        });
    };

    const openView = (p: Pelanggan) => { setSelected(p); setViewModalOpen(true); };

    const handleDelete = (p: Pelanggan) => {
        if (confirm(`Hapus pelanggan ${p.nama}?`)) {
            router.delete(route('pelanggan.destroy', p.id));
        }
    };

    const breadcrumbs = [
        { title: 'Master Data', href: '#' },
        { title: 'Pelanggan', href: route('pelanggan.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelanggan" />

            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 rounded-xl">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Data Pelanggan</h1>
                            <p className="text-sm text-gray-500">Kelola data pelanggan</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Pelanggan
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            placeholder="Cari nama, telepon, atau alamat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-3 text-sm ml-auto">
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{pelanggan.length}</span></span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500">Aktif: <span className="font-semibold text-emerald-600">{pelanggan.filter(p => p.status_aktif).length}</span></span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Telepon</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Alamat</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Users className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">{search ? 'Tidak ditemukan' : 'Belum ada pelanggan'}</p>
                                                <p className="text-sm text-gray-500 mt-1">{search ? 'Coba kata kunci lain' : 'Tambah pelanggan pertama Anda'}</p>
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
                                            <td className="px-4 py-3"><span className="text-xs font-mono text-gray-500">#{item.id}</span></td>
                                            <td className="px-4 py-3"><span className="font-semibold text-gray-900">{item.nama}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {item.no_telepon}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600 max-w-xs truncate">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {item.alamat || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge active={item.status_aktif} /></td>
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

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
                    <div className="space-y-5 mt-2">
                        <FormField label="Nama Pelanggan" required error={createForm.errors.nama}>
                            <Input placeholder="Nama lengkap pelanggan" value={createForm.data.nama} onChange={(e) => createForm.setData('nama', e.target.value)} />
                        </FormField>
                        <FormField label="No. Telepon" required error={createForm.errors.no_telepon}>
                            <Input placeholder="08123456789" value={createForm.data.no_telepon} onChange={(e) => createForm.setData('no_telepon', e.target.value)} />
                        </FormField>
                        <FormField label="Alamat">
                            <textarea rows={3} placeholder="Alamat lengkap pelanggan..." value={createForm.data.alamat} onChange={(e) => createForm.setData('alamat', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                        </FormField>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={createForm.data.status_aktif} onChange={(e) => createForm.setData('status_aktif', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-gray-700">Pelanggan aktif</span>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModalOpen(false)}>Batal</Button>
                            <Button className="flex-1" disabled={createForm.processing} onClick={handleCreate}>{createForm.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Edit Pelanggan</DialogTitle></DialogHeader>
                    <div className="space-y-5 mt-2">
                        <FormField label="Nama Pelanggan" required error={editForm.errors.nama}>
                            <Input value={editForm.data.nama} onChange={(e) => editForm.setData('nama', e.target.value)} />
                        </FormField>
                        <FormField label="No. Telepon" required error={editForm.errors.no_telepon}>
                            <Input value={editForm.data.no_telepon} onChange={(e) => editForm.setData('no_telepon', e.target.value)} />
                        </FormField>
                        <FormField label="Alamat">
                            <textarea rows={3} value={editForm.data.alamat} onChange={(e) => editForm.setData('alamat', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                        </FormField>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editForm.data.status_aktif} onChange={(e) => editForm.setData('status_aktif', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-gray-700">Pelanggan aktif</span>
                        </label>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
                            <Button className="flex-1" disabled={editForm.processing} onClick={handleUpdate}>{editForm.processing ? 'Menyimpan...' : 'Update'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Detail Pelanggan</DialogTitle></DialogHeader>
                    {selected && (
                        <div className="space-y-4 mt-2">
                            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                                <p className="text-xs text-purple-600 font-medium mb-1">ID Pelanggan</p>
                                <p className="text-2xl font-bold text-purple-700">#{selected.id}</p>
                            </div>
                            <div className="space-y-3">
                                <InfoCard label="Nama" value={selected.nama} icon={Users} />
                                <InfoCard label="No. Telepon" value={selected.no_telepon} icon={Phone} />
                                <InfoCard label="Alamat" value={selected.alamat || '-'} icon={MapPin} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Status</span>
                                <StatusBadge active={selected.status_aktif} />
                            </div>
                            <Button className="w-full" onClick={() => setViewModalOpen(false)}>Tutup</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

const InfoCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
    <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs text-gray-500">{label}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
);