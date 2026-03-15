import { NextResponse } from "next/server";
import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

import supabase from "@/app/utils/database";
import { base64Upload } from "@/app/api/file/_lib/upload";
// {
//   type: "XXX",定数表一定要有"aiTemplate_" + type的记录
//   pic: requestBody.isPic,插图模式
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
    ...(aiTemplate.children.web
      ? {
        tools: {
          web_search: openai.tools.webSearch({}),
        },
      }
      : {}),
  });
  console.log(questionTemplate);
  console.log(aiTemplate.children.model);
  console.log(question);
  console.log(result.text);

  let ansJSON = JSON.parse(result.text.replace(/```json|```/g, "").trim())
  let picResult = {};
  let picPath = "";
  if (questionTemplate.pic) {
    const { data: aiPicTemplate } = await supabase.from("constants").select().match({
      category: "aiPicTemplate_" + questionTemplate.type
    }).single();

    let questionPic = aiPicTemplate.value
    questionPic = questionPic.replace(/\$\{ans\}/g, ansJSON.ans);
    console.log(questionPic);

    picResult = await generateImage({
      model: aiPicTemplate.children.model,
      prompt: questionPic,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      compression: 50
    });
    picPath = await base64Upload(picResult.image.base64);
  }

  const aiData = (() => {
    try {
      return {
        ans: null,
        ansJSON,
        ...(questionTemplate.pic && picResult ? { pic: picPath } : {}),
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