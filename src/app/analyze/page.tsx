"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { AnalysisResult, SectionAnalysis } from "@/lib/analyzer";
import SmartSectionEditor from "@/components/SmartSectionEditor";
import ResumeViewer from "@/components/ResumeViewer";
import SkillsChart from "@/components/SkillsChart";
import ParsingExplainer from "@/components/ParsingExplainer";
import { CheckCircle, AlertTriangle, ArrowLeft, FileText, Edit, Eye } from "lucide-react";
import ResumePreview from "@/components/ResumePreview";
import Link from "next/link";

export default function AnalyzePage() {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"analysis" | "editor">("analysis");
    const [viewMode, setViewMode] = useState<"editor" | "pdf" | "preview">("pdf");

    useEffect(() => {
        const storedResult = localStorage.getItem("analysisResult");
        const storedFile = localStorage.getItem("resumeFile");

        if (storedFile) {
            setFileUrl(storedFile);
        }

        if (storedResult) {
            try {
                const parsed = JSON.parse(storedResult);
                setResult(parsed);
            } catch (e) {
                console.error("Failed to parse result", e);
            }
        }
        setLoading(false);
    }, []);

    const handleRescore = async (newSections: SectionAnalysis[]) => {
        setLoading(true);

        const newText = newSections.map(s => `${s.name}\n${s.content}`).join("\n\n");

        try {
            const response = await fetch("/api/analyze-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newText }),
            });

            if (!response.ok) throw new Error("Re-analysis failed");

            const newResult = await response.json();
            setResult(newResult);
            localStorage.setItem("analysisResult", JSON.stringify(newResult));
            setActiveTab("analysis");
        } catch (error) {
            console.error("Re-analysis error:", error);
            alert("Failed to re-analyze resume.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Analyzing your resume...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.header}>
                    <Link href="/" className="btn btn-outline gap-2">
                        <ArrowLeft size={16} /> Back to Upload
                    </Link>
                </div>
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Analysis Found</h2>
                    <p className="text-muted-foreground mb-6">
                        Please upload a resume to see the analysis results.
                    </p>
                    <Link href="/" className="btn btn-primary">
                        Upload Resume
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.splitLayout}>
            <div className={styles.leftPanel}>
                <div className={styles.panelHeader}>
                    <div className={styles.toggleContainer}>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === "editor" ? styles.active : ""}`}
                            onClick={() => setViewMode("editor")}
                        >
                            <Edit size={14} /> Editor
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === "preview" ? styles.active : ""}`}
                            onClick={() => setViewMode("preview")}
                        >
                            <Eye size={14} /> Preview
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === "pdf" ? styles.active : ""}`}
                            onClick={() => setViewMode("pdf")}
                        >
                            <FileText size={14} /> Original
                        </button>
                    </div>
                </div>
                <div className={styles.viewerContainer}>
                    {viewMode === "editor" ? (
                        <SmartSectionEditor
                            sections={result.sections || []}
                            onSave={handleRescore}
                        />
                    ) : viewMode === "preview" ? (
                        <ResumePreview sections={result.sections || []} />
                    ) : (
                        <ResumeViewer fileUrl={fileUrl} />
                    )}
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.panelHeader}>
                    <h2 className={styles.panelTitle}>Analysis Results</h2>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} /> Upload New
                    </Link>
                </div>

                <div className={styles.panelContent}>
                    <div className={styles.analysisView}>
                        <div className={styles.scoreCard}>
                            <div className={styles.scoreCircle}>
                                <span className={styles.scoreValue}>{result.score}</span>
                                <span className={styles.scoreLabel}>Score</span>
                            </div>
                            <div className={styles.scoreInfo}>
                                <h3 className={styles.scoreTitle}>ATS Compatibility</h3>
                                <p className={styles.scoreDesc}>
                                    {result.score >= 70 ? "Optimized" : "Needs Improvement"}
                                </p>
                            </div>
                        </div>

                        {result.role && (
                            <SkillsChart
                                distribution={result.role.distribution}
                                predictedRole={result.role.predicted}
                            />
                        )}

                        <div className={styles.sectionsGrid}>
                            {result.sections?.map((section, i) => (
                                <div key={i} className={styles.sectionCard}>
                                    <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>{section.name}</h4>
                                        <span className={`${styles.badge} ${section.score >= 80 ? styles.success : styles.warning}`}>
                                            {section.score}%
                                        </span>
                                    </div>
                                    {section.issues.length > 0 ? (
                                        <ul className={styles.issueList}>
                                            {section.issues.map((issue, j) => (
                                                <li key={j} className={styles.issueItem}>
                                                    <AlertTriangle size={14} /> {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className={styles.noIssues}>
                                            <CheckCircle size={14} /> No issues found
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.generalIssues}>
                            <h3 className={styles.generalTitle}>General Feedback</h3>
                            <div className={styles.feedbackGroup}>
                                <h4>Missing Keywords</h4>
                                <div className={styles.tags}>
                                    {result.keywords.missing.map((k, i) => (
                                        <span key={i} className={styles.tagMissing}>{k}</span>
                                    ))}
                                    {result.keywords.missing.length === 0 && <span className={styles.tagSuccess}>All good!</span>}
                                </div>
                            </div>
                            <div className={styles.feedbackGroup}>
                                <h4>Formatting</h4>
                                <ul className={styles.issueList}>
                                    {result.formatting.issues.map((issue, i) => (
                                        <li key={i} className={styles.issueItem}><AlertTriangle size={14} /> {issue}</li>
                                    ))}
                                    {result.formatting.issues.length === 0 && <li className={styles.noIssues}><CheckCircle size={14} /> Perfect formatting!</li>}
                                </ul>
                            </div>
                        </div>

                        <ParsingExplainer />
                    </div>
                </div>
            </div>
        </div>
    );
}
