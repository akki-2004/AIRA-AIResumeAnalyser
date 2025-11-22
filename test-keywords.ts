import { analyzeResume } from "./src/lib/analyzer";

const resumeText = `
I am a developer with experience in:
- ReactJS
- NextJS
- Node JS
- Postgres (SQL)
- Git / Github
- Problem-solving
`;

async function test() {
    console.log("Testing Keyword Matching...");
    const result = await analyzeResume(resumeText);

    console.log("Found Keywords:", result.keywords.found);
    console.log("Missing Keywords:", result.keywords.missing);
}

test();
