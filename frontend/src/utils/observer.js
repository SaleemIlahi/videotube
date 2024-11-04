export const observer = (cb, options) => {
  return new IntersectionObserver(cb, options);
};
