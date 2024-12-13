export const arrayMax = (
  arr: number[] | undefined,
  fallback: number,
): number => {
  console.log(arr);
  return arr && arr.length > 0 ? Math.max(...arr) : fallback;
};
