import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { isNearPoint } from "@/app/utils/location";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log("requestBody", requestBody);
    const { data: allList } = await supabase.from("location").select().eq("status", 1);
    const nearList = allList
        .map(item => {
            const result = isNearPoint(
                requestBody.lat,
                requestBody.lng,
                item.lat,
                item.lng,
                item.radius
            );

            return {
                ...item,
                distance: result.distance,
                isNear: result.isNear,
            };
        })
        .filter(item => item.isNear)
        .sort((a, b) => a.distance - b.distance);

    const nearestLocation = nearList?.[0];

    return NextResponse.json({ nearestLocation });
}