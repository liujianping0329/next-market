"use client";

import { useState } from "react";

const format = (value, unit) => {
    if (value == null || !Number.isFinite(Number(value))) return null;
    return `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 1 })} ${unit}`;
};

const getStatus = (value, min, max) => {
    if (min != null && value < Number(min) * 0.8) return [`不足 ${Math.round((Number(min) - value) / Number(min) * 100)}%`, "bg-orange-50 text-orange-700", "bg-orange-500"];
    if (min != null && value < Number(min)) return ["稍低", "bg-amber-50 text-amber-700", "bg-amber-400"];
    if (max != null && value > Number(max) * 1.2) return [`超标 ${Math.round((value - Number(max)) / Number(max) * 100)}%`, "bg-rose-50 text-rose-600", "bg-rose-500"];
    if (max != null && value > Number(max)) return ["稍高", "bg-pink-50 text-pink-600", "bg-pink-400"];
    return ["适中", "bg-emerald-50 text-emerald-700", "bg-emerald-500"];
};

const getWalkingCalories = (report, target) => {
    if (report.step_count == null || target.walking_kcal_per_step == null) return null;
    const steps = Number(report.step_count);
    const kcalPerStep = Number(target.walking_kcal_per_step);
    if (!Number.isFinite(steps) || !Number.isFinite(kcalPerStep)) return null;

    return { steps, calories: steps * kcalPerStep };
};

const addWalkingCalories = (value, walkingCalories) => value == null ? null : Number(value) + walkingCalories;

const getNutritionScore = (report, target) => {
    const walkingCalories = getWalkingCalories(report, target)?.calories ?? 0;
    const items = [
        [report.nut_calories_kcal, addWalkingCalories(target.energy_kcal_min, walkingCalories), addWalkingCalories(target.energy_kcal_max, walkingCalories)],
        [report.nut_protein_g, target.protein_g_min, target.protein_g_max],
        [report.nut_fat_g, target.fat_g_min, target.fat_g_max],
        [report.nut_saturated_fat_g, null, target.saturated_fat_g_max],
        [report.nut_carbohydrate_g, target.carbohydrate_g_min, target.carbohydrate_g_max],
        [report.nut_dietary_fiber_g, target.dietary_fiber_g_min, null],
        [report.nut_vitamin_a_ug, target.vitamin_a_ug_rae_min, null],
        [report.nut_vitamin_b1_mg, target.vitamin_b1_mg_min, null],
        [report.nut_vitamin_b2_mg, target.vitamin_b2_mg_min, null],
        [report.nut_vitamin_b6_mg, target.vitamin_b6_mg_min, null],
        [report.nut_vitamin_b12_ug, target.vitamin_b12_ug_min, null],
        [report.nut_vitamin_c_mg, target.vitamin_c_mg_min, null],
        [report.nut_vitamin_d_ug, target.vitamin_d_ug_target, null],
        [report.nut_calcium_mg, target.calcium_mg_min, null],
        [report.nut_iron_mg, target.iron_mg_min, null],
        [report.nut_sodium_mg, null, target.sodium_mg_max],
        [report.nut_potassium_mg, target.potassium_mg_min, null],
    ].filter(([value, min, max]) => Number.isFinite(Number(value)) && ((min != null && Number.isFinite(Number(min))) || (max != null && Number.isFinite(Number(max)))));

    if (!items.length) return null;

    const total = items.reduce((sum, [value, min, max]) => {
        const numericValue = Number(value);
        if ((min != null && numericValue < Number(min) * 0.8) || (max != null && numericValue > Number(max) * 1.2)) return sum;
        if ((min != null && numericValue < Number(min)) || (max != null && numericValue > Number(max))) return sum + 0.5;
        return sum + 1;
    }, 0);

    return Math.round(total / items.length * 100);
};

const NutritionRow = ({ code, label, value, unit, min, max, statusMin = min, statusMax = max, targetSuffix }) => {
    const text = format(value, unit);
    if (!text) return null;

    const [status, statusClass, barClass] = getStatus(Number(value), statusMin, statusMax);
    const benchmark = Number(statusMax ?? statusMin ?? value);
    const percentage = Math.min(100, Math.max(8, Number(value) / benchmark * 100));
    const target = min != null && max != null ? `${format(min, unit)}–${format(max, unit)}` : min != null ? `${format(min, unit)} 以上` : `${format(max, unit)} 以下`;

    const targetText = targetSuffix ? `${target} + ${targetSuffix}` : target;

    return (
        <div className="space-y-2 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">{code}</span>
                <div className="min-w-0"><p className="font-semibold text-slate-800">{label}</p><p className="mt-0.5 text-xs text-slate-400">目标 {targetText}</p></div>
            </div>
            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_5rem] items-center gap-3 pl-12"><strong className="text-sm tabular-nums text-slate-950">{text}</strong><span className="h-2 overflow-hidden rounded-full bg-slate-100"><i className={`block h-full rounded-full ${barClass}`} style={{ width: `${percentage}%` }} /></span><span className={`w-full rounded-full px-2 py-1 text-center text-xs font-semibold ${statusClass}`}>{status}</span></div>
        </div>
    );
};

