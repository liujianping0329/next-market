export const formatDateLocal = (date, format = "yyyy-MM-dd") => {
      const map = {
            yyyy: date.getFullYear(),
            MM: String(date.getMonth() + 1).padStart(2, "0"),
            dd: String(date.getDate()).padStart(2, "0"),
            hh: String(date.getHours()).padStart(2, "0"),
            HH: String(date.getHours()).padStart(2, "0"),
            mm: String(date.getMinutes()).padStart(2, "0"),
            ss: String(date.getSeconds()).padStart(2, "0"),
      };

      return format.replace(/yyyy|MM|dd|HH|hh|mm|ss/g, (token) => map[token]);
};
export const parseLocalDate = (str) => {
      if (!str) return new Date();
      const [y, m, d] = str.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
};

export const parseLocalDateTime = (str) => {
      if (!str) return new Date();
      const [datePart, timePart] = str.split(" ");
      const [y, m, d] = datePart.split("-");
      const [hh, mm] = timePart.split(":");

      return new Date(
            Number(y),
            Number(m) - 1,
            Number(d),
            Number(hh),
            Number(mm)
      );
};

export const pullToZero = (date, days = 0) => {
      console.log("1", date)
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + days)
      console.log("2", d)
      return d;
};

export const pushToLast = (date, days = 0) => {
      const d = new Date(date)
      d.setHours(23, 59, 59, 999)
      d.setDate(d.getDate() + days)
      return d;
};

export const changeDay = (date, days = 0) => {
      const d = new Date(date)
      d.setDate(d.getDate() + days)
      return d;
};

export const pullToHour = (date) => {
      const d = new Date(date)
      d.setMinutes(0, 0, 0)
      return d
}

export const diffHours = (a, b) => {
      const d1 = new Date(a)
      const d2 = new Date(b)
      return Math.floor((d1 - d2) / (1000 * 60 * 60))
}