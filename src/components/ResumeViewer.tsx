"use client";

import styles from "./ResumeViewer.module.css";

interface ResumeViewerProps {
    fileUrl: string | null;
}

export default function ResumeViewer({ fileUrl }: ResumeViewerProps) {
    if (!fileUrl) {
        return (
            <div className={styles.emptyState}>
                <p>No resume loaded</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0`}
                className={styles.iframe}
                title="Resume PDF"
            />
        </div>
    );
}
