const { analyzeResume } = require("./src/lib/analyzer");

const sampleResume = `
John Doe
Email: john.doe@example.com
Phone: 1234567890

Experience
Software Engineer at Tech Co (2020 - Present)
- Built web apps using React and Node.js.

Education
BS in Computer Science, University of Tech

Skills
JavaScript, TypeScript, React, Node.js
`;

async function test() {
    try {
        const result = await analyzeResume(sampleResume);
        console.log("Analysis Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
