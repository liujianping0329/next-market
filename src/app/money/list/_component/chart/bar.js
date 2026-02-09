"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ResponsiveContainer } from 'recharts';

export function toBarChartData(rows) {
  const round2 = (n) => Math.round(n * 100) / 100;
  return [...(rows ?? [])]
    .reverse()
    .slice(1)
    .map(row => {
      const detail = row.detail;

      const jpyX = Number(detail.jpyX) || 0;      // 万日元
      const nisaX = Number(detail.nisaX) || 0;    // 万日元
      const twd = Number(detail.twd) || 0;        // 台币
      const twdToJpy = Number(row.twdToJpy) || 0; // 汇率

      // 台币 → 日元 → 万日元
      const twdInManJpy = (twd * twdToJpy) / 10000;

      const moneyX = jpyX + nisaX + twdInManJpy;

      const total = Number(row.total) || 0;

      // ✅ 差值（如果不允许负数就 clamp 到 0）
      const moneyL = total - moneyX;

      return {
        ...row,
        moneyX: round2(moneyX),
        moneyL: round2(moneyL),
      };
    });
}

const Bar = ({ data }) => {
    const LABEL_MAP = {
      moneyX: "许",
      moneyL: "刘",
    };
    return (
        <div className="w-full max-w-[700px] aspect-[4/5] sm:aspect-[1.618]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}
                    margin={{
                      top: 20,
                      right: 0,
                      left: 0,
                      bottom: 0,
                    }}
                >
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 'dataMax + 20']} />
                    <Tooltip
                      formatter={(value, name) => {
                        const label = LABEL_MAP[name] ?? name;
                        return [Number(value).toFixed(2), label];
                      }}
                    />
                    <Area type="monotone" dataKey="moneyX" stackId="1" stroke="#84a8d8ff" fill="#84a8d8ff" />
                    <Area type="monotone" dataKey="moneyL" stackId="1" stroke="#ca82b8ff" fill="#ca82b8ff" />
                    {/* <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" /> */}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
export default Bar;