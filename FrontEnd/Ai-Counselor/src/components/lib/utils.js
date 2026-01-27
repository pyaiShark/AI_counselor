export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
/**
 * This utility provides a robust way to merge Tailwind CSS classes.
 * 
 * - `clsx`: Handles conditional class strings, arrays, and objects.
 * - `twMerge`: Intelligently merges Tailwind classes, ensuring the last one 
 *   wins when multiple classes target the same CSS property.
 * 
 * This is necessary for building composable UI components that can accept 
 * a `className` prop to override or extend default styles without conflicts.
 */
