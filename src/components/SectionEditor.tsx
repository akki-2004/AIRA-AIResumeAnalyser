"use client";

import { useState } from "react";
import styles from "./SectionEditor.module.css";
import { SectionAnalysis } from "@/lib/analyzer";
import { AlertTriangle, CheckCircle, Save, ChevronDown, ChevronUp } from "lucide-react";

interface SectionEditorProps {
    sections: SectionAnalysis[];
    onSave: (newSections: SectionAnalysis[]) => void;
}

export default function SectionEditor({ sections, onSave }: SectionEditorProps) {
    const [editedSections, setEditedSections] = useState<SectionAnalysis[]>(sections);
    const [expandedSection, setExpandedSection] = useState<string | null>(sections[0]?.name || null);

    const handleContentChange = (index: number, newContent: string) => {
        const newSections = [...editedSections];
        newSections[index] = { ...newSections[index], content: newContent };
        setEditedSections(newSections);
    };

    const toggleSection = (name: string) => {
        setExpandedSection(expandedSection === name ? null : name);
    };

    const handleSave = () => {
        onSave(editedSections);
    };

    const applyReplacement = (sectionIndex: number, replacement: any) => {
        const section = editedSections[sectionIndex];
        const newContent = section.content.replace(replacement.original, replacement.replacement);
        handleContentChange(sectionIndex, newContent);

        const newSections = [...editedSections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            content: newContent,
            replacements: section.replacements?.filter(r => r !== replacement) || []
        };
        setEditedSections(newSections);
    };

    const renderHighlightedContent = (section: SectionAnalysis, index: number) => {
        if (!section.replacements || section.replacements.length === 0) return null;

        let lastIndex = 0;
        const elements = [];
        const sortedReplacements = [...section.replacements].sort((a, b) => a.index - b.index);

        sortedReplacements.forEach((rep, i) => {
            const currentIndex = section.content.indexOf(rep.original, lastIndex);
            if (currentIndex === -1) return;

            if (currentIndex > lastIndex) {
                elements.push(<span key={`text-${i}`}>{section.content.slice(lastIndex, currentIndex)}</span>);
            }

            elements.push(
                <span key={`mark-${i}`} className={styles.highlight} title={`Suggest: ${rep.replacement}`}>
                    {rep.original}
                </span>
            );

            lastIndex = currentIndex + rep.original.length;
        });

        if (lastIndex < section.content.length) {
            elements.push(<span key="text-end">{section.content.slice(lastIndex)}</span>);
        }

        return <div className={styles.highlightOverlay}>{elements}</div>;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Resume Sections</h3>
                <button className="btn btn-sm btn-primary gap-2" onClick={handleSave}>
                    <Save size={16} /> Save & Rescore
                </button>
            </div>

            <div className={styles.accordion}>
                {editedSections.map((section, index) => (
                    <div key={section.name} className={styles.sectionItem}>
                        <button
                            className={`${styles.sectionHeader} ${expandedSection === section.name ? styles.active : ""}`}
                            onClick={() => toggleSection(section.name)}
                        >
                            <div className="flex items-center gap-2">
                                {section.issues.length > 0 ? (
                                    <AlertTriangle size={16} className="text-yellow-500" />
                                ) : (
                                    <CheckCircle size={16} className="text-green-500" />
                                )}
                                <span className="font-medium">{section.name}</span>
                            </div>
                            {expandedSection === section.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSection === section.name && (
                            <div className={styles.sectionBody}>
                                {section.issues.length > 0 && (
                                    <div className={styles.issuesList}>
                                        <p className={styles.issuesTitle}>Suggestions:</p>
                                        <ul>
                                            {section.issues.map((issue, i) => (
                                                <li key={i} className={styles.issueItem}>• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className={styles.editorContainer}>
                                    <div className={styles.highlightLayer}>
                                        {renderHighlightedContent(section, index)}
                                    </div>
                                    <textarea
                                        className={styles.editor}
                                        value={section.content}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        rows={Math.max(5, section.content.split('\n').length)}
                                        placeholder={`Enter your ${section.name.toLowerCase()} here...`}
                                    />
                                </div>
                                {section.replacements && section.replacements.length > 0 && (
                                    <div className={styles.replacementsPanel}>
                                        <p className={styles.replacementsTitle}>Suggested Improvements:</p>
                                        <div className={styles.replacementsList}>
                                            {section.replacements.map((rep, rIndex) => (
                                                <div key={rIndex} className={styles.replacementItem}>
                                                    <span className={styles.repOriginal}>"{rep.original}"</span>
                                                    <span className={styles.repArrow}>→</span>
                                                    <span className={styles.repNew}>{rep.replacement}</span>
                                                    <button
                                                        className={styles.applyButton}
                                                        onClick={() => applyReplacement(index, rep)}
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
