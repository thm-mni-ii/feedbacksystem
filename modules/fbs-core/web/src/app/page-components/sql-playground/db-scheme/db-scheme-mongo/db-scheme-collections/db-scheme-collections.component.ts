import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Subject } from "rxjs";
import { MongoPlaygroundService } from "src/app/service/mongo-playground.service";
import { PlaygroundContextService } from "src/app/service/playground-context.service";

@Component({
  selector: "app-db-scheme-collections",
  templateUrl: "db-scheme-collections.component.html",
  styleUrls: ["../../db-scheme.component.scss"],
})
export class DbSchemeCollectionsComponent implements OnInit, OnChanges {
  @Input() reloadTrigger: Subject<void>;
  @Input() dbName: string;
  @Output() submitStatement = new EventEmitter<string>();

  collections: { name: string; count: number }[] = [];
  userId: number;

  constructor(
    private mongoService: MongoPlaygroundService,
    private playgroundContext: PlaygroundContextService
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.reloadTrigger?.subscribe(() => {
      this.loadData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["dbName"] &&
      changes["dbName"].previousValue !== changes["dbName"].currentValue
    )
      this.loadData();
  }

  loadData(): void {
    this.dbName = this.dbName || localStorage.getItem("playground-mongo-db")!;
    if (!this.dbName) {
      this.collections = [];
      return;
    }

    this.userId = this.playgroundContext.userId;

    const userId = this.playgroundContext.userId;
    const prefix = `mongo_playground_student_${this.userId}_`;
    const dbSuffix = this.dbName.startsWith(prefix)
      ? this.dbName.split(prefix)[1]
      : this.dbName;

    setTimeout(() => {
      this.mongoService
        .getMongoCollections(userId, dbSuffix, this.playgroundContext.courseId)
        .subscribe((cols) => {
          this.collections = cols.map((col) => ({ name: col, count: 0 }));

          cols.forEach((col, idx) => {
            this.mongoService
              .getCollectionCount(
                userId,
                dbSuffix,
                col,
                this.playgroundContext.courseId
              )
              .subscribe((count) => {
                this.collections[idx].count = count;
              });
          });
        });
    }, 100);
  }
}
