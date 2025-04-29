import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Output() submitStatement = new EventEmitter<string>();

  collections: { name: string, count: number }[] = [];
  dbId: string;
  userId: number;

  constructor(private mongoService: MongoPlaygroundService, private auth: AuthService) {
  }

  ngOnInit(): void {
    this.loadData();

    this.reloadTrigger?.subscribe(() => {
      this.loadData();
    });
  }

  loadData(): void {
    this.dbId = localStorage.getItem('playground-mongo-db')!;
    this.userId = this.auth.getToken().id;

    const prefix = `mongo_playground_student_${this.userId}_`;
    const dbSuffix = this.dbId.startsWith(prefix) ? this.dbId.split(prefix)[1] : this.dbId;

    this.mongoService.getMongoCollections(this.userId, dbSuffix).subscribe((cols) => {
      this.collections = cols.map(col => ({ name: col, count: 0 }));

      cols.forEach((col, idx) => {
        this.mongoService.getCollectionCount(this.userId, dbSuffix, col).subscribe(count => {
          this.collections[idx].count = count;
        });
      });
    });
  }
}
