import { GoogleGenAI } from "@google/genai";
import AiMainPageUI from "./pageUI";

export async function AiMainPage () {

    // const ai = new GoogleGenAI({ apiKey: "AIzaSyDmKNV2Jj62OAsLxfCT0kgeJpBL4grgCLQ" });
    
        const response1 = { text: "欢迎使用AI助手！请告诉我您需要什么帮助。" };

        // const response2 = await ai.models.generateContent({
        //     model: 'gemini-2.5-flash',
        //     contents: '美股和日股今日走势分析',
        // });

        // const response3 = await ai.models.generateContent({
        //     model: 'gemini-2.5-flash',
        //     contents: '东京最新周末好去处推荐，商场活动',
        // });
    return <AiMainPageUI data={response1.text} />;
}

export default AiMainPage;