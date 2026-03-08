export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateText } from "ai";

import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const requestBody = await request.json();
    const { data: aiTemplate } = await supabase.from("constants").select().match({
        category: "aiTemplate_" + requestBody.type
    }).single();

    let question = aiTemplate.value
    if (requestBody.type === "garden") {
        question = question
            .replace(/\$\{(\w+)\}/g, (_, key) => requestBody[key] ?? "");
    }

    const result = await generateText({
        model: aiTemplate.children.model,
        prompt: question,
    });
    console.log(question);

    const aiData = (() => {
        try {
            return {
                ans: null,
                ansJSON: JSON.parse(result.text.replace(/```json|```/g, "").trim())
            };
        } catch {
            return {
                ans: result.text,
                ansJSON: null
            };
        }
    })();
    if (requestBody.type === "garden") {
        await supabase.from('garden_ai').upsert({
            ...(requestBody.garden_ai?.[0]?.id && { id: requestBody.garden_ai?.[0]?.id }),
            gardenId: requestBody.id,
            ...aiData,
            cost: result.providerMetadata.gateway.marketCost
        }).select().eq("id", requestBody.id);
    }

    return NextResponse.json({ ans: "这是一个示例回答。" });
}