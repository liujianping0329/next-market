
export const encode = (o) =>
  btoa(JSON.stringify(o)).split("").reverse().join("");

export const decode = (s) =>
  JSON.parse(atob(s.split("").reverse().join("")));