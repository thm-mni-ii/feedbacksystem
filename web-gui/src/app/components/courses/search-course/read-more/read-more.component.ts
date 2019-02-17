import {Component, Input, OnChanges} from '@angular/core';

/**
 * Show read more when to much text is given
 */
@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss']
})
export class ReadMoreComponent implements OnChanges {

  @Input() text: string;
  @Input() maxLength = 100;
  currentText: string;
  hideToggle = true;

  public isCollapsed = true;

  constructor() {

  }

  /**
   * Toggles the text
   */
  toggleView() {
    this.isCollapsed = !this.isCollapsed;
    this.determineView();
  }

  /**
   * Show only text for given length and '...' at the end
   * or show full text
   */
  determineView() {
    if (!this.text || this.text.length <= this.maxLength) {
      this.currentText = this.text;
      this.isCollapsed = false;
      this.hideToggle = true;
      return;
    }
    this.hideToggle = false;
    if (this.isCollapsed === true) {
      this.currentText = this.text.substring(0, this.maxLength) + '...';
    } else if (this.isCollapsed === false) {
      this.currentText = this.text;
    }

  }

  ngOnChanges() {
    this.determineView();
  }

}
