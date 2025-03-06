'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
	X,
	Upload,
	File,
	FileText,
	ImageIcon,
	FileArchive,
	Clock,
	Check,
	ArrowDownToLine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Image from 'next/image'

type FileVersion = {
	id: string
	file: File
	uploadedAt: Date
}

type FileWithVersions = {
	name: string
	versions: FileVersion[]
	currentVersion: FileVersion
}

type FileUploaderProps = {
	value: FileWithVersions[]
	onChange: (files: FileWithVersions[]) => void
	maxFiles?: number
	maxSize?: number
}

export function FileUploader({
	value = [],
	onChange,
	maxFiles = 5,
	maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploaderProps) {
	const [isUploading, setIsUploading] = useState(false)

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (value.length + acceptedFiles.length > maxFiles) {
				alert(`You can only upload up to ${maxFiles} files`)
				return
			}

			setIsUploading(true)

			// Convert accepted files to our format with versions
			const newFiles = acceptedFiles.map((file) => {
				const existingFile = value.find((f) => f.name === file.name)
				const newVersion: FileVersion = {
					id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
					file,
					uploadedAt: new Date(),
				}

				if (existingFile) {
					// Add new version to existing file
					return {
						...existingFile,
						versions: [...existingFile.versions, newVersion],
						currentVersion: newVersion,
					}
				} else {
					// Create new file entry
					return {
						name: file.name,
						versions: [newVersion],
						currentVersion: newVersion,
					}
				}
			})

			// Merge new files with existing ones
			const updatedFiles = value.map((file) => {
				const updatedFile = newFiles.find((f) => f.name === file.name)
				return updatedFile || file
			})

			const filesToAdd = newFiles.filter((file) => !value.some((f) => f.name === file.name))
			onChange([...updatedFiles, ...filesToAdd])

			// Simulate upload progress
			const progressIntervals = newFiles.map((file) => {
				return setInterval(() => {
					onChange((prevFiles) => {
						return prevFiles.map((f) => {
							if (f.name === file.name) {
								const progress = Math.min(f.currentVersion.file.progress + 10 || 0, 100)
								return {
									...f,
									currentVersion: {
										...f.currentVersion,
										file: Object.assign(f.currentVersion.file, { progress }),
									},
								}
							}
							return f
						})
					})
				}, 300)
			})

			// Clear intervals after "upload" completes
			setTimeout(() => {
				progressIntervals.forEach((interval) => clearInterval(interval))
				setIsUploading(false)
			}, 3000)
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

	const removeFile = (fileName: string) => {
		onChange(value.filter((file) => file.name !== fileName))
	}

	const getFileIcon = (file: File) => {
		if (file.type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />
		if (file.type.includes('pdf')) return <FileText className="h-6 w-6" />
		if (file.type.includes('zip') || file.type.includes('archive'))
			return <FileArchive className="h-6 w-6" />
		return <File className="h-6 w-6" />
	}

	const switchVersion = (fileName: string, versionId: string) => {
		onChange(
			value.map((file) => {
				if (file.name === fileName) {
					const newCurrentVersion = file.versions.find((v) => v.id === versionId)
					if (newCurrentVersion) {
						return { ...file, currentVersion: newCurrentVersion }
					}
				}
				return file
			})
		)
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
						Hochgeladene Dateien ({value.length}/{maxFiles})
					</h4>
					<ul className="space-y-2">
						{value.map((fileItem) => (
							<li
								key={fileItem.name}
								className="flex items-center gap-3 p-2 rounded-md border bg-muted/50"
							>
								{fileItem.currentVersion.file.type.startsWith('image/') ? (
									<div className="h-10 w-10 rounded overflow-hidden relative">
										<Image
											src={URL.createObjectURL(fileItem.currentVersion.file)}
											alt={fileItem.name}
											fill
											className="object-cover"
											sizes="40px"
										/>
									</div>
								) : (
									getFileIcon(fileItem.currentVersion.file)
								)}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{fileItem.name}</p>
									<p className="text-xs text-muted-foreground">
										{(fileItem.currentVersion.file.size / 1024).toFixed(1)} KB
									</p>
									{fileItem.currentVersion.file.progress < 100 && (
										<Progress value={fileItem.currentVersion.file.progress} className="h-1 mt-1" />
									)}
								</div>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant="outline" size="sm">
											<Clock className="h-4 w-4 mr-2" />
											Versionen ({fileItem.versions.length})
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80">
										<div className="space-y-3">
											<h5 className="text-sm font-semibold">Dateiversionen</h5>
											<ul className="max-h-48 overflow-auto space-y-1">
												{fileItem.versions.map((version, index) => (
													<li
														key={version.id}
														className="flex justify-between items-center py-2 px-2 rounded-md text-sm hover:bg-muted transition-colors"
													>
														<div className="flex items-center space-x-2">
															<span className="text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
																v{fileItem.versions.length - index}
															</span>
															<span className="text-muted-foreground text-xs">
																{version.uploadedAt.toLocaleString(undefined, {
																	month: 'short',
																	day: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
																})}
															</span>
														</div>
														<div className="flex items-center space-x-2">
															{version.id === fileItem.currentVersion.id && (
																<span className="text-xs text-primary font-medium">Aktuell</span>
															)}
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2 text-xs"
																onClick={() => switchVersion(fileItem.name, version.id)}
																disabled={version.id === fileItem.currentVersion.id}
															>
																{version.id === fileItem.currentVersion.id ? (
																	<Check className="h-3 w-3 mr-1" />
																) : (
																	<ArrowDownToLine className="h-3 w-3 mr-1" />
																)}
																{version.id === fileItem.currentVersion.id ? 'Aktiv' : 'Wechseln'}
															</Button>
														</div>
													</li>
												))}
											</ul>
										</div>
									</PopoverContent>
								</Popover>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
									onClick={() => removeFile(fileItem.name)}
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
