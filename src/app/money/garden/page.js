"use client";
import GardenUI from './pageUI';
import supabase from "@/app/utils/database";
import { useSearchParams } from "next/navigation";

export async function Garden() {

    const searchParams = useSearchParams();
    return <GardenUI searchParams={searchParams} />;
}
export default Garden;