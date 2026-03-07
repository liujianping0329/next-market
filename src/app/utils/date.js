// date->string
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

// string -> date
export const parseLocalDate = (str) => {
      if (!str) return new Date();
      const [y, m, d] = str.split("-");
      return new Date(Number(y), Number(m) - 1, Number(d));
};

// string -> datetime
export const parseLocalDateTime = (str) => {
      if (!str) return null;
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
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + days)
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

export const calcRemindTime = (startTime, remindBeforeMin) => {
      const d = new Date(startTime);
      d.setMinutes(d.getMinutes() - remindBeforeMin);

      const yyyy = d.getFullYear();
      const MM = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");

      return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}+09:00`;
}