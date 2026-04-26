export interface TagColorOptions {
  id: string;
  color: string;
  label: string;
}

export const TAG_COLORS: TagColorOptions[] = [
  { id: "gray", color: "#6b7280", label: "Gray" },
  { id: "brown", color: "#a0522d", label: "Brown" },
  { id: "orange", color: "#f97316", label: "Orange" },
  { id: "yellow", color: "#fbbf24", label: "Yellow" },
  { id: "green", color: "#4ade80", label: "Green" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "purple", color: "#a855f7", label: "Purple" },
  { id: "pink", color: "#ec4899", label: "Pink" },
  { id: "red", color: "#ef4444", label: "Red" },
];

export const getRandomTagColor = () => {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
  return TAG_COLORS[randomIndex].color;
};
