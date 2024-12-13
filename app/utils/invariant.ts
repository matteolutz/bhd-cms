import invariant from "tiny-invariant";

export function invariantFieldRequired<T>(
  field: T,
  fieldName?: string | { message: string },
): asserts field is NonNullable<T> {
  return invariant(
    !!field,
    typeof fieldName === "string"
      ? `${fieldName ?? "Field"} is required.`
      : fieldName?.message,
  );
}
