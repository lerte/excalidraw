export const uint8ArrayToFile = (
  uint8Array: Uint8Array,
  fileName: string,
  type: string
) => {
  // 创建一个Blob对象，类型为空字符串，以便接受uint8Array中的数据
  const blob = new Blob([uint8Array], { type });
  // 创建一个File对象，使用传入的文件名和Blob对象
  const file = new File([blob], fileName, { type });
  return file;
};
