"use client";

import FileUpload from "@/components/FileUpload";
import styles from "./page.module.css";
import { CheckCircle, BarChart2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Show loading state (optional, could add a spinner here)
      console.log("Uploading file...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await response.json();

      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        try {
          localStorage.setItem("resumeFile", base64);
        } catch (err) {
          console.warn("File too large to store for preview");
        }
        localStorage.setItem("analysisResult", JSON.stringify(data));
        router.push("/analyze");
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(error.message || "Failed to analyze resume. Please try again.");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <span className={styles.badge}>AI-Powered Resume Optimization</span>
        <h1 className={styles.title}>
          Beat the ATS & Land <br /> Your Dream Job
        </h1>
        <p className={styles.subtitle}>
          Get instant feedback, precise scoring, and actionable improvements to
          ensure your resume passes automated screenings.
        </p>
      </div>

      <div className={styles.optionsContainer}>
        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <BarChart2 size={24} className="text-primary" />
            <h3>General ATS Scan</h3>
          </div>
          <p>Get a comprehensive score and feedback based on general ATS standards.</p>
          <div className={styles.uploadWrapper}>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        </div>

        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <Zap size={24} className="text-yellow-500" />
            <h3>Tailor to Job Description</h3>
          </div>
          <p>Analyze your resume against a specific job description to maximize your match.</p>
          <button
            className="btn btn-primary w-full mt-4"
            onClick={() => router.push("/tailor")}
          >
            Start Tailoring
          </button>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.featureCard}>
          <BarChart2 className={styles.featureIcon} size={32} />
          <h3 className={styles.featureTitle}>Precise Scoring</h3>
          <p className={styles.featureDesc}>
            Get a detailed score based on industry standards and ATS algorithms.
          </p>
        </div>
        <div className={styles.featureCard}>
          <Zap className={styles.featureIcon} size={32} />
          <h3 className={styles.featureTitle}>Instant Feedback</h3>
          <p className={styles.featureDesc}>
            Identify missing keywords and formatting issues in seconds.
          </p>
        </div>
        <div className={styles.featureCard}>
          <CheckCircle className={styles.featureIcon} size={32} />
          <h3 className={styles.featureTitle}>Actionable Fixes</h3>
          <p className={styles.featureDesc}>
            Receive step-by-step guidance to improve your resume's impact.
          </p>
        </div>
      </div>
    </main>
  );
}
