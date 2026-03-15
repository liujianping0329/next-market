import { NextResponse } from "next/server";
import { generateText, generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import sharp from "sharp";

import supabase from "@/app/utils/database";

export async function base64Upload(base64) {
  const filePath = `news/${Date.now()}.jpeg`;
  const buffer = Buffer.from(base64, "base64");

  const compressedBuffer = await sharp(buffer).resize(800, 800, {
    fit: "inside",
    withoutEnlargement: true,
  })
    .jpeg({ quality: 70 })
    .toBuffer();
  const { data, error } = await supabase.storage.from("garden")
    .upload(filePath, compressedBuffer, {
      contentType: "image/jpeg"
    });

  const { data: publicUrlData } = supabase.storage.from("garden").getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}