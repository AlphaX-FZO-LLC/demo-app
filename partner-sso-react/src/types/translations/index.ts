export interface TranslationsTypes {
  landing: {
  "AlphaX": "AlphaX",
  "Features": "Features",
  "Documentation": "Documentation",
  "GitHub": "GitHub",
  "Toggle theme": "Toggle theme",
  "English": "English",
  "New Release AlphaX v1.0 is now available": "New Release AlphaX v1.0 is now available",
  "AlphaX Starter Next.js": "AlphaX Starter Next.js",
  "Build beautiful, responsive web applications with our modern Next.js starter kit. Packed with features to accelerate your development workflow.": "Build beautiful, responsive web applications with our modern Next.js starter kit. Packed with features to accelerate your development workflow.",
  "Star on GitHub": "Star on GitHub",
  "Over 1,000+ stars on GitHub": "Over 1,000+ stars on GitHub",
  "AlphaX comes with everything you need to build modern web applications.": "AlphaX comes with everything you need to build modern web applications.",
  "Next.js 14": "Next.js 14",
  "Built on the latest version of Next.js with App Router support.": "Built on the latest version of Next.js with App Router support.",
  "TypeScript": "TypeScript",
  "Built with TypeScript for type safety and better developer experience.": "Built with TypeScript for type safety and better developer experience.",
  "Tailwind CSS": "Tailwind CSS",
  "Styled with Tailwind CSS for rapid UI development and customization.": "Styled with Tailwind CSS for rapid UI development and customization.",
  "Components": "Components",
  "Pre-built components using shadcn/ui for beautiful interfaces.": "Pre-built components using shadcn/ui for beautiful interfaces.",
  "Authentication": "Authentication",
  "Ready-to-use authentication with multiple providers.": "Ready-to-use authentication with multiple providers.",
  "Dark Mode": "Dark Mode",
  "Built-in dark mode support with easy toggling.": "Built-in dark mode support with easy toggling.",
  "Ready to contribute?": "Ready to contribute?",
  "Join thousands of developers building with AlphaX.": "Join thousands of developers building with AlphaX.",
  "Get Started": "Get Started",
  "© 2025 AlphaX. All rights reserved.": "© 2025 AlphaX. All rights reserved."
};
}


type NestedKeyOfHelper<T> = T extends object
  ? { [K in keyof T]: K extends string ? T[K] extends Record<string, any>
    ? K | `${K}.${NestedKeyOfHelper<T[K]>}`
    : K
    : never
  }[keyof T]
  : never;

export type NestedKeyOf<T extends object> = NestedKeyOfHelper<T>;

export type TranslationKey<T extends keyof TranslationsTypes> = NestedKeyOf<TranslationsTypes[T]>;
