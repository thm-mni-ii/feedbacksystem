import { createAction, props } from "@ngrx/store";
import { SqlTemplates } from "../../../../model/sql_playground/SqlTemplates";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";

export const loadTemplates = createAction("[Templates] Load Templates");
export const loadTemplatesSuccess = createAction(
  "[Templates] Load Templates Success",
  props<{ templates: SqlTemplates[] }>()
);
export const loadTemplatesFailure = createAction(
  "[Templates] Load Templates Failure",
  props<{ error: any }>()
);

export const loadCategories = createAction("[Categories] Load Categories");
export const loadCategoriesSuccess = createAction(
  "[Categories] Load Categories Success",
  props<{ categories: TemplateCategory[] }>()
);
export const loadCategoriesFailure = createAction(
  "[Categories] Load Categories Failure",
  props<{ error: any }>()
);
