import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import { Subject } from 'rxjs';
import { MongoPlaygroundService } from 'src/app/service/mongo-playground.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-db-scheme-mongo-indexes',
  templateUrl: './db-scheme-indexes.component.html',
  styleUrls: ['../../db-scheme.component.scss'],
})
export class DbSchemeMongoIndexesComponent implements OnInit {
  @Input() reloadTrigger: Subject<void>;
  @Input() dbName: string;

  indexes: any[] = [];
  userId: number;

  constructor(private mongoService: MongoPlaygroundService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadData();

    this.reloadTrigger?.subscribe(() => {
      this.loadData();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dbName'] && changes['dbName'].currentValue)
      this.loadData();
  }

  loadData(): void {
    this.userId = this.auth.getToken().id;

    const prefix = `mongo_playground_student_${this.userId}_`;
    const dbSuffix = this.dbName.startsWith(prefix) ? this.dbName.split(prefix)[1] : this.dbName;

    this.mongoService.getMongoIndexes(this.userId, dbSuffix).subscribe((res) => {
      this.indexes = res;
    });
  }
}
