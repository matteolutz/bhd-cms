const groupBy = <K, V>(array: V[], grouper: (item: V) => K): Map<K, V[]> => {
  const map = new Map<K, V[]>();

  for (const item of array) {
    const key = grouper(item);

    if (!map.has(key)) {
      map.set(key, []);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    map.get(key).push(item);
  }

  return map;
};

export default groupBy;
