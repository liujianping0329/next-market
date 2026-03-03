import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    const user = data?.user;
    if (user) {
        const avatarUrl =
            user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        const fullName =
            user.user_metadata?.full_name || user.user_metadata?.name || null;

        await supabase.from("f_user").upsert(
            {
                userId: user.id,
                avatarUrl: avatarUrl,
                fullName: fullName
            });
    }

    console.log(requestBody);
    return NextResponse.redirect(`${origin}${next}`);
}