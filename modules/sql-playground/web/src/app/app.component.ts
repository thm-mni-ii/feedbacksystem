import { Component } from '@angular/core';
import { AuthService } from './service/auth.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // inject AuthService at startup so the theme and the token bridge are set up early
  constructor(private authService: AuthService) {}
}
