import { NextRequest, NextResponse } from "next/server";
import { analyzeWithJD } from "@/lib/analyzer";

const pdf = require("pdf-parse");

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const jdText = formData.get("jd") as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (!jdText) {
            return NextResponse.json({ error: "No job description provided" }, { status: 400 });
        }

        if (file.type === "application/pdf") {
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);
            const text = data.text;

            const analysisResult = await analyzeWithJD(text, jdText);

            return NextResponse.json({
                text,
                ...analysisResult
            });
        } else {
            return NextResponse.json(
                { error: "Only PDF files are supported currently." },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error processing tailoring request:", error);
        return NextResponse.json(
            { error: "Failed to analyze resume against JD." },
            { status: 500 }
        );
    }
}
