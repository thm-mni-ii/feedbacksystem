import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs';
import {MongoPlaygroundService} from 'src/app/service/mongo-playground.service';
import {AuthService} from 'src/app/service/auth.service';

@Component({
  selector: 'app-db-scheme-collections',
  templateUrl: 'db-scheme-collections.component.html',
  styleUrls: ['../../db-scheme.component.scss'],
})
export class DbSchemeCollectionsComponent implements OnInit {
  @Input() reloadTrigger: Subject<void>;
  @Input() dbName: string;
  @Output() submitStatement = new EventEmitter<string>();

  collections: { name: string, count: number }[] = [];
  userId: number;

  constructor(private mongoService: MongoPlaygroundService, private auth: AuthService) {
  }

  ngOnInit(): void {
    this.loadData();

    this.reloadTrigger?.subscribe(() => {
      this.loadData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dbName'] && changes['dbName'].previousValue !== changes['dbName'].currentValue)
      this.loadData();
  }

  loadData(): void {
    this.dbName = localStorage.getItem('playground-mongo-db')!;
    this.userId = this.auth.getToken().id;

    const userId = this.auth.getToken().id;
    const prefix = `mongo_playground_student_${this.userId}_`;
    const dbSuffix = this.dbName.startsWith(prefix) ? this.dbName.split(prefix)[1] : this.dbName;

    setTimeout(() => {
      this.mongoService.getMongoCollections(userId, dbSuffix).subscribe((cols) => {
        this.collections = cols.map(col => ({ name: col, count: 0 }));

        cols.forEach((col, idx) => {
          this.mongoService.getCollectionCount(userId, dbSuffix, col).subscribe(count => {
            this.collections[idx].count = count;
          });
        });
      });
    }, 100);
  }
}
