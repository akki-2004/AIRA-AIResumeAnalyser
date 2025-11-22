import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
const pdf = require("pdf-parse");
import { analyzeResume } from "@/lib/analyzer";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            const data = await pdf(buffer);
            text = data.text;
        } else {
            return NextResponse.json(
                { error: "Only PDF files are supported for deep analysis currently." },
                { status: 400 }
            );
        }

        const analysisResult = await analyzeResume(text);

        return NextResponse.json({ ...analysisResult, text });
    } catch (error) {
        console.error("Error processing resume:", error);
        return NextResponse.json(
            { error: "Failed to process resume" },
            { status: 500 }
        );
    }
}
