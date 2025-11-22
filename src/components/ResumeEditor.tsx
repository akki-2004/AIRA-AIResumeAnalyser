"use client";

import { useState, useEffect } from "react";
import styles from "./ResumeEditor.module.css";
import { RefreshCw, Save, X } from "lucide-react";

interface ResumeEditorProps {
    initialText: string;
    onClose: () => void;
    onRescore: (newText: string) => void;
}

export default function ResumeEditor({ initialText, onClose, onRescore }: ResumeEditorProps) {
    const [text, setText] = useState(initialText);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setIsDirty(true);
    };

    const handleSave = () => {
        onRescore(text);
        setIsDirty(false);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Edit Resume Content</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.body}>
                    <p className={styles.description}>
                        Edit the extracted text below to improve your score.
                        Add missing keywords or fix formatting issues.
                    </p>
                    <textarea
                        className={styles.editor}
                        value={text}
                        onChange={handleChange}
                        placeholder="Resume content..."
                    />
                </div>

                <div className={styles.footer}>
                    <button
                        className={`btn btn-primary ${styles.saveBtn}`}
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        <RefreshCw size={18} className={isDirty ? "" : "opacity-50"} />
                        Re-Analyze
                    </button>
                </div>
            </div>
        </div>
    );
}
