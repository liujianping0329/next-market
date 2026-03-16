import MngUI from './pageUI';
import supabase from "@/app/utils/database";

export async function Mng({ params }) {
    return <MngUI role={await params.role} />;
}
export default Mng;