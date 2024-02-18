import { KeyboardEvent } from "react";

interface MenuItemProps {
  onClick: () => void;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label }) => {
  // Handle key events for accessibility, triggering onClick for space and enter keys
  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      // Allow the div to be focusable
      tabIndex={0}
      // Accessibility role for interactive element
      role="button"
      // Adding key press event for accessibility
      onKeyPress={handleKeyPress}
      // Cursor pointer to indicate clickability + accessible focus style
      className="px-4 py-3 hover:bg-neutral-100 focus:bg-neutral-200 cursor-pointer transition font-semibold outline-none focus:outline-none focus:ring-2 focus:ring-neutral-300"
      style={{
        // Visual feedback on click
        transform: "scale(0.98)",
        transition: "transform 0.1s ease-in-out",
      }}
      onMouseDown={() => (document.activeElement as HTMLElement).blur()}
    >
      {label}
    </div>
  );
};

export default MenuItem;
