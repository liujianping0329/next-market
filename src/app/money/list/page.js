import MoneyListUI from './pageUI';
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
    return <MoneyListUI exchanges = {{cnyToJpy,twdToJpy,usdToJpy}} />;
}

export default MoneyList;

