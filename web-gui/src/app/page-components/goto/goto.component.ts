import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Route, Router} from '@angular/router';
import {GoToService} from '../../service/goto.service';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './goto.component.html',
  styleUrls: ['./goto.component.scss']
})
export class GoToComponent implements OnInit {
  constructor(private route: ActivatedRoute, private goToService: GoToService, private authService: AuthService) {}

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    const courseID = Number.parseInt(params.get('id'), 10);
    const target = params.get('target');
    let app = false;
    if (target === 'app') {
      app = true;
    }
    this.goToService.setGoTo(courseID, app);

    if (this.authService.isAuthenticated()) {
      this.goToService.goTo();
    } else {
      window.location.href = `https://cas.thm.de/cas/login?service=${window.location.origin}/api/v1/login/cas`;
    }
  }
}
