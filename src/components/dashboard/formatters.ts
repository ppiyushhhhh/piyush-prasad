export const fmtDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : null;

export const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : null;

export const boolLabel = (value?: boolean | null) =>
  value === null || value === undefined ? null : value ? "OK" : "Failing";
