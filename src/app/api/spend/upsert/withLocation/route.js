import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";

export async function POST(request, context) {
    const { newLocationName, ...spendReq } = await request.json();
    const { data, error } = await supabase.from('spend').upsert(spendReq).select();

    let updateLocationDataRes = null;
    if (spendReq.locationId && newLocationName && !spendReq.id) {
        const { data: locationData, error: locationError } = await supabase.from('location').select().eq('id', spendReq.locationId).single();
        if (locationData && newLocationName !== locationData.name) {
            const { data: updateLocationData, error: updateLocationError } = await supabase
                .from('location')
                .update({ name: newLocationName, status: 1 })
                .eq('id', spendReq.locationId)
                .select()
                .single();
            updateLocationDataRes = updateLocationData;
        }
    }
    return NextResponse.json({ updatedLocation: updateLocationDataRes });
}