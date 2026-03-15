import supabase from "@/app/utils/database";

export async function base64Upload(base64) {
  const filePath = `news/${Date.now()}.jpeg`;
  const buffer = Buffer.from(base64, "base64");

  await supabase.storage.from("garden")
    .upload(filePath, buffer, {
      contentType: "image/jpeg"
    });

  const { data: publicUrlData } = supabase.storage.from("garden").getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}