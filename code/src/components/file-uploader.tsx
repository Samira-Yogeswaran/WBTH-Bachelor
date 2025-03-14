'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { X, Upload, FileText, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadFile, deleteFile } from '@/actions/post'
import { useAuth } from '@/hooks/use-auth'

type FileItem = {
	id: string
	file: File
	publicUrl?: string
	filePath?: string
	error?: string
	uploaded?: boolean
}

type FileUploaderProps = {
	value: FileItem[]
	onChange: (files: FileItem[]) => void
	maxFiles?: number
	maxSize?: number
	folder?: string
}

export function FileUploader({
	value = [],
	onChange,
	maxFiles = 5,
	maxSize = 10 * 1024 * 1024, // 10MB
	folder = 'uploads',
}: FileUploaderProps) {
	const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const { user } = useAuth()

	const uploadFileToSupabase = async (file: File, fileId: string) => {
		if (!user) {
			console.error('User must be logged in to upload files')
			return
		}

		try {
			// Upload to Supabase
			const result = await uploadFile(file, user.id, folder)

			if (!result.success) {
				throw new Error(result.error || 'Upload failed')
			}

			// Update file with the result
			const updatedFiles = uploadedFiles.map((f) => {
				if (f.id === fileId) {
					return {
						...f,
						publicUrl: result.publicUrl,
						filePath: result.filePath,
						uploaded: true, // Mark as successfully uploaded
					}
				}
				return f
			})

			onChange(updatedFiles)
			console.log(`File ${file.name} uploaded successfully`)
		} catch (error) {
			console.error('Upload error:', error)

			// Update file with error
			onChange(
				value.map((f) => {
					if (f.id === fileId) {
						return {
							...f,
							error: error instanceof Error ? error.message : 'Upload failed',
						}
					}
					return f
				})
			)
		}
	}

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
				console.error(`You can only upload up to ${maxFiles} files`)
				return
			}

			setIsUploading(true)

			// Convert accepted files to our format
			const newFiles = acceptedFiles.map((file) => ({
				id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				file,
			}))

			// Add new files to existing ones
			const updatedFiles = [...uploadedFiles, ...newFiles]
			console.log('New files:', updatedFiles)

			setUploadedFiles(updatedFiles)

			// Upload each file to Supabase
			for (const fileItem of newFiles) {
				await uploadFileToSupabase(fileItem.file, fileItem.id)
			}

			setIsUploading(false)
		},
		[uploadedFiles, maxFiles]
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxSize,
		accept: {
			'application/pdf': ['.pdf'],
			'application/msword': ['.doc'],
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
			'application/vnd.ms-powerpoint': ['.ppt'],
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
			'application/vnd.ms-excel': ['.xls'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
			'text/plain': ['.txt'],
			'application/zip': ['.zip'],
		},
	})

	const removeFile = async (fileId: string) => {
		const fileToRemove = value.find((file) => file.id === fileId)

		if (fileToRemove && fileToRemove.filePath) {
			try {
				await deleteFile(fileToRemove.filePath)
				console.log(`File ${fileToRemove.file.name} deleted successfully`)
			} catch (error) {
				console.error('Delete error:', error)
			}
		}

		onChange(value.filter((file) => file.id !== fileId))
	}

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={cn(
					'border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
					isDragActive
						? 'border-primary bg-primary/5'
						: 'border-muted-foreground/25 hover:border-primary/50'
				)}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center justify-center gap-2 text-center">
					<Upload className="h-10 w-10 text-muted-foreground" />
					<h3 className="font-medium text-lg">Dateien hier ablegen</h3>
					<p className="text-sm text-muted-foreground">
						oder klicken Sie, um Dateien von Ihrem Computer auszuwählen
					</p>
					<p className="text-xs text-muted-foreground mt-2">
						Unterstützte Formate: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, PNG, JPG, GIF, ZIP
					</p>
					<p className="text-xs text-muted-foreground">
						Maximal {maxFiles} Dateien, bis zu {maxSize / (1024 * 1024)}MB pro Datei
					</p>
				</div>
			</div>

			{uploadedFiles.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">
						Hochgeladene Dateien ({uploadedFiles.length}/{maxFiles})
					</h4>
					<ul className="space-y-2">
						{uploadedFiles.map((fileItem) => (
							<li
								key={fileItem.id}
								className="flex items-center gap-3 p-2 rounded-md border bg-muted/50"
							>
								{fileItem.uploaded ? (
									<CheckCircle className="h-6 w-6 text-green-500" />
								) : (
									<FileText className="h-6 w-6" />
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{fileItem.file.name}</p>
									<p className="text-xs text-muted-foreground">
										{(fileItem.file.size / 1024).toFixed(1)} KB
										{fileItem.uploaded && ' • Erfolgreich hochgeladen'}
									</p>
									{fileItem.error && (
										<p className="text-xs text-destructive mt-1">{fileItem.error}</p>
									)}
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => removeFile(fileItem.id)}
									disabled={isUploading}
								>
									<X className="h-4 w-4" />
									<span className="sr-only">Datei entfernen</span>
								</Button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
