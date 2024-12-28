export const tagEquals = (
  schemaTag: string,
  blockTag: string | null,
  trueEquals = false,
) => {
  if (blockTag === null) blockTag = "";

  blockTag = blockTag.trim();
  schemaTag = schemaTag.trim();

  if (schemaTag === "") return trueEquals ? blockTag === "" : true;

  const schemaTagParts = schemaTag.split("/");
  const blockTagParts = blockTag.split("/");

  if (trueEquals && schemaTagParts.length !== blockTagParts.length)
    return false;

  if (blockTagParts.length < schemaTagParts.length) return false;

  for (let i = 0; i < schemaTagParts.length; i++) {
    if (schemaTagParts[i] !== blockTagParts[i]) return false;
  }

  return true;
};
