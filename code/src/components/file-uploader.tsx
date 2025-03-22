'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { X, Upload, File, FileText, ImageIcon, FileArchive } from 'lucide-react'
import { cn } from '@/lib/utils'

type FileItem = {
	id: string
	file: File
}

type FileUploaderProps = {
	value: FileItem[]
	onChange: (files: FileItem[]) => void
	maxFiles?: number
	maxSize?: number
}

export function FileUploader({
	value = [],
	onChange,
	maxFiles = 5,
	maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploaderProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (value.length + acceptedFiles.length > maxFiles) {
				console.error(`You can only upload up to ${maxFiles} files`)
				return
			}

			// Convert accepted files to our format
			const newFiles = acceptedFiles.map((file) => ({
				id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				file,
			}))

			// Add new files to existing ones
			const updatedFiles = [...value, ...newFiles]
			onChange(updatedFiles)
		},
		[value, onChange, maxFiles]
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

	const removeFile = (fileId: string) => {
		onChange(value.filter((file) => file.id !== fileId))
	}

	const getFileIcon = (fileItem: FileItem) => {
		if (fileItem.file.type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />
		if (fileItem.file.type.includes('pdf')) return <FileText className="h-6 w-6" />
		if (fileItem.file.type.includes('zip') || fileItem.file.type.includes('archive'))
			return <FileArchive className="h-6 w-6" />
		return <File className="h-6 w-6" />
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

			{value.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">
						Ausgewählte Dateien ({value.length}/{maxFiles})
					</h4>
					<ul className="space-y-2">
						{value.map((fileItem) => (
							<li
								key={fileItem.id}
								className="flex items-center gap-3 p-2 rounded-md border bg-muted/50"
							>
								{getFileIcon(fileItem)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{fileItem.file.name}</p>
									<p className="text-xs text-muted-foreground">
										{(fileItem.file.size / 1024).toFixed(1)} KB - {fileItem.file.type}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => removeFile(fileItem.id)}
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
