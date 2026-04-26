import { cn } from "@lib/utils/style.utils";
import { Button } from "@view/ui/button";
import { LuX } from "react-icons/lu";

export const TagBadge: React.FC<{
  name: string;
  color: string;
  clickable?: boolean;
  onClick?: () => void;
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
}> = ({ name, color, clickable, onClick, showRemove, onRemove, className }) => {
  const Container = clickable ? Button : "div";

  return (
    <Container
      className={cn(
        "h-5.5 flex items-center gap-0.5 pl-1.5 rounded-sm text-xs font-medium text-white max-w-full min-w-0" +
          (showRemove ? " pr-0.5" : " pr-1.5") +
          (clickable ? " hover:brightness-90" : ""),
        className,
      )}
      style={{ backgroundColor: color }}
      onClick={clickable ? onClick : undefined}
    >
      <span className="truncate">{name}</span>

      {showRemove && (
        <Button variant="ghost" size="icon-xxs" onClick={onRemove}>
          <LuX />
        </Button>
      )}
    </Container>
  );
};
