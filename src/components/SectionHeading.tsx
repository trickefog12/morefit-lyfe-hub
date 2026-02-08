import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  level = "h2",
  className,
}) => {
  const baseStyles = "font-bold mb-4";
  const sizeStyles = {
    h1: "text-4xl md:text-6xl",
    h2: "text-3xl md:text-4xl",
    h3: "text-2xl md:text-3xl",
    h4: "text-xl md:text-2xl",
    h5: "text-lg md:text-xl",
    h6: "text-base md:text-lg",
  };

  const HeadingTag = level;
  const combinedClassName = cn(baseStyles, sizeStyles[level], className);

  return <HeadingTag className={combinedClassName}>{children}</HeadingTag>;
};
