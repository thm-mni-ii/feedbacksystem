import {Injectable} from '@angular/core';

/**
 * Add new task types here
 */
@Injectable({
  providedIn: 'root'
})
export class TypesService {

  readonly types: string[] = ['FILE', 'JAVA', 'SQL'];

  constructor() {
  }


  getTypes(): string[] {
    return this.types;
  }
}
