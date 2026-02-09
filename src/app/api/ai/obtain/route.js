import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request, context) {

    // const ai = new GoogleGenAI({ apiKey: "AIzaSyDmKNV2Jj62OAsLxfCT0kgeJpBL4grgCLQ" });

    // const response = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash',
    //     contents: '生成一篇优美的短文',
    // });

    // return NextResponse.json({ ans: response.text });
    return NextResponse.json({ ans: "这是一个示例回答。" });
}