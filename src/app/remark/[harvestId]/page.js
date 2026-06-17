
import RemarkUI from './pageUI';
import supabase from "@/app/utils/database";

export const revalidate = 0;
export async function Remark({ params }) {
  const { harvestId } = await params;
  const { data: harvest } = await supabase.from("harvest").select("*,garden(*)").eq("id", harvestId).single();

  harvest.startTime = harvest.startTime.replace("T", " ").slice(0, 16);
  return <RemarkUI harvest={harvest} />;
}

export default Remark;

