import { analyzeResume } from "./src/lib/analyzer";

const strongResume = `
Jane Doe
Email: jane.doe@example.com
Phone: 1234567890
LinkedIn: linkedin.com/in/janedoe
GitHub: github.com/janedoe

Experience
Senior Software Engineer at Tech Corp (2018 - Present)
- Led a team of 5 developers to build a scalable React application.
- Optimized database queries, reducing load times by 40%.
- Designed and implemented a microservices architecture using Node.js.

Education
Master of Science in Computer Science, Stanford University

Skills
JavaScript, TypeScript, React, Next.js, Node.js, HTML, CSS, Git, API, Database, SQL, Agile, Communication, Teamwork, Problem Solving
`;

const weakResume = `
John Smith
Email: john@email.com
Phone: 0987654321

Experience
Developer at Small Co
- Wrote code.
- Fixed bugs.

Education
College Degree

Skills
JavaScript, HTML
`;

async function test() {
    console.log("Analyzing Strong Resume...");
    const resultStrong = await analyzeResume(strongResume);
    console.log("Strong Score:", resultStrong.score);
    console.log("Strong Sections:", resultStrong.sections.map(s => `${s.name}: ${s.score}`).join(", "));

    console.log("\nAnalyzing Weak Resume...");
    const resultWeak = await analyzeResume(weakResume);
    console.log("Weak Score:", resultWeak.score);
    console.log("Weak Sections:", resultWeak.sections.map(s => `${s.name}: ${s.score}`).join(", "));
}

test();
