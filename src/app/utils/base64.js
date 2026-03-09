export const encode = (o) =>
  btoa(encodeURIComponent(JSON.stringify(o)))
    .split("")
    .reverse()
    .join("");

export const decode = (s) =>
  JSON.parse(
    decodeURIComponent(atob(s.split("").reverse().join("")))
  );