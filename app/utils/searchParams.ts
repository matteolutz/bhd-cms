import { useSearchParams } from "@remix-run/react";

export const useSearchParam = (
  param: string,
): [string | null, (value: string | null) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(param);

  const setValue = (value: string | null) => {
    setSearchParams((prev) => {
      if (value === null) {
        prev.delete(param);
      } else {
        prev.set(param, value);
      }

      return prev;
    });
  };

  return [value, setValue];
};
