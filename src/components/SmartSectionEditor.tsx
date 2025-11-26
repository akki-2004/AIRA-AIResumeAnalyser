"use client";

import { useState } from "react";
import styles from "./SmartSectionEditor.module.css";
import { SectionAnalysis } from "@/lib/analyzer";
import { AlertTriangle, CheckCircle, Save, ChevronDown, ChevronUp, Lightbulb, ArrowRight } from "lucide-react";

interface SmartSectionEditorProps {
    sections: SectionAnalysis[];
    onSave: (newSections: SectionAnalysis[]) => void;
}

const SECTION_GUIDANCE: Record<string, string> = {
    "Contact": "Include your full name, phone number, professional email, and links to LinkedIn/GitHub. Avoid full addresses for privacy.",
    "Experience": "Focus on achievements, not just duties. Use strong action verbs (e.g., 'Led', 'Developed'). Quantify results where possible (e.g., 'Increased efficiency by 20%').",
    "Education": "List degrees in reverse chronological order. Include university name, degree type, and graduation year. GPA is optional unless very high.",
    "Skills": "List technical skills relevant to the job. Group them by category (e.g., Languages, Frameworks). Avoid soft skills here unless backed by examples.",
    "Projects": "Highlight 2-3 key projects. Describe the problem, your solution, and the technologies used."
};

export default function SmartSectionEditor({ sections, onSave }: SmartSectionEditorProps) {
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

        // Optimistic update: remove the replacement from the list
        const newSections = [...editedSections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            content: newContent,
            replacements: section.replacements?.filter(r => r !== replacement) || []
        };
        setEditedSections(newSections);
    };

    const renderHighlights = (section: SectionAnalysis) => {
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
                <h3 className={styles.title}>Smart Editor</h3>
                <button className={styles.saveBtn} onClick={handleSave}>
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
                            <div className={styles.headerLeft}>
                                {section.issues.length > 0 ? (
                                    <AlertTriangle size={16} className={styles.iconWarning} />
                                ) : (
                                    <CheckCircle size={16} className={styles.iconSuccess} />
                                )}
                                <span className={styles.sectionName}>{section.name}</span>
                                <span className={`${styles.scoreBadge} ${section.score >= 80 ? styles.good : styles.bad}`}>
                                    {section.score}%
                                </span>
                            </div>
                            {expandedSection === section.name ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {expandedSection === section.name && (
                            <div className={styles.sectionBody}>
                                {/* Guidance Box */}
                                <div className={styles.guidanceBox}>
                                    <div className={styles.guidanceHeader}>
                                        <Lightbulb size={14} />
                                        <span>Pro Tip</span>
                                    </div>
                                    <p>{SECTION_GUIDANCE[section.name] || "Ensure this section is clear and concise."}</p>
                                </div>

                                <div className={styles.editorContainer}>
                                    <div className={styles.highlightLayer}>
                                        {renderHighlights(section)}
                                    </div>
                                    <textarea
                                        className={styles.editor}
                                        value={section.content}
                                        onChange={(e) => handleContentChange(index, e.target.value)}
                                        placeholder={`Enter your ${section.name} here...`}
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Issues & Replacements */}
                                {(section.issues.length > 0 || (section.replacements && section.replacements.length > 0)) && (
                                    <div className={styles.feedbackPanel}>
                                        {section.issues.map((issue, i) => (
                                            <div key={i} className={styles.issueItem}>
                                                <AlertTriangle size={14} /> {issue}
                                            </div>
                                        ))}

                                        {section.replacements?.map((rep, i) => (
                                            <div key={`rep-${i}`} className={styles.replacementItem}>
                                                <div className={styles.repText}>
                                                    <span className={styles.bad}>{rep.original}</span>
                                                    <ArrowRight size={12} />
                                                    <span className={styles.good}>{rep.replacement}</span>
                                                </div>
                                                <button
                                                    className={styles.applyBtn}
                                                    onClick={() => applyReplacement(index, rep)}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ))}
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
