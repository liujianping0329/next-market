import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import { isNearPoint } from "@/app/utils/location";
import { BEIJING_PLACE_NAMES } from "@/app/utils/data";

export async function POST(request, context) {
    const requestBody = await request.json();
    console.log("requestBody", requestBody);
    const { data: allList } = await supabase.from("location").select().neq("status", -1).eq("planetId", requestBody.planetId);
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

    let nearestLocation = nearList[0];

    // 附近没有地点时自动创建
    if (!nearestLocation) {
        const randomName =
            BEIJING_PLACE_NAMES[
            Math.floor(Math.random() * BEIJING_PLACE_NAMES.length)
            ];

        const { data, error } = await supabase
            .from("location")
            .insert({
                name: randomName,
                lat: requestBody.lat,
                lng: requestBody.lng,
                planetId: requestBody.planetId,
                radius: 100,
                spendNames: ["饮料", "食材", "午餐"].join("\n"),
                status: 2,
            })
            .select()
            .single();

        if (error) {
            console.error("location insert error:", error);

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        nearestLocation = data;
    }

    return NextResponse.json({ nearestLocation });
}