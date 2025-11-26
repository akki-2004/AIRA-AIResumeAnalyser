import { analyzeResume } from "./src/lib/analyzer";

const complexResume = `
John Doe
Software Engineer
john@example.com | 555-0102

SUMMARY
Experienced developer with a focus on React and Node.js.

WORK EXPERIENCE
Senior Developer | Tech Corp | 2020 - Present
- Led a team of 5.
- Built amazing things.

PROJECTS
My Cool App
- Used React and TypeScript.

EDUCATION
B.S. Computer Science | University of Tech | 2016 - 2020

SKILLS
JavaScript, TypeScript, React, Node.js
`;

async function test() {
    console.log("Analyzing Complex Resume...");
    const result = await analyzeResume(complexResume);

    console.log("\n--- Section Extraction Results ---");
    result.sections.forEach(s => {
        console.log(`\nSECTION: [${s.name}]`);
        console.log(`Length: ${s.content.length}`);
        console.log(`Start: ${s.content.substring(0, 30).replace(/\n/g, ' ')}...`);
    });
}

test();
