export const formatDateLocal = (date, format = "yyyy-MM-dd") => {
      const map = {
            yyyy: date.getFullYear(),
            MM: String(date.getMonth() + 1).padStart(2, "0"),
            dd: String(date.getDate()).padStart(2, "0"),
      };

      return format.replace(/yyyy|MM|dd/g, (token) => map[token]);
};
export const parseLocalDate = (str) => {
      if (!str) return new Date();
      const [y, m, d] = str.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
};