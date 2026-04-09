import { createAction, props } from "@ngrx/store";
import {
  Template,
  TemplateLanguage,
} from "../../../../model/sql_playground/Template";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";

export const addTemplates = createAction(
  "[Templates] Add Templates",
  props<{ templates: Template[] }>()
);
export const addCategories = createAction(
  "[Templates] Add Categories",
  props<{ categories: TemplateCategory[] }>()
);
export const setFilterLanguage = createAction(
  "[Templates] SetFilter Language",
  props<{ filterLanguage: TemplateLanguage }>()
);
