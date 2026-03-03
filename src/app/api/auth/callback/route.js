import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/app/utils/supaConf";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    console.log(searchParams);
    const cookieStore = await cookies();
    const supabase = createServerClient(
        SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set({ name, value, ...options });
                });
            },
        }, auth: {
            flowType: "pkce",            // ✅ 强制走 code + PKCE
            detectSessionInUrl: false,   // ✅ 不要在前端解析 hash token（避免走 implicit）
        },
    }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(error);
    const user = data?.user;
    console.log(user);
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


    return NextResponse.redirect(`${origin}${next}`);
}