import NewsUI from './pageUI';
import supabase from "@/app/utils/database";

export async function News() {
    return <NewsUI />;
}
export default News;