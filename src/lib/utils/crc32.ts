const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const toCaseAscii = (input: string) => input.toUpperCase();

export const getCaseCrc32 = (input: string) => {
  const str = toCaseAscii(input);
  let crc = 0xffffffff;
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i) & 0xff;
    crc = crcTable[(crc ^ code) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
