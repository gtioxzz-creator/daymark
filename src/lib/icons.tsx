import {
  BookOpen,
  Cross,
  Droplets,
  Leaf,
  Moon,
  Sun,
  PersonStanding,
} from "lucide-react";
import type { Habit } from "./types";

export function HabitGlyph({
  icon,
  className,
}: {
  icon: Habit["icon"];
  className?: string;
}) {
  const props = { className, strokeWidth: 1.6 };
  switch (icon) {
    case "cross":
      return <Cross {...props} />;
    case "sun":
      return <Sun {...props} />;
    case "move":
      return <PersonStanding {...props} />;
    case "book":
      return <BookOpen {...props} />;
    case "water":
      return <Droplets {...props} />;
    case "moon":
      return <Moon {...props} />;
    default:
      return <Leaf {...props} />;
  }
}
