"use client";

import { useState } from "react";
import styles from "./ParsingExplainer.module.css";
import { Info, ChevronDown, ChevronUp, Code, FileSearch, Cpu } from "lucide-react";

export default function ParsingExplainer() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.container}>
            <button
                className={styles.toggleBtn}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.btnContent}>
                    <Info size={18} />
                    <span>How did we analyze this?</span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <div className={styles.content}>
                    <div className={styles.step}>
                        <div className={styles.iconBox}><FileSearch size={20} /></div>
                        <div>
                            <h4>1. Text Extraction</h4>
                            <p>We use <code>pdf-parse</code> to extract raw text from your PDF file. This converts the visual document into a stream of characters that our engine can read.</p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.iconBox}><Code size={20} /></div>
                        <div>
                            <h4>2. Section Identification</h4>
                            <p>Our engine scans for headers like "Experience" or "Education" using <strong>Regular Expressions (Regex)</strong>. We identify the boundaries of each section to process them individually.</p>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.iconBox}><Cpu size={20} /></div>
                        <div>
                            <h4>3. Keyword Matching</h4>
                            <p>We compare your text against a database of industry keywords. We use fuzzy matching to catch variations (e.g., "ReactJS" matches "React") and categorize them into skills.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
