export const arrayMax = (
  arr: number[] | undefined,
  fallback: number,
): number => {
  console.log(arr);
  return arr && arr.length > 0 ? Math.max(...arr) : fallback;
};

export const uniqueArray = <T>(...array: T[]): T[] => [...new Set(array)];

export const arrayWithout = <T>(array: T[], ...values: T[]): T[] =>
  array.filter((item) => !values.includes(item));
