import supabase from "@/app/utils/database";

export async function deleteByPublicUrls(urls) {

  const paths = urls.map((url) => {
    const u = new URL(url);
    return u.pathname.split("/public/garden/")[1];
  });

  const { error } = await supabase.storage
    .from("garden")
    .remove(paths);

  if (error) throw error;
}