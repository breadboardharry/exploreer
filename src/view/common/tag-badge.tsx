import { cn } from "@lib/utils/style.utils";
import { Button } from "@view/ui/button";
import { LuX } from "react-icons/lu";

export const TagBadge: React.FC<{
  name: string;
  color: string;
  clickable?: boolean;
  onClick?: () => void;
  showRemove?: boolean | "hover";
  onRemove?: () => void;
  className?: string;
  truncate?: boolean;
}> = ({
  name,
  color,
  clickable,
  onClick,
  showRemove,
  onRemove,
  className,
  truncate = true,
}) => {
  const Container = clickable ? Button : "div";

  return (
    <Container
      className={cn(
        "group h-5.5 flex items-center gap-0.5 pl-1.5 rounded-sm text-xs font-medium text-white max-w-full min-w-0" +
          (showRemove
            ? showRemove === "hover"
              ? " pr-1.5 hover:pr-0.5"
              : " pr-0.5"
            : " pr-1.5") +
          (clickable ? " hover:brightness-90" : ""),
        className,
      )}
      style={{ backgroundColor: color }}
      onClick={clickable ? onClick : undefined}
    >
      <span className={truncate ? "truncate" : ""}>{name}</span>

      {showRemove && (
        <Button
          variant="ghost"
          size="icon-xxs"
          className={
            showRemove === "hover" ? "hidden group-hover:inline-flex" : ""
          }
          onClick={onRemove}
        >
          <LuX />
        </Button>
      )}
    </Container>
  );
};
