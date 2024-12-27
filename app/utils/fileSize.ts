// should format the file size in bytes
// The function should return a string with the file size in a human-readable format
export const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} bytes`;
  }

  const kb = size / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};
