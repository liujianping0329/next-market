import MngUserUI from './pageUI';
import supabase from "@/app/utils/database";

export async function MngUser({ }) {
    return <MngUserUI />;
}
export default MngUser;