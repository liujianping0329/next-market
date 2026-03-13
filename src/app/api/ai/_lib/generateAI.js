import { NextResponse } from "next/server";
import { generateText } from "ai";

import supabase from "@/app/utils/database";
// {
//   type: "XXX",定数表一定要有"aiTemplate_" + type的记录
//     filled: {
//     name1: "asasa"
//     name2: "dsds"
//   }
// }
export async function generateAI(questionTemplate) {
  const { data: aiTemplate } = await supabase.from("constants").select().match({
    category: "aiTemplate_" + questionTemplate.type
  }).single();

  let question = aiTemplate.value
  question = question.replace(/\$\{(\w+)\}/g, (_, key) => questionTemplate.filled[key] ?? "");

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

  return aiData;
}