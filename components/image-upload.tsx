/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { CldUploadWidget } from "next-cloudinary"
import { ImagePlus, Trash, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
    disabled?: boolean
    onChange: (value: string) => void
    onRemove: (value: string) => void
    value: string[]
    useLocal?: boolean // New prop to choose upload method
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,
    useLocal = true // Default to local upload
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Cloudinary upload handler
    const onCloudinaryUpload = (result: any) => {
        onChange(result.info.secure_url)
    }

    // Local upload handler
    const onLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: "Tipe file tidak valid",
                description: "Hanya JPG, PNG, dan WebP yang diperbolehkan",
                variant: "destructive"
            })
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File terlalu besar",
                description: "Ukuran maksimal file adalah 5MB",
                variant: "destructive"
            })
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload gagal')
            }

            const data = await response.json()
            onChange(data.url)

            toast({
                title: "Upload berhasil",
                description: "Gambar berhasil diupload"
            })
        } catch (error) {
            console.error('Upload error:', error)
            toast({
                title: "Upload gagal",
                description: error instanceof Error ? error.message : "Gagal mengupload gambar",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    if (!isMounted) {
        return null
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4 flex-wrap">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-border/60">
                        <div className="z-10 absolute top-2 right-2">
                            <Button 
                                type="button" 
                                onClick={() => onRemove(url)} 
                                variant="destructive" 
                                size="icon"
                                disabled={disabled}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Product image"
                            src={url}
                        />
                    </div>
                ))}
            </div>

            {/* Conditional rendering based on upload method */}
            {useLocal ? (
                // Local Upload
                <div>
                    <input
                        id="local-image-upload"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={onLocalUpload}
                        disabled={disabled || isUploading}
                    />
                    <label htmlFor="local-image-upload">
                        <Button
                            type="button"
                            disabled={disabled || isUploading}
                            variant="secondary"
                            asChild
                        >
                            <span className="cursor-pointer">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Mengupload...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Gambar
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG atau WebP (Maks. 5MB)
                    </p>
                </div>
            ) : (
                // Cloudinary Upload
                <CldUploadWidget onUpload={onCloudinaryUpload} uploadPreset="marketplace_preset">
                    {({ open }) => {
                        const onClick = () => {
                            open()
                        }

                        return (
                            <Button
                                type="button"
                                disabled={disabled}
                                variant="secondary"
                                onClick={onClick}
                            >
                                <ImagePlus className="h-4 w-4 mr-2" />
                                Upload Image (Cloudinary)
                            </Button>
                        )
                    }}
                </CldUploadWidget>
            )}
        </div>
    )
}

export default ImageUpload
