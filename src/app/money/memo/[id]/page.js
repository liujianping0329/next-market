import MemoDetailUI from './pageUI';
import supabase from "@/app/utils/database";

export async function MemoDetail ({ params }) {
    const { id } = await params;
    
    let { data: money } = await supabase.from('money').select('*').eq('id', id).single();
    let { data: moneyPrev } = await supabase.from('money').select('*').lt('date', money.date)
        .order('date', { ascending: false }).limit(1).single();
    let profitText = "—";

    if (moneyPrev) {
      const profit = Number(money.total) - Number(moneyPrev.total);
      const sign = profit > 0 ? "+" : profit < 0 ? "" : "+";
      profitText = `${sign}${profit.toFixed(2)}`;
    }
    console.log("Fetched Money Data:", profitText);
    let { data: memoList } = await supabase.from('money_memo').select('*')
        .lte('date', money.date).gt('date', moneyPrev?.date || money.date);

    return <MemoDetailUI basicData = {{...money, profitText}} memoList={memoList} />;
}
export default MemoDetail;