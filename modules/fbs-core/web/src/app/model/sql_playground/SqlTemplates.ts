import { TemplateCategory } from "./TemplateCategory";

export interface SqlTemplates {
  id: number;
  name: string;
  category: TemplateCategory;
  templateQuery: string;
}
