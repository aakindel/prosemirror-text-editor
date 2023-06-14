import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// from https://github.com/shadcn/ui/blob/main/templates/next-template/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
