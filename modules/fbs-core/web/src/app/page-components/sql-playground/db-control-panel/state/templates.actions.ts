import { createAction, props } from "@ngrx/store";
import { SqlTemplates } from "../../../../model/sql_playground/SqlTemplates";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";

export const addTemplates = createAction(
  "[Templates] Add Templates",
  props<{ templates: SqlTemplates[] }>()
);
export const addCategories = createAction(
  "[Templates] Add Categories",
  props<{ categories: TemplateCategory[] }>()
);
