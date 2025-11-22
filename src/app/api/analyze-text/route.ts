import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/analyzer";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const analysisResult = await analyzeResume(text);

        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error("Error processing text:", error);
        return NextResponse.json(
            { error: "Failed to process text" },
            { status: 500 }
        );
    }
}
