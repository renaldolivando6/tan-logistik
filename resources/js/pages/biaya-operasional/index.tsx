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
import { Receipt, Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
    uang_sangu: string;
}

interface KategoriBiaya {
    id: number;
    nama: string;
    tipe: 'trip' | 'maintenance' | 'umum';
}

interface BiayaOperasional {
    id: number;
    tanggal: string;
    trip_id: number | null;
    kendaraan_id: number | null;
    kategori_id: number;
    jumlah: string;
    keterangan: string | null;
    tanggal_trip: string | null;
    nomor_polisi: string | null;
    jenis_kendaraan: string | null;
    nama_kategori: string;
    tipe_kategori: 'trip' | 'maintenance' | 'umum';
    created_at: string;
}

interface Props {
    biayaOperasional: BiayaOperasional[];
    trips: Trip[];
    kendaraan: Kendaraan[];
    kategoriBiaya: KategoriBiaya[];
    filters?: {
        start_date?: string;
        end_date?: string;
    };
}

const TIPE_CONFIG = {
    trip: { label: 'Trip', color: 'bg-blue-50 text-blue-700' },
    maintenance: { label: 'Maintenance', color: 'bg-amber-50 text-amber-700' },
    umum: { label: 'Umum', color: 'bg-gray-100 text-gray-700' },
};

