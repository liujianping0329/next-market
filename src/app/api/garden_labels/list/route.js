import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function GET() {
    const { data: allList } = await supabase.from("garden_labels")
        .select(`id,
            cate:garden_cate!garden_labels_cateId_fkey(
              id,
              name
            ),subCate:garden_cate!garden_labels_subCateId_fkey(
              id,
              name
            ),label:garden_cate!garden_labels_labelId_fkey(
              id,
              name
            ),gardenId`);
    return NextResponse.json({ list: allList });
}