"use client";

import styles from "./SkillsChart.module.css";
import { PieChart, BarChart3, Briefcase } from "lucide-react";

interface SkillsChartProps {
    distribution: Record<string, number>;
    predictedRole: string;
}

export default function SkillsChart({ distribution, predictedRole }: SkillsChartProps) {
    const totalSkills = Object.values(distribution).reduce((a, b) => a + b, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.roleBadge}>
                    <Briefcase size={16} />
                    <span>Best Fit: <strong>{predictedRole}</strong></span>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>
                    <BarChart3 size={16} /> Skill Distribution
                </h4>
                <div className={styles.bars}>
                    {Object.entries(distribution).map(([category, count]) => {
                        const percentage = totalSkills > 0 ? Math.round((count / totalSkills) * 100) : 0;
                        return (
                            <div key={category} className={styles.barRow}>
                                <div className={styles.barLabel}>
                                    <span>{category}</span>
                                    <span className={styles.barCount}>{count}</span>
                                </div>
                                <div className={styles.track}>
                                    <div
                                        className={`${styles.fill} ${styles[category.toLowerCase().replace(" ", "")]}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
