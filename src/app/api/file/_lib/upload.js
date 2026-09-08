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

export async function upload(files, folder = "uploads") {
  const isSingle = !Array.isArray(files);
  const fileList = Array.isArray(files) ? files : [files];
  const urls = [];

  for (const file of fileList) {
    const fileName = crypto.randomUUID() + "-" + file.name;
    await supabase.storage.from("garden").upload(`${folder}/${fileName}`, file);
    const { data } = supabase.storage.from("garden").getPublicUrl(`${folder}/${fileName}`);

    urls.push(data.publicUrl);
  }
  return isSingle ? urls[0] : urls;
}