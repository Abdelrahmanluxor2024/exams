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
  export function Roboto(options: any): any;
  export function Open_Sans(options: any): any;
}

