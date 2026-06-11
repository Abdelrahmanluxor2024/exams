declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string[];
    authors?: Array<{ name: string }>;
  }
}

declare module "next/font/google" {
  export function Cairo(options: any): any;
}

declare module "*.css" {
  export {};
}
