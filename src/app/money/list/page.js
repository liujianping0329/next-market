import ky from 'ky';
import MoneyListUI from './pageUI';
import supabase from '../../utils/database';
export const revalidate = 0;
export async function MoneyList () {
    const paraExchange = {
        to: 'JPY',
        version: 2,
        key: '4bd5698591ec2b8ad65e16994e783d39',
    };
    const [{ result: [{ exchange: cnyToJpy }] },
        { result: [{ exchange: twdToJpy }] },
        { result: [{ exchange: usdToJpy }] }] = await Promise.all([
      fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
        from: 'CNY',...paraExchange
      }).toString()}`, {
        next: { revalidate: 7200 }
      }).then(r => r.json()),

      fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
        from: 'TWD',...paraExchange
      }).toString()}`, {
        next: { revalidate: 7200 }
      }).then(r => r.json()),

      fetch(`http://op.juhe.cn/onebox/exchange/currency?${new URLSearchParams({
        from: 'USD',...paraExchange
      }).toString()}`, {
        next: { revalidate: 7200 }
      }).then(r => r.json()),
    ]);
    const{ data:list } = await supabase.from("money").select().order('date', { ascending: false });
    return <MoneyListUI list = {list} exchanges = {{cnyToJpy:Number(cnyToJpy).toFixed(2),twdToJpy:Number(twdToJpy).toFixed(2),usdToJpy:Number(usdToJpy).toFixed(2)}} />;
}

export default MoneyList;

