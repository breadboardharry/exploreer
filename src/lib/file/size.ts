export type FileSizePresetId = "small" | "medium" | "large" | "custom";

export interface IRange {
  min: number;
  max: number;
}

export class Range implements IRange {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }
}

export class SizeRangeFilter extends Range {
  id: FileSizePresetId;
  label?: string;

  constructor(
    id: FileSizePresetId,
    label: string | undefined,
    min: number,
    max: number,
  ) {
    super(min, max);
    this.id = id;
    this.label = label;
  }
}

export const SmallSizeRange: SizeRangeFilter = new SizeRangeFilter(
  "small",
  "Petit",
  0,
  1_000_000,
); // < 1MB
export const MediumSizeRange: SizeRangeFilter = new SizeRangeFilter(
  "medium",
  "Moyen",
  1_000_000,
  10_000_000,
); // 1MB - 10MB
export const LargeSizeRange: SizeRangeFilter = new SizeRangeFilter(
  "large",
  "Grand",
  10_000_000,
  Infinity,
);
