const GRADIENT_PALETTES: string[] = [
  'from-sky-100 to-indigo-200',
  'from-cyan-50 to-teal-100',
  'from-blue-50 to-purple-100',
  'from-emerald-100 to-teal-100',
  'from-sky-50 to-blue-100',
  'from-yellow-100 to-orange-200',
  'from-amber-50 to-red-100',
  'from-lime-50 to-green-100',
  'from-rose-50 to-pink-100',
] as const;

// Determines a specific gradient class based on a unique string (URL).
export const getGradientClasses = (url: string): string => {
  // Use a simple hash function (sum of character codes) to get a deterministic number
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash += url.charCodeAt(i);
  }

  // Choose a palette based on the hash remainder
  const paletteIndex = hash % GRADIENT_PALETTES.length;
  const gradientClass = GRADIENT_PALETTES[paletteIndex];

  // Apply diagonal gradient direction
  return `bg-gradient-to-br ${gradientClass}`;
};
