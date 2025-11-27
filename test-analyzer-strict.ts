import { analyzeResume } from "./src/lib/analyzer";

const trickyResume = `
John Doe
Email: john.doe@example.com
Phone: 1234567890

Summary
I have extensive experience in web development and education. I love building projects.

Experience
Software Engineer at Tech Co (2020 - Present)
- Built web apps using React and Node.js.

Education
BS in Computer Science, University of Tech

Skills
JavaScript, TypeScript, React, Node.js
`;

async function test() {
    console.log("Testing strict parsing...");
    try {
        const result = await analyzeResume(trickyResume);

        // Check if "Experience" section starts at the correct place
        // The word "experience" appears in the Summary, but the Section Header "Experience" is later.
        const experienceSection = result.sections.find(s => s.name === "Experience");

        if (experienceSection) {
            console.log("Experience Section Found:", experienceSection.content.substring(0, 50) + "...");
            if (experienceSection.content.includes("Software Engineer")) {
                console.log("PASS: Correctly identified Experience section.");
            } else {
                console.log("FAIL: Experience section content is incorrect (likely picked up 'experience' from Summary).");
            }
        } else {
            console.log("FAIL: Experience section not found.");
        }

        console.log("Sections found:", result.sections.map(s => s.name).join(", "));

    } catch (error) {
        console.error("Error:", error);
    }
}

test();
