import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'isTeacher',
  pure: false
})
export class UserTeacherFilter implements PipeTransform {
  transform(items: any[]): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item.courseRole === 'DOCENT' || item.courseRole === 'TUTOR');
  }
}
