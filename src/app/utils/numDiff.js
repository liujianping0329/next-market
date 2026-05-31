export const formatDiff = (diff) => {
  if (!diff || diff === 0) return "";
  const value = Number(diff);

  if (value > 0) {
    return `▲+${value}`;
  }

  return `▼${value}`;
};

export const getDiffClassName = (diff) => {
  const value = Number(diff ?? 0);

  if (value > 0) {
    return "text-red-500";
  }

  if (value < 0) {
    return "text-green-600";
  }

  return "text-slate-400";
};