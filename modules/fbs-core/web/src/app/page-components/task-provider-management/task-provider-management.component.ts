import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { TitlebarService } from "../../service/titlebar.service";
import { TaskProviderService } from "../../service/task-provider.service";
import { TaskProvider } from "../../model/TaskProvider";
import { TaskProviderDialogComponent } from "../../dialogs/task-provider-dialog/task-provider-dialog.component";
import { TaskProviderDetailDialogComponent } from "../../dialogs/task-provider-detail-dialog/task-provider-detail-dialog.component";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {
  I18NEXT_SERVICE,
  I18NextPipe,
  ITranslationService,
} from "angular-i18next";

@Component({
  selector: "app-task-provider-management",
  templateUrl: "./task-provider-management.component.html",
  styleUrls: ["./task-provider-management.component.scss"],
})
export class TaskProviderManagementComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  columns = [
    "icon",
    "id",
    "displayName",
    "endpoints",
    "uiContracts",
    "mediaTypes",
    "isActive",
    "actions",
  ];
  dataSource = new MatTableDataSource<TaskProvider>();
  loading = false;

  constructor(
    private taskProviderService: TaskProviderService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private titlebar: TitlebarService,
    private i18NextPipe: I18NextPipe,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  ngOnInit(): void {
    this.i18NextService.events.languageChanged.subscribe(() => {
      this.titlebar.emitTitle(
        this.i18NextPipe.transform("task-provider.management.title")
      );
    });
    this.titlebar.emitTitle(
      this.i18NextPipe.transform("task-provider.management.title")
    );
    this.refreshProviderList();
  }

  refreshProviderList(): void {
    this.loading = true;
    this.taskProviderService.getAllTaskProvidersAdmin().subscribe(
      (providers) => {
        this.dataSource.data = providers;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = (
          data: TaskProvider,
          filter: string
        ) => {
          const matchStr = `${data.id} ${data.displayName} ${
            data.description || ""
          } ${data.supportedMediaTypes.join(" ")}`.toLowerCase();
          return matchStr.includes(filter);
        };
        this.loading = false;
      },
      (error) => {
        console.error("Failed to load task providers", error);
        this.snackBar.open(
          this.i18NextPipe.transform("task-provider.error.load-failed"),
          "OK",
          { duration: 5000 }
        );
        this.loading = false;
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isProviderActive(provider: TaskProvider): boolean {
    if (provider.isActive !== undefined && provider.isActive !== null) {
      return Boolean(provider.isActive);
    }
    if (provider.active !== undefined && provider.active !== null) {
      return Boolean(provider.active);
    }
    return true;
  }

  openCreateDialog(): void {
    this.dialog
      .open(TaskProviderDialogComponent, {
        width: "750px",
        data: { isUpdate: false },
      })
      .afterClosed()
      .subscribe((createReq) => {
        if (createReq) {
          this.taskProviderService.createTaskProvider(createReq).subscribe(
            () => {
              this.snackBar.open(
                this.i18NextPipe.transform("task-provider.success.created"),
                "OK",
                { duration: 4000 }
              );
              this.refreshProviderList();
            },
            (err) => {
              console.error(err);
              this.snackBar.open(
                err?.error?.message ||
                  this.i18NextPipe.transform(
                    "task-provider.error.create-failed"
                  ),
                "OK",
                { duration: 5000 }
              );
            }
          );
        }
      });
  }

  openEditDialog(provider: TaskProvider): void {
    this.dialog
      .open(TaskProviderDialogComponent, {
        width: "750px",
        data: { isUpdate: true, taskProvider: provider },
      })
      .afterClosed()
      .subscribe((updateReq) => {
        if (updateReq) {
          this.taskProviderService
            .updateTaskProvider(provider.id, updateReq)
            .subscribe(
              () => {
                this.snackBar.open(
                  this.i18NextPipe.transform("task-provider.success.updated"),
                  "OK",
                  { duration: 4000 }
                );
                this.refreshProviderList();
              },
              (err) => {
                console.error(err);
                this.snackBar.open(
                  err?.error?.message ||
                    this.i18NextPipe.transform(
                      "task-provider.error.update-failed"
                    ),
                  "OK",
                  { duration: 5000 }
                );
              }
            );
        }
      });
  }

  openDetailDialog(provider: TaskProvider): void {
    this.dialog.open(TaskProviderDetailDialogComponent, {
      width: "700px",
      data: { taskProvider: provider },
    });
  }

  deleteProvider(provider: TaskProvider): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: this.i18NextPipe.transform(
            "task-provider.dialog.delete-title"
          ),
          message: `${this.i18NextPipe.transform(
            "task-provider.dialog.delete-message"
          )} "${provider.displayName}" (${provider.id})?`,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.taskProviderService.deleteTaskProvider(provider.id).subscribe(
            () => {
              this.snackBar.open(
                this.i18NextPipe.transform("task-provider.success.deleted"),
                "OK",
                { duration: 4000 }
              );
              this.refreshProviderList();
            },
            (err) => {
              console.error(err);
              this.snackBar.open(
                this.i18NextPipe.transform("task-provider.error.delete-failed"),
                "OK",
                { duration: 5000 }
              );
            }
          );
        }
      });
  }
}
