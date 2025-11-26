import { useState, useEffect, useRef } from "react";
import styles from "./UnifiedEditor.module.css";
import { Save, FileText, Edit3, RotateCcw, Wand2, Check } from "lucide-react";
import { TextReplacement } from "@/lib/analyzer";

interface UnifiedEditorProps {
    initialText: string;
    pdfUrl: string | null;
    replacements?: TextReplacement[];
    onSave: (newText: string) => void;
}

export default function UnifiedEditor({ initialText, pdfUrl, replacements = [], onSave }: UnifiedEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(initialText);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    // Update local text if initialText changes
    useEffect(() => {
        setText(initialText);
        setHasChanges(false);
    }, [initialText]);

    // Sync scroll between textarea and backdrop
    const handleScroll = () => {
        if (textareaRef.current && backdropRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setHasChanges(true);
    };

    const handleSave = () => {
        onSave(text);
        setHasChanges(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setText(initialText);
        setHasChanges(false);
        setIsEditing(false);
    };

    const applySuggestion = (rep: TextReplacement) => {
        // Simple replace for now - in a real app, we'd need to track index shifts
        // or use a more robust replacement strategy
        const newText = text.replace(rep.original, rep.replacement);
        setText(newText);
        setHasChanges(true);
    };

    const renderHighlights = () => {
        if (!replacements || replacements.length === 0) return <div className={styles.textOverlay}>{text}</div>;

        let lastIndex = 0;
        const elements = [];
        const sortedReplacements = [...replacements].sort((a, b) => a.index - b.index);

        // We need to match replacements to the CURRENT text
        // Since text might have changed, we search for the 'original' string
        // This is a heuristic; perfect sync requires operational transformation or re-running analysis on every keystroke

        let currentTextIndex = 0;

        sortedReplacements.forEach((rep, i) => {
            const matchIndex = text.indexOf(rep.original, currentTextIndex);
            if (matchIndex === -1) return;

            // Text before match
            if (matchIndex > currentTextIndex) {
                elements.push(<span key={`text-${i}`}>{text.slice(currentTextIndex, matchIndex)}</span>);
            }

            // Highlighted match
            elements.push(
                <span key={`mark-${i}`} className={styles.highlight}>
                    {rep.original}
                </span>
            );

            currentTextIndex = matchIndex + rep.original.length;
        });

        // Remaining text
        if (currentTextIndex < text.length) {
            elements.push(<span key="text-end">{text.slice(currentTextIndex)}</span>);
        }

        // We must add a trailing space/newline to ensure the backdrop matches the textarea height exactly
        elements.push(<span key="filler">{"\n"}</span>);

        return <div className={styles.textOverlay}>{elements}</div>;
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.leftTools}>
                    <div className={styles.modeToggle}>
                        <button
                            className={`${styles.toggleBtn} ${!isEditing ? styles.active : ""}`}
                            onClick={() => setIsEditing(false)}
                            disabled={!pdfUrl}
                        >
                            <FileText size={16} /> PDF View
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${isEditing ? styles.active : ""}`}
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 size={16} /> Edit Text
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className={styles.actions}>
                        <button
                            className={`${styles.iconBtn} ${showSuggestions ? styles.active : ""}`}
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            title="Toggle Suggestions"
                        >
                            <Wand2 size={16} />
                        </button>
                        {hasChanges && (
                            <button className={styles.cancelBtn} onClick={handleCancel}>
                                <RotateCcw size={16} /> Reset
                            </button>
                        )}
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={!hasChanges}
                        >
                            <Save size={16} /> Save & Rescan
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.contentArea}>
                {!isEditing && pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className={styles.pdfViewer}
                        title="Resume PDF"
                    />
                ) : (
                    <div className={styles.editorWrapper}>
                        <div className={styles.editorMain}>
                            <div className={styles.backdrop} ref={backdropRef}>
                                {renderHighlights()}
                            </div>
                            <textarea
                                ref={textareaRef}
                                className={styles.textEditor}
                                value={text}
                                onChange={handleTextChange}
                                onScroll={handleScroll}
                                placeholder="Edit your resume text here..."
                                spellCheck={false}
                            />
                        </div>

                        {showSuggestions && replacements.length > 0 && (
                            <div className={styles.suggestionsPanel}>
                                <h4 className={styles.suggestionsTitle}>
                                    <Wand2 size={14} /> Improvements
                                </h4>
                                <div className={styles.suggestionsList}>
                                    {replacements.map((rep, i) => (
                                        <div key={i} className={styles.suggestionCard}>
                                            <div className={styles.suggestionHeader}>
                                                <span className={styles.suggestionType}>{rep.type}</span>
                                            </div>
                                            <div className={styles.suggestionContent}>
                                                <span className={styles.badText}>{rep.original}</span>
                                                <span className={styles.arrow}>→</span>
                                                <span className={styles.goodText}>{rep.replacement}</span>
                                            </div>
                                            <button
                                                className={styles.applyBtn}
                                                onClick={() => applySuggestion(rep)}
                                            >
                                                <Check size={14} /> Apply
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
