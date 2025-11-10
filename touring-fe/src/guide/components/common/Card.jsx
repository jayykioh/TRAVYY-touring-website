import React from "react";
import { cn } from "../../../lib/utils";

const Card = ({
  children,
  className = "",
  hover = false,
  onClick = null,
  padding = "md",
}) => {
  const paddingSizes = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        paddingSizes[padding],
        hover && "hover:shadow-md transition-shadow cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
