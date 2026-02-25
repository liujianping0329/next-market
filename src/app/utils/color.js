export const colorSets = {
    morandi: [
        "bg-slate-200",
        "bg-stone-200",
        "bg-zinc-200",
        "bg-rose-200",
        "bg-amber-200",
        "bg-emerald-200",
        "bg-sky-200",
        "bg-indigo-200",
    ],
    soft: [
        "bg-blue-100",
        "bg-green-100",
        "bg-pink-100",
        "bg-yellow-100",
    ],
};

export function pickColor(id, style = "morandi") {
    const colors = colorSets[style] || colorSets.morandi;
    return colors[id % colors.length];
}