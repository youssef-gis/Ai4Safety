import { LucideMessageSquareWarning } from "lucide-react";
import { cloneElement, ReactElement } from "react";

type PlaceholderProps<IconType extends ReactElement<{ className?: string }>, ButtonType extends ReactElement<{ className?: string }>> = {
  label: string;
  icon?: IconType;
  button?: ButtonType;
};

const Placeholder = <IconType extends ReactElement<{ className?: string }>, ButtonType extends ReactElement<{ className?: string }>>({
  label,
  icon = <LucideMessageSquareWarning /> as IconType,
  button = <div /> as ButtonType,
}: PlaceholderProps<IconType, ButtonType>) => {
  return (
    <div className="flex-1 self-center flex flex-col items-center justify-center gap-y-2">
      {icon && cloneElement(icon, {
        className: `w-16 h-16 ${icon.props.className || ''}`,
      })}
      <h2 className="text-lg text-center">{label}</h2>
      {button && cloneElement(button, {
        className: `h-10 ${button.props.className || ''}`,
      })}
    </div>
  );
};

export { Placeholder };