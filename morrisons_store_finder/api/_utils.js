function toQueryString(params) {
  return (
    '?' +
    Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
  );
}

module.exports = { toQueryString };
