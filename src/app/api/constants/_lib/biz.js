



import supabase from "@/app/utils/database";

export async function getContants(contants) {
  const { data: constants } = await supabase.from("constants").select().match(contants).order('sort', { ascending: true });
  return constants;
}
