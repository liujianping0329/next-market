import { NextResponse } from "next/server";
//import supabase from "../../../utils/database";
import supabase from "@/app/utils/database";
export async function POST(request, context) {
    console.log("Request received in file upload route");
    const formData = await request.formData();
    const files = formData.getAll("files");
    const urls = [];
    for (const file of files) {
      const fileName = crypto.randomUUID() + "-" + file.name;
      await supabase.storage.from("garden").upload("uploads/" + fileName, file);
      const { data } = supabase.storage.from("garden").getPublicUrl(`uploads/${fileName}`);

      urls.push(data.publicUrl);
    }
    return NextResponse.json(urls);
}