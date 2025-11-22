"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File) => {
        const validTypes = [
            "application/pdf",
            // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // TODO: Add DOCX support
        ];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a PDF file. DOCX support coming soon.");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB.");
            return false;
        }
        return true;
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            setError(null);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const droppedFile = e.dataTransfer.files[0];
                if (validateFile(droppedFile)) {
                    setFile(droppedFile);
                    onFileUpload(droppedFile);
                }
            }
        },
        [onFileUpload]
    );

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                onFileUpload(selectedFile);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
    };

    return (
        <div className={styles.container}>
            {!file ? (
                <div
                    className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className={styles.input}
                        accept=".pdf"
                        onChange={handleFileInput}
                    />
                    <label htmlFor="file-upload" className={styles.label}>
                        <div className={styles.iconWrapper}>
                            <Upload size={32} />
                        </div>
                        <h3 className={styles.heading}>Upload your resume</h3>
                        <p className={styles.subtext}>Drag & drop or click to browse</p>
                        <p className={styles.formats}>PDF (Max 5MB)</p>
                    </label>
                </div>
            ) : (
                <div className={styles.filePreview}>
                    <div className={styles.fileInfo}>
                        <FileText size={24} className={styles.fileIcon} />
                        <div>
                            <p className={styles.fileName}>{file.name}</p>
                            <p className={styles.fileSize}>
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    </div>
                    <button onClick={removeFile} className={styles.removeBtn}>
                        <X size={20} />
                    </button>
                </div>
            )}
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
