import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Shield, Save } from 'lucide-react';

interface Trip {
    id: number;
    tanggal_trip: string;
    status: 'draft' | 'sedang_jalan' | 'selesai' | 'batal';
    nomor_polisi: string;
    nama_asal: string | null;
    nama_tujuan: string | null;
}

interface Props {
    trips: Trip[];
}

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    sedang_jalan: { label: 'Sedang Jalan', color: 'bg-blue-50 text-blue-700' },
    selesai: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-700' },
    batal: { label: 'Batal', color: 'bg-red-50 text-red-700' },
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
};

export default function OwnerTripStatusOverride({ trips }: Props) {
    const form = useForm({
        trip_id: '',
        status: '',
    });

    const selectedTrip = trips.find(t => t.id.toString() === form.data.trip_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedTrip) return;

        const confirmMsg = `Ubah status trip:\n\n${selectedTrip.nomor_polisi} - ${formatDate(selectedTrip.tanggal_trip)}\n\nDari: ${STATUS_CONFIG[selectedTrip.status].label}\nKe: ${STATUS_CONFIG[form.data.status as keyof typeof STATUS_CONFIG].label}\n\nYakin?`;
        
        if (confirm(confirmMsg)) {
            form.patch(route('owner.update-trip-status'), {
                onSuccess: () => {
                    form.reset();
                },
            });
        }
    };

    const breadcrumbs = [
        { title: 'Owner', href: route('owner.trip-status-override') },
        { title: 'Override Status Trip', href: route('owner.trip-status-override') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Override Status Trip" />

            <div className="p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl">
                        <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Override Status Trip</h1>
                        <p className="text-sm text-gray-500">Ubah status trip yang sudah selesai/batal</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900">Akses Owner</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Fitur ini hanya untuk koreksi status trip yang salah. Gunakan dengan hati-hati.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        {/* Pilih Trip */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Pilih Trip <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={form.data.trip_id} 
                                onValueChange={(v) => {
                                    form.setData({
                                        trip_id: v,
                                        status: trips.find(t => t.id.toString() === v)?.status || '',
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih trip yang akan diubah statusnya" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trips.map((trip) => (
                                        <SelectItem key={trip.id} value={trip.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-gray-500">#{trip.id}</span>
                                                <span className="font-medium">{trip.nomor_polisi}</span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(trip.tanggal_trip)}
                                                </span>
                                                <span className="text-gray-500">•</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CONFIG[trip.status].color}`}>
                                                    {STATUS_CONFIG[trip.status].label}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.trip_id && (
                                <p className="text-xs text-red-600">{form.errors.trip_id}</p>
                            )}
                        </div>

                        {/* Info Trip yang Dipilih */}
                        {selectedTrip && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <h3 className="font-semibold text-gray-900">Detail Trip</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Kendaraan:</span>
                                        <span className="ml-2 font-medium">{selectedTrip.nomor_polisi}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Tanggal:</span>
                                        <span className="ml-2 font-medium">{formatDate(selectedTrip.tanggal_trip)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Rute:</span>
                                        <span className="ml-2 font-medium">
                                            {selectedTrip.nama_asal || '-'} → {selectedTrip.nama_tujuan || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status Saat Ini:</span>
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${STATUS_CONFIG[selectedTrip.status].color}`}>
                                            {STATUS_CONFIG[selectedTrip.status].label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pilih Status Baru */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Status Baru <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={form.data.status} 
                                onValueChange={(v) => form.setData('status', v)}
                                disabled={!form.data.trip_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status baru" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">
                                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG.draft.color}`}>
                                            Draft
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="sedang_jalan">
                                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG.sedang_jalan.color}`}>
                                            Sedang Jalan
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="selesai">
                                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG.selesai.color}`}>
                                            Selesai
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="batal">
                                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG.batal.color}`}>
                                            Batal
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.status && (
                                <p className="text-xs text-red-600">{form.errors.status}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="submit" 
                                disabled={form.processing || !form.data.trip_id || !form.data.status}
                                className="flex-1 sm:flex-none"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {form.processing ? 'Menyimpan...' : 'Ubah Status'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => form.reset()}
                                disabled={form.processing}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}