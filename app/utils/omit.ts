const omit = <T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const newObj = { ...obj };
  keys.forEach((key) => delete newObj[key]);
  return newObj;
};

export default omit;
