import { TemplateCategory } from "./TemplateCategory";

export type TemplateLanguage = "postgres" | "mongo";

export interface Template {
  id: number;
  name: string;
  language: TemplateLanguage;
  category: TemplateCategory;
  templateQuery: string;
}
