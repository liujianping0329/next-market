import MngUI from './pageUI';
import supabase from "@/app/utils/database";

export async function Mng({ params }) {
    const { role } = await params;
    return <MngUI role={role} />;
}
export default Mng;