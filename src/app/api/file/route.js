import { NextResponse } from "next/server";
import imageCompression from "browser-image-compression";
import supabase from "@/app/utils/database";
export async function POST(request, context) {
    console.log("Request received in file upload route");
    const formData = await request.formData();
    const files = formData.getAll("files");
    const urls = [];
    const ImgOptions = {
      maxSizeMB: 0.8,        // 最大 0.5MB
      maxWidthOrHeight: 1200 // 最长边 1200px
    };
    for (const file of files) {
      const fileName = crypto.randomUUID() + "-" + file.name;
      const compressedFile = await imageCompression(file, ImgOptions);
      await supabase.storage.from("garden").upload("uploads/" + fileName, compressedFile);
      const { data } = supabase.storage.from("garden").getPublicUrl(`uploads/${fileName}`);

      urls.push(data.publicUrl);
    }
    return NextResponse.json(urls);
}