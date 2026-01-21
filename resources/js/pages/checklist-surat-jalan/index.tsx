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
import { FileCheck, Plus, Search, Pencil, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChecklistSuratJalan {
    id: number;
    nomor_surat_jalan: string;
    tanggal_surat: string;
    status: 'belum_selesai' | 'selesai';
    catatan: string | null;
    tanggal_checklist: string | null;
    created_at: string;
}

interface Props {
    checklist: ChecklistSuratJalan[];
    filters?: {
        start_date?: string;
        end_date?: string;
        status?: string;
    };
}

const StatusBadge = ({ status }: { status: 'belum_selesai' | 'selesai' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${status === 'selesai'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
            : 'bg-amber-50 text-amber-700 ring-amber-600/20'
        }`}>
        {status === 'selesai' ? 'Selesai' : 'Belum Selesai'}
    </span>
);

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

export default function ChecklistSuratJalanIndex({ checklist, filters }: Props) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>(filters?.status || 'all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selected, setSelected] = useState<ChecklistSuratJalan | null>(null);

    const createForm = useForm({
        nomor_surat_jalan: '',
        tanggal_surat: new Date().toISOString().split('T')[0],
        catatan: '',
    });

    const editForm = useForm({
        nomor_surat_jalan: '',
        tanggal_surat: '',
        catatan: '',
    });

    const filtered = useMemo(() => {
        return checklist.filter((item) => {
            const matchSearch = item.nomor_surat_jalan?.toLowerCase().includes(search.toLowerCase()) ||
                item.catatan?.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || item.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [checklist, search, filterStatus]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterPeriode = () => {
        router.get(route('checklist-surat-jalan.index'), {
            start_date: startDate || null,
            end_date: endDate || null,
            status: filterStatus !== 'all' ? filterStatus : null,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('checklist-surat-jalan.store'), {
            onSuccess: () => { setCreateModalOpen(false); createForm.reset(); },
        });
    };

    const openEdit = (item: ChecklistSuratJalan) => {
        setSelected(item);
        editForm.setData({
            nomor_surat_jalan: item.nomor_surat_jalan,
            tanggal_surat: item.tanggal_surat,
            catatan: item.catatan || '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('checklist-surat-jalan.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); },
        });
    };

    const handleDelete = (item: ChecklistSuratJalan) => {
        if (confirm(`Hapus surat jalan ${item.nomor_surat_jalan}?`)) {
            router.delete(route('checklist-surat-jalan.destroy', item.id));
        }
    };

    const handleToggleChecklist = (item: ChecklistSuratJalan) => {
        const action = item.status === 'belum_selesai' ? 'menyelesaikan' : 'membatalkan';
        if (confirm(`Yakin ingin ${action} checklist surat jalan ${item.nomor_surat_jalan}?`)) {
            router.post(route('checklist-surat-jalan.toggle-checklist', item.id));
        }
    };

    const breadcrumbs = [
        { title: 'Transaksi', href: route('dashboard') },
        { title: 'Checklist Surat Jalan', href: route('checklist-surat-jalan.index') },
    ];

    const stats = {
        total: checklist.length,
        selesai: checklist.filter(c => c.status === 'selesai').length,
        belumSelesai: checklist.filter(c => c.status === 'belum_selesai').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checklist Surat Jalan" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <FileCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Checklist Surat Jalan</h1>
                            <p className="text-sm text-gray-500">Kelola checklist surat jalan</p>
                        </div>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Surat Jalan
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600">Selesai</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.selesai}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600">Belum Selesai</p>
                        <p className="text-2xl font-bold text-amber-700">{stats.belumSelesai}</p>
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
                            <Button onClick={handleFilterPeriode} variant="outline" className="w-full">Filter</Button>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setFilterStatus('all');
                                router.get(route('checklist-surat-jalan.index'));
                            }} variant="ghost" className="w-full">Reset</Button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Cari nomor surat jalan..."
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
                            <SelectItem value="belum_selesai">Belum Selesai</SelectItem>
                            <SelectItem value="selesai">Selesai</SelectItem>
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
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nomor Surat</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tanggal</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Catatan</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Tgl Checklist</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <FileCheck className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">Belum ada surat jalan</p>
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
                                                <span className="text-sm font-semibold text-gray-900">{item.nomor_surat_jalan}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="text-sm text-gray-900">{formatDate(item.tanggal_surat)}</span>
                                            </td>
                                            <td className="px-3 py-3 hidden md:table-cell">
                                                <span className="text-sm text-gray-600">
                                                    {item.catatan || <span className="text-gray-400">-</span>}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 hidden lg:table-cell">
                                                {item.tanggal_checklist ? (
                                                    <span className="text-xs text-gray-600">{formatDateTime(item.tanggal_checklist)}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <ActionButton
                                                        onClick={() => handleToggleChecklist(item)}
                                                        icon={item.status === 'selesai' ? XCircle : CheckCircle}
                                                        variant={item.status === 'selesai' ? 'danger' : 'success'}
                                                        title={item.status === 'selesai' ? 'Batalkan' : 'Selesai'}
                                                    />
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
                        <DialogTitle>Tambah Surat Jalan Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-5 mt-2">
                        <FormField label="Nomor Surat Jalan" required error={createForm.errors.nomor_surat_jalan}>
                            <Input
                                placeholder="Contoh: SJ-001/2026"
                                value={createForm.data.nomor_surat_jalan}
                                onChange={(e) => createForm.setData('nomor_surat_jalan', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tanggal Surat" required error={createForm.errors.tanggal_surat}>
                            <Input
                                type="date"
                                value={createForm.data.tanggal_surat}
                                onChange={(e) => createForm.setData('tanggal_surat', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Catatan">
                            <textarea
                                rows={2}
                                placeholder="Catatan (opsional)"
                                value={createForm.data.catatan}
                                onChange={(e) => createForm.setData('catatan', e.target.value)}
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
                        <DialogTitle>Edit Surat Jalan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-5 mt-2">
                        <FormField label="Nomor Surat Jalan" required error={editForm.errors.nomor_surat_jalan}>
                            <Input
                                value={editForm.data.nomor_surat_jalan}
                                onChange={(e) => editForm.setData('nomor_surat_jalan', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tanggal Surat" required error={editForm.errors.tanggal_surat}>
                            <Input
                                type="date"
                                value={editForm.data.tanggal_surat}
                                onChange={(e) => editForm.setData('tanggal_surat', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Catatan">
                            <textarea
                                rows={2}
                                value={editForm.data.catatan}
                                onChange={(e) => editForm.setData('catatan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                            />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
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