const DailyNutritionTargetDashboard = ({ report, target }) => {
    const [isOpen, setIsOpen] = useState(true);
    if (!target) return null;
    const walking = getWalkingCalories(report, target);
    const walkingCalories = walking?.calories ?? 0;
    const energyMin = addWalkingCalories(target.energy_kcal_min, walkingCalories);
    const energyMax = addWalkingCalories(target.energy_kcal_max, walkingCalories);
    const walkingSuffix = walking && `今日${walking.steps.toLocaleString("zh-CN")}步 ${format(walking.calories, "kcal")}`;

    return (
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(35,49,80,0.06)]">
            <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} className="flex w-full items-center justify-between bg-slate-50/80 px-4 py-3 text-left sm:px-5">
                <div><h2 className="text-sm font-semibold text-slate-800">宏量营养</h2><p className="mt-0.5 text-xs text-slate-400">依据每日目标估算</p></div>
                <span className="text-sm text-slate-400">{isOpen ? "收起" : "展开"}</span>
            </button>
            {isOpen && <div className="divide-y divide-slate-100">
                <NutritionRow code="E" label="热量" value={report.nut_calories_kcal} unit="kcal" min={target.energy_kcal_min} max={target.energy_kcal_max} statusMin={energyMin} statusMax={energyMax} targetSuffix={walkingSuffix} />
                <NutritionRow code="P" label="蛋白质" value={report.nut_protein_g} unit="g" min={target.protein_g_min} max={target.protein_g_max} />
                <NutritionRow code="F" label="脂肪" value={report.nut_fat_g} unit="g" min={target.fat_g_min} max={target.fat_g_max} />
                <NutritionRow code="SF" label="饱和脂肪" value={report.nut_saturated_fat_g} unit="g" max={target.saturated_fat_g_max} />
                <NutritionRow code="C" label="碳水化合物" value={report.nut_carbohydrate_g} unit="g" min={target.carbohydrate_g_min} max={target.carbohydrate_g_max} />
                <NutritionRow code="Fi" label="膳食纤维" value={report.nut_dietary_fiber_g} unit="g" min={target.dietary_fiber_g_min} />
                <h3 className="bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 sm:px-5">维生素</h3>
                <NutritionRow code="VA" label="维生素 A" value={report.nut_vitamin_a_ug} unit="μg" min={target.vitamin_a_ug_rae_min} />
                <NutritionRow code="B1" label="维生素 B1" value={report.nut_vitamin_b1_mg} unit="mg" min={target.vitamin_b1_mg_min} />
                <NutritionRow code="B2" label="维生素 B2" value={report.nut_vitamin_b2_mg} unit="mg" min={target.vitamin_b2_mg_min} />
                <NutritionRow code="B6" label="维生素 B6" value={report.nut_vitamin_b6_mg} unit="mg" min={target.vitamin_b6_mg_min} />
                <NutritionRow code="B12" label="维生素 B12" value={report.nut_vitamin_b12_ug} unit="μg" min={target.vitamin_b12_ug_min} />
                <NutritionRow code="VC" label="维生素 C" value={report.nut_vitamin_c_mg} unit="mg" min={target.vitamin_c_mg_min} />
                <NutritionRow code="VD" label="维生素 D" value={report.nut_vitamin_d_ug} unit="μg" min={target.vitamin_d_ug_target} />
                <h3 className="bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 sm:px-5">矿物质</h3>
                <NutritionRow code="Ca" label="钙" value={report.nut_calcium_mg} unit="mg" min={target.calcium_mg_min} />
                <NutritionRow code="Fe" label="铁" value={report.nut_iron_mg} unit="mg" min={target.iron_mg_min} />
                <NutritionRow code="Na" label="钠" value={report.nut_sodium_mg} unit="mg" max={target.sodium_mg_max} />
                <NutritionRow code="K" label="钾" value={report.nut_potassium_mg} unit="mg" min={target.potassium_mg_min} />
            </div>}
        </section>
    );
};

export default DailyNutritionTargetDashboard;
