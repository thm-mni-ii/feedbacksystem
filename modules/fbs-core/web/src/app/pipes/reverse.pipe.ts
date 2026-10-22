import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "reverse",
  standalone: false,
})
export class ReversePipe implements PipeTransform {
  transform(value) {
    return value.slice().reverse();
  }
}
