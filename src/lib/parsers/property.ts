type PropertyFields = {
  propertyname?: string;
  propertytype?: string;
  buildingfile?: string;
  treefile?: string;
};

const extractQuotedValue = (line: string) => {
  const match = line.match(/"([^"]*)"/);
  return match ? match[1] : "";
};

const getFileStem = (name: string) => {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? name;
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(0, dot) : base;
};

export const parsePropertyFile = (content: string, filename: string) => {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2 || lines[0] !== "YPRT") return null;
  const crc32 = Number(lines[1]);
  if (!Number.isFinite(crc32)) return null;

  const fields: PropertyFields = {};
  for (const line of lines.slice(2)) {
    const key = line.split(/\s+/)[0]?.toLowerCase();
    if (!key) continue;
    if (key in fields) continue;
    fields[key as keyof PropertyFields] = extractQuotedValue(line);
  }

  const label =
    fields.propertyname ||
    getFileStem(filename);
  const gr2Path = fields.buildingfile || fields.treefile;

  return {
    id: `asset_${crc32}`,
    label,
    crc32,
    gr2Path: gr2Path || undefined,
  };
};
