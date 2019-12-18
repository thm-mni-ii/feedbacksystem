import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor() { }

  public isJSON(data: string){
    if (data == null || typeof data === 'undefined') return false;
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * https://stackoverflow.com/a/8273091/5885054 - like python range()
   * @param start
   * @param stop
   * @param step
   */
  public range(start, stop?, step?) {
    if (typeof stop == 'undefined') {
      // one param defined
      stop = start;
      start = 0;
    }

    if (typeof step == 'undefined') {
      step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
    }

    return result;
  };
}
