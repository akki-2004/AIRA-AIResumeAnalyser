export interface TextReplacement {
    original: string;
    replacement: string;
    index: number;
    length: number;
    type: "weak-verb" | "error" | "improvement";
}

export interface SectionAnalysis {
    name: string;
    content: string;
    issues: string[];
    score: number;
    replacements: TextReplacement[];
}

export interface AnalysisResult {
    score: number;
    keywords: {
        found: string[];
        missing: string[];
    };
    formatting: {
        issues: string[];
        score: number;
    };
    sections: SectionAnalysis[];
    suggestions: string[];
    role?: {
        predicted: string;
        distribution: Record<string, number>;
    };
}

export async function analyzeResume(text: string): Promise<AnalysisResult> {
    const lowerText = text.toLowerCase();

    // Common tech keywords with aliases for better matching
    const keywordMap: Record<string, string[]> = {
        "JavaScript": ["javascript", "js", "es6"],
        "TypeScript": ["typescript", "ts"],
        "React": ["react", "reactjs", "react.js"],
        "Next.js": ["next.js", "nextjs", "next js"],
        "Node.js": ["node.js", "nodejs", "node js"],
        "HTML": ["html", "html5"],
        "CSS": ["css", "css3"],
        "Git": ["git", "github", "gitlab"],
        "API": ["api", "rest", "graphql", "restful"],
        "Database": ["database", "db", "sql", "nosql", "mongo", "postgres"],
        "SQL": ["sql", "mysql", "postgresql", "postgres"],
        "Agile": ["agile", "scrum", "kanban"],
        "Communication": ["communication", "communicating"],
        "Teamwork": ["teamwork", "collaboration", "team player"],
        "Problem Solving": ["problem solving", "problem-solving", "troubleshooting"]
    };

    const found: string[] = [];
    const missing: string[] = [];

    Object.entries(keywordMap).forEach(([keyword, aliases]) => {
        const isFound = aliases.some(alias => {
            const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (alias.length < 4) {
                return new RegExp(`\\b${escapedAlias}\\b`, 'i').test(text);
            }
            return lowerText.includes(alias.toLowerCase());
        });

        if (isFound) {
            found.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    // Formatting Checks
    const formattingIssues: string[] = [];
    if (text.length < 200) formattingIssues.push("Resume content seems too short.");
    if (text.length > 5000) formattingIssues.push("Resume might be too long (over 2 pages).");
    if (!lowerText.includes("@") || !lowerText.includes("mail")) formattingIssues.push("Could not detect an email address.");
    if (!/\d{10,}/.test(text.replace(/\D/g, ''))) formattingIssues.push("Could not detect a phone number.");

    const formattingScore = Math.max(100 - (formattingIssues.length * 15), 0);

    // Section Parsing Logic
    const sections: SectionAnalysis[] = [];
    const sectionKeywords = {
        contact: ["contact", "email", "phone", "address", "linkedin", "contact info", "contact information"],
        experience: ["experience", "employment", "work history", "professional experience", "work experience", "career history", "employment history"],
        education: ["education", "university", "college", "degree", "academic", "qualifications", "education & qualifications", "academic background"],
        skills: ["skills", "technologies", "competencies", "languages", "technical skills", "core competencies", "skills & expertise", "technical proficiency", "software skills"],
        projects: ["projects", "portfolio", "personal projects", "key projects", "academic projects", "relevant projects"]
    };

    // Robust Section Parsing Logic
    const sectionPositions: { name: string; index: number }[] = [];

    // 1. Find the start index of each section
    Object.entries(sectionKeywords).forEach(([key, keywords]) => {
        const indices = keywords
            .map(k => {
                // Stricter Regex: Matches start of line or newline, followed by keyword, followed by colon or newline
                // This prevents matching "I have experience in..."
                const regex = new RegExp(`(?:^|\\n)\\s*${k}\\s*(?::|\\n|$)`, 'i');
                const match = text.match(regex);
                return match ? match.index : -1;
            })
            .filter(i => i !== undefined && i !== -1) as number[];

        if (indices.length > 0) {
            // We take the first occurrence of any keyword for this section
            sectionPositions.push({
                name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize (contact -> Contact)
                index: Math.min(...indices)
            });
        }
    });

    // 2. Sort sections by their position in the text
    sectionPositions.sort((a, b) => a.index - b.index);

    // 3. Helper to extract content based on sorted positions
    const extractSection = (sectionName: string): string => {
        const currentSection = sectionPositions.find(s => s.name.toLowerCase() === sectionName.toLowerCase());
        if (!currentSection) return "";

        const currentPosIndex = sectionPositions.findIndex(s => s.name === currentSection.name);
        const nextSection = sectionPositions[currentPosIndex + 1];

        const start = currentSection.index;
        const end = nextSection ? nextSection.index : text.length;

        // Remove the header itself (heuristic: remove first line or first 20 chars)
        const rawContent = text.slice(start, end).trim();
        const firstLineEnd = rawContent.indexOf('\n');
        if (firstLineEnd !== -1 && firstLineEnd < 50) {
            return rawContent.slice(firstLineEnd).trim();
        }
        return rawContent;
    };

    // 1. Contact
    // If "Contact" header is found, extractSection handles it.
    // If NOT found, we assume Contact is at the top, but we MUST stop before the first found section.
    let contactContent = extractSection("Contact");
    if (!contactContent) {
        const firstSectionIndex = sectionPositions.length > 0 ? sectionPositions[0].index : 500;
        contactContent = text.slice(0, firstSectionIndex).trim();
    }
    const contactIssues = [];
    const contactScope = contactContent || text.slice(0, 500);

    if (!contactScope.includes("@")) contactIssues.push("Missing email address");
    if (!/\d{10,}/.test(contactScope.replace(/\D/g, ''))) contactIssues.push("Missing phone number");
    if (!contactScope.toLowerCase().includes("linkedin.com") && !contactScope.toLowerCase().includes("github.com")) contactIssues.push("Consider adding a LinkedIn or GitHub profile link.");

    sections.push({
        name: "Contact",
        content: contactContent || text.slice(0, 200),
        issues: contactIssues,
        score: Math.max(100 - (contactIssues.length * 15), 0),
        replacements: []
    });

    // 2. Experience
    const expContent = extractSection("Experience");
    const expIssues = [];
    const expReplacements: TextReplacement[] = [];

    if (expContent.length < 50) expIssues.push("Experience section seems too short or missing.");
    if (!expContent.toLowerCase().includes("present") && !expContent.match(/\d{4}/)) expIssues.push("No dates detected in experience.");

    const strongVerbs = ["led", "developed", "managed", "created", "designed", "implemented", "optimized", "built", "engineered", "architected"];
    const weakVerbsMap: Record<string, string> = {
        "worked on": "Developed",
        "helped": "Assisted",
        "used": "Utilized",
        "made": "Created",
        "fixed": "Resolved",
        "did": "Executed"
    };

    Object.entries(weakVerbsMap).forEach(([weak, strong]) => {
        const regex = new RegExp(`\\b${weak}\\b`, 'gi');
        let match;
        while ((match = regex.exec(expContent)) !== null) {
            expReplacements.push({
                original: match[0],
                replacement: strong,
                index: match.index,
                length: match[0].length,
                type: "weak-verb"
            });
        }
    });

    const foundVerbs = strongVerbs.filter(v => expContent.toLowerCase().includes(v));
    if (foundVerbs.length < 3) expIssues.push(`Use more strong action verbs (e.g., "Developed", "Optimized"). Found: ${foundVerbs.length}`);

    sections.push({
        name: "Experience",
        content: expContent,
        issues: expIssues,
        score: Math.max(100 - (expIssues.length * 20), 0),
        replacements: expReplacements
    });

    // 3. Education
    const eduContent = extractSection("Education");
    const eduIssues = [];
    if (eduContent.length < 20) eduIssues.push("Education section seems too short or missing.");
    if (!eduContent.toLowerCase().match(/bachelor|master|phd|bs|ms|ba|ma|degree/)) eduIssues.push("Specify your degree type (e.g., Bachelor's, Master's).");

    sections.push({
        name: "Education",
        content: eduContent,
        issues: eduIssues,
        score: Math.max(100 - (eduIssues.length * 20), 0),
        replacements: []
    });

    // 4. Skills
    const skillsContent = extractSection("Skills");
    const skillsIssues = [];
    const keywordTarget = 12;
    const skillsScore = Math.min(Math.round((found.length / keywordTarget) * 100), 100);

    if (found.length < 8) skillsIssues.push(`Found only ${found.length} keywords. Target at least 8-12 technical skills.`);

    sections.push({
        name: "Skills",
        content: skillsContent,
        issues: skillsIssues,
        score: skillsScore,
        replacements: []
    });

    const totalScore = Math.round(sections.reduce((acc, s) => acc + s.score, 0) / sections.length);
    const suggestions: string[] = [];
    sections.forEach(s => {
        s.issues.forEach(issue => suggestions.push(`${s.name}: ${issue}`));
    });

    // 5. Skill Categorization & Role Prediction
    const skillCategories: Record<string, string[]> = {
        "Frontend": ["JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS", "Redux", "Vue", "Angular"],
        "Backend": ["Node.js", "Python", "Java", "C++", "SQL", "Database", "API", "Express", "Django", "Spring"],
        "DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD", "Git", "Jenkins", "Terraform", "Azure"],
        "Soft Skills": ["Communication", "Teamwork", "Problem Solving", "Leadership", "Agile"]
    };

    const skillDistribution: Record<string, number> = {
        "Frontend": 0,
        "Backend": 0,
        "DevOps": 0,
        "Soft Skills": 0
    };

    found.forEach(skill => {
        for (const [category, skills] of Object.entries(skillCategories)) {
            if (skills.includes(skill)) {
                skillDistribution[category]++;
            }
        }
    });

    // Determine Role
    let predictedRole = "General Software Engineer";
    const maxScore = Math.max(...Object.values(skillDistribution));
    if (maxScore > 0) {
        const topCategory = Object.keys(skillDistribution).find(key => skillDistribution[key] === maxScore);
        if (topCategory === "Frontend") predictedRole = "Frontend Developer";
        else if (topCategory === "Backend") predictedRole = "Backend Developer";
        else if (topCategory === "DevOps") predictedRole = "DevOps Engineer";
        else if (skillDistribution["Frontend"] > 0 && skillDistribution["Backend"] > 0) predictedRole = "Full Stack Developer";
    }

    const result = {
        score: totalScore,
        keywords: { found, missing },
        formatting: { issues: formattingIssues, score: formattingScore },
        sections,
        suggestions: suggestions.length > 0 ? suggestions : ["Great job! Your resume looks solid."],
        role: {
            predicted: predictedRole,
            distribution: skillDistribution
        }
    };

    console.log("--- Analysis Result ---");
    console.log("Predicted Role:", result.role.predicted);
    console.log("Skills Found:", result.keywords.found.join(", "));
    console.log("Sections:", result.sections.map(s => `${s.name} (${s.score}%)`).join(", "));
    console.log("-----------------------");

    return result;
}

export interface JdAnalysisResult extends AnalysisResult {
    jdMatch: {
        score: number;
        matchedKeywords: string[];
        missingKeywords: string[];
    };
}

export async function analyzeWithJD(resumeText: string, jdText: string): Promise<JdAnalysisResult> {
    const baseAnalysis = await analyzeResume(resumeText);

    const commonKeywords = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
        "HTML", "CSS", "Git", "API", "Database", "SQL", "Agile",
        "Communication", "Teamwork", "Problem Solving", "Python", "Java", "C++", "AWS", "Docker", "Kubernetes", "CI/CD", "Testing", "Jest", "Cypress"
    ];

    const jdLower = jdText.toLowerCase();
    const jdKeywords = commonKeywords.filter(k => jdLower.includes(k.toLowerCase()));

    if (jdKeywords.length < 3) {
        const words = jdLower.match(/\b\w{4,}\b/g) || [];
        const freq: Record<string, number> = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);
        jdKeywords.push(...sorted);
    }

    const resumeLower = resumeText.toLowerCase();
    const matchedKeywords = jdKeywords.filter(k => resumeLower.includes(k.toLowerCase()));
    const missingKeywords = jdKeywords.filter(k => !resumeLower.includes(k.toLowerCase()));

    const matchScore = Math.round((matchedKeywords.length / (jdKeywords.length || 1)) * 100);
    const tailoredScore = Math.round((baseAnalysis.score * 0.6) + (matchScore * 0.4));

    return {
        ...baseAnalysis,
        score: tailoredScore,
        jdMatch: {
            score: matchScore,
            matchedKeywords,
            missingKeywords
        },
        suggestions: [
            ...baseAnalysis.suggestions,
            missingKeywords.length > 0 ? `Add these keywords from the JD: ${missingKeywords.join(", ")}` : "Great match with the Job Description!"
        ]
    };
}
