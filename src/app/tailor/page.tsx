"use client";

import { useState } from "react";
import styles from "./page.module.css";
import FileUpload from "@/components/FileUpload";
import ResumeViewer from "@/components/ResumeViewer";
import { JdAnalysisResult } from "@/lib/analyzer";
import { ArrowLeft, CheckCircle, AlertTriangle, Target, Briefcase } from "lucide-react";
import Link from "next/link";

export default function TailorPage() {
    const [step, setStep] = useState<"input" | "result">("input");
    const [file, setFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<JdAnalysisResult | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileUpload = (uploadedFile: File) => {
        setFile(uploadedFile);
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileUrl(e.target?.result as string);
        };
        reader.readAsDataURL(uploadedFile);
    };

    const handleAnalyze = async () => {
        if (!file || !jdText.trim()) {
            alert("Please upload a resume and enter a job description.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("jd", jdText);

            const response = await fetch("/api/tailor", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setResult(data);
            setStep("result");
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to analyze. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Tailoring your resume to the job description...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {step === "input" ? (
                <div className={styles.inputWrapper}>
                    <div className={styles.header}>
                        <Link href="/" className={styles.backLink}>
                            <ArrowLeft size={16} /> Back
                        </Link>
                        <h1 className={styles.title}>Tailor to Job Description</h1>
                        <p className={styles.subtitle}>
                            Upload your resume and paste the job description to see how well you match.
                        </p>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>1. Upload Resume</h2>
                            <FileUpload onFileUpload={handleFileUpload} />
                            {file && (
                                <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded flex items-center gap-2">
                                    <CheckCircle size={16} /> {file.name} uploaded
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>2. Paste Job Description</h2>
                            <textarea
                                className={styles.textarea}
                                placeholder="Paste the full job description here..."
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full mt-8 py-4 text-lg"
                        onClick={handleAnalyze}
                        disabled={!file || !jdText.trim()}
                    >
                        Analyze Match
                    </button>
                </div>
            ) : (
                <div className={styles.splitLayout}>
                    {/* Left Panel: PDF Viewer */}
                    <div className={styles.leftPanel}>
                        <div className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>Your Resume</h2>
                            <button onClick={() => setStep("input")} className={styles.backButton}>
                                <ArrowLeft size={16} /> New Analysis
                            </button>
                        </div>
                        <div className={styles.viewerContainer}>
                            <ResumeViewer fileUrl={fileUrl} />
                        </div>
                    </div>

                    {/* Right Panel: Tailoring Results */}
                    <div className={styles.rightPanel}>
                        <div className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>Match Analysis</h2>
                        </div>

                        <div className={styles.panelContent}>
                            {result && (
                                <div className={styles.resultsContent}>
                                    <div className={styles.scoreCard}>
                                        <div className={styles.scoreCircle}>
                                            <span className={styles.scoreValue}>{result.jdMatch.score}%</span>
                                            <span className={styles.scoreLabel}>Match</span>
                                        </div>
                                        <div>
                                            <h3 className={styles.scoreTitle}>Job Fit Score</h3>
                                            <p className={styles.scoreDesc}>
                                                {result.jdMatch.score >= 80 ? "Excellent Match!" : "Needs Tailoring"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>
                                            <Target size={20} /> Missing Keywords
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add these keywords to your resume to increase your match score.
                                        </p>
                                        <div className={styles.tags}>
                                            {result.jdMatch.missingKeywords.map((k, i) => (
                                                <span key={i} className={styles.tagMissing}>{k}</span>
                                            ))}
                                            {result.jdMatch.missingKeywords.length === 0 && (
                                                <span className={styles.tagSuccess}>All keywords matched!</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>
                                            <CheckCircle size={20} /> Matched Keywords
                                        </h3>
                                        <div className={styles.tags}>
                                            {result.jdMatch.matchedKeywords.map((k, i) => (
                                                <span key={i} className={styles.tagMatched}>{k}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.section}>
                                        <h3 className={styles.sectionTitle}>
                                            <Briefcase size={20} /> Tailoring Suggestions
                                        </h3>
                                        <ul className={styles.suggestionList}>
                                            {result.suggestions.map((s, i) => (
                                                <li key={i} className={styles.suggestionItem}>
                                                    <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-1" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
