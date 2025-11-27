"use client";

import { SectionAnalysis } from "@/lib/analyzer";
import { Download } from "lucide-react";
import styles from "./ResumePreview.module.css";

interface ResumePreviewProps {
    sections: SectionAnalysis[];
}

export default function ResumePreview({ sections }: ResumePreviewProps) {
    const getSection = (name: string) => sections.find(s => s.name === name);

    const contact = getSection("Contact");
    const experience = getSection("Experience");
    const education = getSection("Education");
    const skills = getSection("Skills");

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button onClick={handlePrint} className={styles.downloadBtn}>
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className={styles.previewPage} id="resume-preview">
                {/* Header / Contact */}
                {contact && (
                    <div className={styles.header}>
                        <div className={styles.contactInfo}>
                            {contact.content.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>
                )}

                <hr className={styles.divider} />

                {/* Experience */}
                {experience && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Experience</h3>
                        <div className={styles.content}>
                            {experience.content.split('\n').map((line, i) => (
                                <p key={i} className={styles.line}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {education && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Education</h3>
                        <div className={styles.content}>
                            {education.content.split('\n').map((line, i) => (
                                <p key={i} className={styles.line}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Skills</h3>
                        <div className={styles.content}>
                            <p>{skills.content}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
