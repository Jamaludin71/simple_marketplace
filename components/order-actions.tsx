/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"

interface OrderActionsProps {
    order: any 
}

export function OrderActions({ order }: OrderActionsProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploadedImage, setUploadedImage] = useState("")

    const onPay = async () => {
        if (!uploadedImage) {
            toast({
                title: "Error",
                description: "Silakan upload bukti pembayaran terlebih dahulu",
                variant: "destructive"
            })
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`/api/orders/${order.orderNumber}/pay`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentProof: uploadedImage })
            })

            if (!response.ok) throw new Error("Gagal mengupload bukti pembayaran")

            toast({
                title: "Berhasil",
                description: "Bukti pembayaran berhasil diupload",
            })
            setIsUploadOpen(false)
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Terjadi kesalahan saat mengupload bukti pembayaran",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onConfirm = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/orders/${order.orderNumber}/confirm`, {
                method: "PATCH"
            })

            if (!response.ok) throw new Error("Gagal konfirmasi pesanan")

            toast({
                title: "Berhasil",
                description: "Pesanan selesai",
            })
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Terjadi kesalahan saat konfirmasi pesanan",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const onCancel = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/orders/${order.orderNumber}/cancel`, {
                method: "PATCH"
            })

            if (!response.ok) throw new Error("Gagal membatalkan pesanan")

            toast({
                title: "Berhasil",
                description: "Pesanan berhasil dibatalkan",
            })
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Terjadi kesalahan saat membatalkan pesanan",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {order.status === "PENDING" && (
                <>
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h3 className="font-semibold text-yellow-800 mb-2">Instruksi Pembayaran</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                            Silakan transfer ke rekening berikut:
                        </p>
                        <div className="text-sm font-mono bg-white p-2 rounded border mb-4">
                            BCA 1234567890 a/n MiniShop
                        </div>
                        
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Bukti Pembayaran
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
                                    <DialogDescription>
                                        Upload foto bukti transfer Anda untuk verifikasi.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <ImageUpload
                                        value={uploadedImage ? [uploadedImage] : []}
                                        onChange={(url) => setUploadedImage(url)}
                                        onRemove={() => setUploadedImage("")}
                                        disabled={isLoading}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isLoading}>
                                        Batal
                                    </Button>
                                    <Button onClick={onPay} disabled={isLoading || !uploadedImage}>
                                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Konfirmasi Pembayaran
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Batalkan Pesanan
                    </Button>
                </>
            )}

            {order.status === "SHIPPED" && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Pesanan Dikirim</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Pesanan Anda sedang dalam perjalanan. Jika sudah sampai, silakan konfirmasi penerimaan.
                    </p>
                    <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Konfirmasi Barang Diterima
                    </Button>
                </div>
            )}
        </div>
    )
}
