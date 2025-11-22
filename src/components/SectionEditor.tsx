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
                                <textarea
                                    className={styles.editor}
                                    value={section.content}
                                    onChange={(e) => handleContentChange(index, e.target.value)}
                                    rows={8}
                                    placeholder={`Enter your ${section.name.toLowerCase()} here...`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
