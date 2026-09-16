"use client";

import { useState } from "react";

const formatValue = (value, unit) => {
    if (value === null || value === undefined || value === "") return null;

    const number = Number(value);
    if (!Number.isFinite(number)) return null;

    return `${number.toLocaleString("zh-CN", { maximumFractionDigits: 1 })} ${unit}`;
};

const NutritionRow = ({ icon, label, value, unit, tone }) => {
    const formattedValue = formatValue(value, unit);
    if (!formattedValue) return null;

    return (
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-slate-100 px-4 py-3 first:border-t-0 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm ${tone}`}>
                    {icon}
                </span>
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-slate-900">{formattedValue}</span>
        </div>
    );
};

const NutritionSection = ({ title, description, children }) => (
    <section className="border-t border-slate-200 first:border-t-0">
        <div className="flex items-baseline justify-between px-4 pb-2 pt-4 sm:px-5">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <span className="text-xs text-slate-400">{description}</span>
        </div>
        {children}
    </section>
);

const DailyNutritionDashboard = ({ report }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(35,49,80,0.06)]">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between bg-slate-50/80 px-4 py-3 text-left sm:px-5"
            >
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">全天营养估算</h2>
                    <p className="mt-0.5 text-xs text-slate-400">根据当天相册内容和共同用餐人数估算</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">仅供参考</span>
                    <span className="text-sm text-slate-400">{isOpen ? "收起" : "展开"}</span>
                </div>
            </button>

            {isOpen && <>
            <NutritionSection title="宏量营养" description="全天总量">
                <NutritionRow icon="热" label="热量" value={report.nut_calories_kcal} unit="kcal" tone="bg-orange-50 text-orange-600" />
                <NutritionRow icon="蛋" label="蛋白质" value={report.nut_protein_g} unit="g" tone="bg-sky-50 text-sky-600" />
                <NutritionRow icon="脂" label="脂肪" value={report.nut_fat_g} unit="g" tone="bg-amber-50 text-amber-600" />
                <NutritionRow icon="纤" label="膳食纤维" value={report.nut_dietary_fiber_g} unit="g" tone="bg-emerald-50 text-emerald-600" />
                <NutritionRow icon="碳" label="碳水化合物" value={report.nut_carbohydrate_g} unit="g" tone="bg-indigo-50 text-indigo-600" />
            </NutritionSection>

            <NutritionSection title="维生素" description="全天总量">
                <NutritionRow icon="A" label="维生素 A" value={report.nut_vitamin_a_ug} unit="μg" tone="bg-rose-50 text-rose-600" />
                <NutritionRow icon="B1" label="维生素 B1" value={report.nut_vitamin_b1_mg} unit="mg" tone="bg-violet-50 text-violet-600" />
                <NutritionRow icon="B2" label="维生素 B2" value={report.nut_vitamin_b2_mg} unit="mg" tone="bg-violet-50 text-violet-600" />
                <NutritionRow icon="B6" label="维生素 B6" value={report.nut_vitamin_b6_mg} unit="mg" tone="bg-violet-50 text-violet-600" />
                <NutritionRow icon="B12" label="维生素 B12" value={report.nut_vitamin_b12_ug} unit="μg" tone="bg-violet-50 text-violet-600" />
                <NutritionRow icon="C" label="维生素 C" value={report.nut_vitamin_c_mg} unit="mg" tone="bg-lime-50 text-lime-700" />
                <NutritionRow icon="D" label="维生素 D" value={report.nut_vitamin_d_ug} unit="μg" tone="bg-yellow-50 text-yellow-700" />
            </NutritionSection>

            <NutritionSection title="矿物质" description="全天总量">
                <NutritionRow icon="钙" label="钙" value={report.nut_calcium_mg} unit="mg" tone="bg-cyan-50 text-cyan-700" />
                <NutritionRow icon="铁" label="铁" value={report.nut_iron_mg} unit="mg" tone="bg-red-50 text-red-600" />
                <NutritionRow icon="钠" label="钠" value={report.nut_sodium_mg} unit="mg" tone="bg-orange-50 text-orange-700" />
                <NutritionRow icon="钾" label="钾" value={report.nut_potassium_mg} unit="mg" tone="bg-teal-50 text-teal-700" />
            </NutritionSection>
            </>}
        </section>
    );
};

export default DailyNutritionDashboard;
