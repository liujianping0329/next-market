import { NextResponse } from "next/server";
import supabase from "@/app/utils/database";
import ky from "ky";

/**
 * @swagger
 * /api/external/v1/push:
 *   post:
 *     summary: 发送推送
 *     description: 向指定星球发送一条推送消息
 *     tags:
 *       - Push
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planetId:
 *                 type: integer
 *                 description: 星球ID，默认1
 *                 example: 1
 *               detail:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: 推送标题
 *                     example: 每日简报
 *                   content:
 *                     type: string
 *                     description: 推送内容
 *                     example: 今日内容已经生成
 *             required:
 *               - detail
 *     responses:
 *       200:
 *         description: 推送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request, context) {
    const { planetId = 1, detail } = await request.json();
    const { data: tarUsersList } = await supabase.from('f_user').select("id").eq("planetId", planetId);

    const origin = new URL(request.url).origin;
    let pushInfo = {};
    let oneSignalPara = {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APPID,
        include_aliases: {
            external_id: tarUsersList.map(user => user.id),
        },
        target_channel: "push",
        headings: {
            en: detail.title || "no title"
        },
        contents: { en: detail.content || "no content" },
        web_url: `${origin}/${detail.path || ""}`
    };

    try {
        pushInfo = await ky.post(
            "https://api.onesignal.com/notifications?c=push",
            {
                headers: {
                    Authorization: `Key ${process.env.ONESIGNAL_API_KEY}`,
                },
                json: oneSignalPara,
            }
        ).json();
    } catch (error) {
        const err = await error.response.json();
        console.log(err);
        pushInfo.err = err;
    }
    return NextResponse.json({ pushInfo });
}