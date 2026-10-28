import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TaskProvider } from "../../model/TaskProvider";
import { TaskProviderService } from "../../service/task-provider.service";

export interface TaskProviderDialogData {
  isUpdate: boolean;
  taskProvider?: TaskProvider;
}

@Component({
  selector: "app-task-provider-dialog",
  templateUrl: "./task-provider-dialog.component.html",
  styleUrls: ["./task-provider-dialog.component.scss"],
})
export class TaskProviderDialogComponent implements OnInit {
  isUpdate = false;
  taskProvider?: TaskProvider;

  manifestUrlControl = new UntypedFormControl("");
  isLoadingManifest = false;

  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<TaskProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskProviderDialogData,
    private snackBar: MatSnackBar,
    private taskProviderService: TaskProviderService
  ) {}

  ngOnInit(): void {
    this.isUpdate = this.data?.isUpdate ?? false;
    this.taskProvider = this.data?.taskProvider;

    const mediaTypesStr = this.taskProvider?.supportedMediaTypes
      ? this.taskProvider.supportedMediaTypes.join(", ")
      : "";

    let schemaStr = "";
    if (this.taskProvider?.configSchema) {
      try {
        schemaStr =
          typeof this.taskProvider.configSchema === "string"
            ? this.taskProvider.configSchema
            : JSON.stringify(this.taskProvider.configSchema, null, 2);
      } catch {
        schemaStr = "";
      }
    }

    this.form = new UntypedFormGroup({
      id: new UntypedFormControl(
        { value: this.taskProvider?.id || "", disabled: this.isUpdate },
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]
      ),
      displayName: new UntypedFormControl(
        this.taskProvider?.displayName || "",
        [Validators.required]
      ),
      description: new UntypedFormControl(this.taskProvider?.description || ""),
      icon: new UntypedFormControl(this.taskProvider?.icon || "extension", [
        Validators.required,
      ]),
      version: new UntypedFormControl(this.taskProvider?.version || "1.0.0", [
        Validators.required,
      ]),
      evaluationEndpointUrl: new UntypedFormControl(
        this.taskProvider?.evaluationEndpointUrl || "",
        [Validators.required, this.urlValidator]
      ),
      healthEndpointUrl: new UntypedFormControl(
        this.taskProvider?.healthEndpointUrl || "",
        [Validators.required, this.urlValidator]
      ),
      configUiUrl: new UntypedFormControl(
        this.taskProvider?.configUiUrl || "",
        [this.optionalUrlValidator]
      ),
      solveUiUrl: new UntypedFormControl(this.taskProvider?.solveUiUrl || "", [
        this.optionalUrlValidator,
      ]),
      resultUiUrl: new UntypedFormControl(
        this.taskProvider?.resultUiUrl || "",
        [this.optionalUrlValidator]
      ),
      supportedMediaTypesText: new UntypedFormControl(mediaTypesStr),
      hasSubtasks: new UntypedFormControl(
        this.taskProvider?.hasSubtasks ?? false
      ),
      supportsStagedFeedback: new UntypedFormControl(
        this.taskProvider?.supportsStagedFeedback ?? false
      ),
      isActive: new UntypedFormControl(
        this.taskProvider
          ? this.taskProvider.isActive !== undefined
            ? Boolean(this.taskProvider.isActive)
            : this.taskProvider.active !== undefined
            ? Boolean(this.taskProvider.active)
            : true
          : true
      ),
      configSchemaText: new UntypedFormControl(schemaStr, [this.jsonValidator]),
    });
  }

  urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = String(control.value).trim();
    if (!/^https?:\/\/.+/i.test(value)) {
      return { invalidUrl: true };
    }
    return null;
  }

  optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !String(control.value).trim()) return null;
    const value = String(control.value).trim();
    if (!/^https?:\/\/.+/i.test(value)) {
      return { invalidUrl: true };
    }
    return null;
  }

  jsonValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !String(control.value).trim()) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch {
      return { invalidJson: true };
    }
  }

  formatJson(): void {
    const raw = this.form.get("configSchemaText")?.value;
    if (!raw || !raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      this.form
        .get("configSchemaText")
        ?.setValue(JSON.stringify(parsed, null, 2));
      this.snackBar.open("JSON formatiert", "OK", { duration: 2500 });
    } catch {
      this.snackBar.open("Ungültiges JSON kann nicht formatiert werden", "OK", {
        duration: 3500,
      });
    }
  }

  loadSampleSchema(): void {
    const sampleSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      required: ["solutionQuery"],
      properties: {
        solutionQuery: {
          type: "string",
          title: "Musterabfrage / Referenzlösung",
          description: "SQL-Abfrage zur Erzeugung der Soll-Ergebnistabelle",
        },
        ignoreColumnOrder: {
          type: "boolean",
          title: "Spaltenreihenfolge ignorieren",
          default: true,
        },
        timeoutSeconds: {
          type: "integer",
          title: "Timeout (Sekunden)",
          default: 15,
        },
      },
    };
    this.form
      .get("configSchemaText")
      ?.setValue(JSON.stringify(sampleSchema, null, 2));
    this.snackBar.open("Beispiel-Schema geladen", "OK", { duration: 2500 });
  }

  loadFromManifest(): void {
    const url = this.manifestUrlControl.value?.trim();
    if (!url) {
      this.snackBar.open("Bitte geben Sie eine Manifest-URL an.", "OK", {
        duration: 3000,
      });
      return;
    }

    this.isLoadingManifest = true;
    this.taskProviderService.parseManifest(url).subscribe({
      next: (manifest) => {
        this.isLoadingManifest = false;
        if (!this.isUpdate && manifest.id) {
          this.form.get("id")?.setValue(manifest.id);
        }
        if (manifest.displayName) {
          this.form.get("displayName")?.setValue(manifest.displayName);
        }
        if (manifest.description !== undefined) {
          this.form.get("description")?.setValue(manifest.description || "");
        }
        if (manifest.icon) {
          this.form.get("icon")?.setValue(manifest.icon);
        }
        if (manifest.version) {
          this.form.get("version")?.setValue(manifest.version);
        }
        if (manifest.evaluationEndpointUrl) {
          this.form
            .get("evaluationEndpointUrl")
            ?.setValue(manifest.evaluationEndpointUrl);
        }
        if (manifest.healthEndpointUrl) {
          this.form
            .get("healthEndpointUrl")
            ?.setValue(manifest.healthEndpointUrl);
        }
        if (manifest.configUiUrl !== undefined) {
          this.form.get("configUiUrl")?.setValue(manifest.configUiUrl || "");
        }
        if (manifest.solveUiUrl !== undefined) {
          this.form.get("solveUiUrl")?.setValue(manifest.solveUiUrl || "");
        }
        if (manifest.resultUiUrl !== undefined) {
          this.form.get("resultUiUrl")?.setValue(manifest.resultUiUrl || "");
        }
        if (manifest.supportedMediaTypes) {
          this.form
            .get("supportedMediaTypesText")
            ?.setValue(manifest.supportedMediaTypes.join(", "));
        }
        if (manifest.hasSubtasks !== undefined) {
          this.form.get("hasSubtasks")?.setValue(Boolean(manifest.hasSubtasks));
        }
        if (manifest.supportsStagedFeedback !== undefined) {
          this.form
            .get("supportsStagedFeedback")
            ?.setValue(Boolean(manifest.supportsStagedFeedback));
        }
        if (manifest.configSchema) {
          try {
            const schemaStr =
              typeof manifest.configSchema === "string"
                ? manifest.configSchema
                : JSON.stringify(manifest.configSchema, null, 2);
            this.form.get("configSchemaText")?.setValue(schemaStr);
          } catch {
            // ignore
          }
        }
        this.snackBar.open(
          "Manifest erfolgreich geladen und übernommen.",
          "OK",
          {
            duration: 3500,
          }
        );
      },
      error: (err) => {
        this.isLoadingManifest = false;
        console.error("Failed to parse manifest", err);
        const msg =
          err?.error?.message ||
          err?.message ||
          "Fehler beim Laden des Manifests";
        this.snackBar.open(
          `Manifest konnte nicht geladen werden: ${msg}`,
          "OK",
          {
            duration: 5000,
          }
        );
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        "Bitte korrigieren Sie die fehlerhaften Felder.",
        "OK",
        { duration: 4000 }
      );
      return;
    }

    const rawValue = this.form.getRawValue();
    const mediaTypes = rawValue.supportedMediaTypesText
      ? rawValue.supportedMediaTypesText
          .split(/[\n,]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    let parsedSchema: any = null;
    if (rawValue.configSchemaText && rawValue.configSchemaText.trim()) {
      try {
        parsedSchema = JSON.parse(rawValue.configSchemaText.trim());
      } catch {
        parsedSchema = null;
      }
    }

    const result = {
      id: rawValue.id?.trim(),
      displayName: rawValue.displayName?.trim(),
      description: rawValue.description?.trim() || null,
      icon: rawValue.icon?.trim() || "extension",
      version: rawValue.version?.trim() || "1.0.0",
      evaluationEndpointUrl: rawValue.evaluationEndpointUrl?.trim(),
      healthEndpointUrl: rawValue.healthEndpointUrl?.trim(),
      configUiUrl: rawValue.configUiUrl?.trim() || null,
      solveUiUrl: rawValue.solveUiUrl?.trim() || null,
      resultUiUrl: rawValue.resultUiUrl?.trim() || null,
      supportedMediaTypes: mediaTypes,
      hasSubtasks: Boolean(rawValue.hasSubtasks),
      supportsStagedFeedback: Boolean(rawValue.supportsStagedFeedback),
      isActive: Boolean(rawValue.isActive),
      configSchema: parsedSchema,
    };

    this.dialogRef.close(result);
  }
}