const TipeBadge = ({ tipe }: { tipe: keyof typeof TIPE_CONFIG }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIPE_CONFIG[tipe].color}`}>
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

const ITEMS_PER_PAGE = 10;

export default function BiayaOperasionalIndex({ biayaOperasional, trips, kendaraan, kategoriBiaya, filters }: Props) {
    const [search, setSearch] = useState('');
    const [filterTipe, setFilterTipe] = useState<string>('all');
    const [filterKendaraan, setFilterKendaraan] = useState<string>('all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selected, setSelected] = useState<BiayaOperasional | null>(null);
    const [selectedTipe, setSelectedTipe] = useState<string>('');
    const [editSelectedTipe, setEditSelectedTipe] = useState<string>('');

    const createForm = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        trip_id: '',
        kendaraan_id: '',
        kategori_id: '',
        jumlah: '',
        keterangan: '',
    });

    const editForm = useForm({
        tanggal: '',
        trip_id: '',
        kendaraan_id: '',
        kategori_id: '',
        jumlah: '',
        keterangan: '',
    });

    const filteredKategoriCreate = useMemo(() => {
        if (!selectedTipe) return [];
        return kategoriBiaya.filter(k => k.tipe === selectedTipe);
    }, [kategoriBiaya, selectedTipe]);

    const filteredKategoriEdit = useMemo(() => {
        if (!editSelectedTipe) return kategoriBiaya;
        return kategoriBiaya.filter(k => k.tipe === editSelectedTipe);
    }, [kategoriBiaya, editSelectedTipe]);

    const handleTipeChange = (tipe: string) => {
        setSelectedTipe(tipe);
        createForm.setData({
            ...createForm.data,
            trip_id: '',
            kendaraan_id: '',
            kategori_id: '',
        });
    };

    const handleEditTipeChange = (tipe: string) => {
        setEditSelectedTipe(tipe);
        editForm.setData({
            ...editForm.data,
            trip_id: '',
            kendaraan_id: '',
            kategori_id: '',
        });
    };

    const handleTripChange = (tripId: string) => {
        createForm.setData('trip_id', tripId);
        if (tripId) {
            const trip = trips.find(t => t.id.toString() === tripId);
            if (trip) {
                createForm.setData('kendaraan_id', trip.kendaraan_id.toString());
            }
        }
    };

    const handleEditTripChange = (tripId: string) => {
        editForm.setData('trip_id', tripId);
        if (tripId) {
            const trip = trips.find(t => t.id.toString() === tripId);
            if (trip) {
                editForm.setData('kendaraan_id', trip.kendaraan_id.toString());
            }
        }
    };

    const filtered = useMemo(() => {
        return biayaOperasional.filter((item) => {
            const matchSearch =
                item.nomor_polisi?.toLowerCase().includes(search.toLowerCase()) ||
                item.nama_kategori?.toLowerCase().includes(search.toLowerCase()) ||
                item.keterangan?.toLowerCase().includes(search.toLowerCase());
            const matchTipe = filterTipe === 'all' || item.tipe_kategori === filterTipe;
            const matchKendaraan = filterKendaraan === 'all' ||
                (item.kendaraan_id !== null && item.kendaraan_id.toString() === filterKendaraan);
            return matchSearch && matchTipe && matchKendaraan;
        });
    }, [biayaOperasional, search, filterTipe, filterKendaraan]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterPeriode = () => {
        router.get(route('biaya-operasional.index'), {
            start_date: startDate || null,
            end_date: endDate || null,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('biaya-operasional.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
                createForm.setData('tanggal', new Date().toISOString().split('T')[0]);
                setSelectedTipe('');
            },
        });
    };

    const openEdit = (b: BiayaOperasional) => {
        setSelected(b);
        setEditSelectedTipe(b.tipe_kategori);
        editForm.setData({
            tanggal: b.tanggal,
            trip_id: b.trip_id?.toString() || '',
            kendaraan_id: b.kendaraan_id?.toString() || '',
            kategori_id: b.kategori_id.toString(),
            jumlah: b.jumlah,
            keterangan: b.keterangan || '',
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('biaya-operasional.update', selected.id), {
            onSuccess: () => { setEditModalOpen(false); setSelected(null); },
        });
    };

    const openView = (b: BiayaOperasional) => { setSelected(b); setViewModalOpen(true); };

    const handleDelete = (b: BiayaOperasional) => {
        if (confirm(`Hapus biaya ${b.nama_kategori} - ${formatRupiah(b.jumlah)}?`)) {
            router.delete(route('biaya-operasional.destroy', b.id));
        }
    };

    const breadcrumbs = [
        { title: 'Transaksi', href: '#' },
        { title: 'Biaya Operasional', href: route('biaya-operasional.index') },
    ];

    const stats = {
        total: biayaOperasional.reduce((sum, b) => sum + parseFloat(b.jumlah), 0),
        trip: biayaOperasional.filter(b => b.tipe_kategori === 'trip').reduce((sum, b) => sum + parseFloat(b.jumlah), 0),
        maintenance: biayaOperasional.filter(b => b.tipe_kategori === 'maintenance').reduce((sum, b) => sum + parseFloat(b.jumlah), 0),
        umum: biayaOperasional.filter(b => b.tipe_kategori === 'umum').reduce((sum, b) => sum + parseFloat(b.jumlah), 0),
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biaya Operasional" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-50 rounded-xl">
                            <Receipt className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Biaya Operasional</h1>
                            <p className="text-sm text-gray-500">Catat pengeluaran operasional</p>
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
                        <p className="text-xs text-gray-500">Total Biaya</p>
                        <p className="text-lg font-bold text-gray-900">{formatRupiah(stats.total)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600">Biaya Trip</p>
                        <p className="text-lg font-bold text-blue-700">{formatRupiah(stats.trip)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600">Maintenance</p>
                        <p className="text-lg font-bold text-amber-700">{formatRupiah(stats.maintenance)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-600">Umum</p>
                        <p className="text-lg font-bold text-gray-700">{formatRupiah(stats.umum)}</p>
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
                            <Button onClick={() => { setStartDate(''); setEndDate(''); router.get(route('biaya-operasional.index')); }} variant="ghost" className="w-full">Reset</Button>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Cari kategori, kendaraan..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filterTipe} onValueChange={(v) => { setFilterTipe(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-36">
                            <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            <SelectItem value="trip">Trip</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="umum">Umum</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterKendaraan} onValueChange={(v) => { setFilterKendaraan(v); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Kendaraan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kendaraan</SelectItem>
                            {kendaraan.map((k) => (
                                <SelectItem key={k.id} value={k.id.toString()}>{k.nomor_polisi}</SelectItem>
                            ))}
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
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Trip</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Jumlah</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                    <Receipt className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="font-medium text-gray-900">Belum ada biaya</p>
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
                                                <span className="text-sm font-medium text-gray-900">{formatDate(item.tanggal)}</span>
                                            </td>
                                            <td className="px-3 py-3">
                                                {item.nomor_polisi ? (
                                                    <span className="font-semibold text-gray-900 text-sm">{item.nomor_polisi}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Umum</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="font-medium text-gray-900 text-sm">{item.nama_kategori}</div>
                                                <TipeBadge tipe={item.tipe_kategori} />
                                            </td>
                                            <td className="px-3 py-3 hidden md:table-cell">
                                                {item.trip_id ? (
                                                    <span className="text-xs text-blue-600">#{item.trip_id}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <span className="font-semibold text-gray-900 text-sm">{formatRupiah(item.jumlah)}</span>
                                            </td>
                                            <td className="px-3 py-3">
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
            <Dialog open={createModalOpen} onOpenChange={(open) => { setCreateModalOpen(open); if (!open) setSelectedTipe(''); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Biaya Operasional</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4 mt-2">
                        <FormField label="Tanggal" required error={createForm.errors.tanggal}>
                            <Input type="date" value={createForm.data.tanggal} onChange={(e) => createForm.setData('tanggal', e.target.value)} />
                        </FormField>

                        <FormField label="Tipe Biaya" required>
                            <Select value={selectedTipe} onValueChange={handleTipeChange}>
                                <SelectTrigger><SelectValue placeholder="Pilih tipe biaya" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="trip">Trip - Biaya perjalanan</SelectItem>
                                    <SelectItem value="maintenance">Maintenance - Perawatan kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya overhead</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        {selectedTipe === 'trip' && (
                            <FormField label="Trip" required error={createForm.errors.trip_id}>
                                <Select value={createForm.data.trip_id} onValueChange={handleTripChange}>
                                    <SelectTrigger><SelectValue placeholder="Pilih trip" /></SelectTrigger>
                                    <SelectContent>
                                        {trips.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {formatDate(t.tanggal_trip)} - {t.nomor_polisi} (#{t.id} - {formatRupiah(t.uang_sangu)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {selectedTipe === 'maintenance' && (
                            <FormField label="Kendaraan" required error={createForm.errors.kendaraan_id}>
                                <Select value={createForm.data.kendaraan_id} onValueChange={(v) => createForm.setData('kendaraan_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                                    <SelectContent>
                                        {kendaraan.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>{k.nomor_polisi} - {k.jenis}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {selectedTipe && (
                            <FormField label="Kategori Biaya" required error={createForm.errors.kategori_id}>
                                <Select value={createForm.data.kategori_id} onValueChange={(v) => createForm.setData('kategori_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                    <SelectContent>
                                        {filteredKategoriCreate.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        <FormField label="Jumlah (Rp)" required error={createForm.errors.jumlah}>
                            <Input type="number" placeholder="0" value={createForm.data.jumlah} onChange={(e) => createForm.setData('jumlah', e.target.value)} />
                        </FormField>

                        <FormField label="Keterangan">
                            <textarea rows={2} placeholder="Catatan (opsional)" value={createForm.data.keterangan} onChange={(e) => createForm.setData('keterangan', e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />
                        </FormField>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateModalOpen(false); setSelectedTipe(''); }}>Batal</Button>
                            <Button type="submit" className="flex-1" disabled={createForm.processing || !selectedTipe}>
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
                        <DialogTitle>Edit Biaya Operasional</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 mt-2">
                        <FormField label="Tanggal" required>
                            <Input type="date" value={editForm.data.tanggal} onChange={(e) => editForm.setData('tanggal', e.target.value)} />
                        </FormField>

                        <FormField label="Tipe Biaya" required>
                            <Select value={editSelectedTipe} onValueChange={handleEditTipeChange}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="trip">Trip - Biaya perjalanan</SelectItem>
                                    <SelectItem value="maintenance">Maintenance - Perawatan kendaraan</SelectItem>
                                    <SelectItem value="umum">Umum - Biaya overhead</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        {editSelectedTipe === 'trip' && (
                            <FormField label="Trip" required>
                                <Select value={editForm.data.trip_id} onValueChange={handleEditTripChange}>
                                    <SelectTrigger><SelectValue placeholder="Pilih trip" /></SelectTrigger>
                                    <SelectContent>
                                        {trips.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {formatDate(t.tanggal_trip)} - {t.nomor_polisi} (#{t.id} - {formatRupiah(t.uang_sangu)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {editSelectedTipe === 'maintenance' && (
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
                        )}

                        <FormField label="Kategori Biaya" required>
                            <Select value={editForm.data.kategori_id} onValueChange={(v) => editForm.setData('kategori_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {filteredKategoriEdit.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Jumlah (Rp)" required>
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

            {/* View Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Detail Biaya</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 mt-2">
                            <div className="bg-gray-900 text-white rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold">{formatRupiah(selected.jumlah)}</p>
                                <p className="text-gray-400 text-sm">{formatDate(selected.tanggal)}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Kendaraan</span>
                                    <span className="font-semibold text-gray-900">{selected.nomor_polisi || 'Umum'}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Kategori</span>
                                    <div className="text-right">
                                        <span className="font-medium text-gray-900">{selected.nama_kategori}</span>
                                        <div><TipeBadge tipe={selected.tipe_kategori} /></div>
                                    </div>
                                </div>
                                {selected.trip_id && (
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm text-blue-600">Terkait Trip</span>
                                        <span className="font-medium text-blue-700">#{selected.trip_id}</span>
                                    </div>
                                )}
                                {selected.keterangan && (
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <p className="text-xs text-amber-600 font-medium mb-1">Keterangan</p>
                                        <p className="text-sm text-amber-900">{selected.keterangan}</p>
                                    </div>
                                )}
                            </div>

                            <Button className="w-full" onClick={() => setViewModalOpen(false)}>Tutup</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}