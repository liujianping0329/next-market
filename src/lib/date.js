export const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
};
export const parseLocalDate = (str) => {
      if (!str) return new Date();
      const [y, m, d] = str.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
};