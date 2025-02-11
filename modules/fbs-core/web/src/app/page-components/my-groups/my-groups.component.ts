import { Component, Inject, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { TitlebarService } from "../../service/titlebar.service";
import { Group } from "../../model/Group";
import { AuthService } from "../../service/auth.service";
import { GroupRegistrationService } from "../../service/group-registration.sevice";
import {
  I18NEXT_SERVICE,
  I18NextPipe,
  ITranslationService,
} from "angular-i18next";

@Component({
  selector: "app-my-groups",
  templateUrl: "./my-groups.component.html",
  styleUrls: ["./my-groups.component.scss"],
})
export class MyGroupsComponent implements OnInit {
  @Input() data: Group;
  userID: number;
  groups: Observable<Group[]> = of([]);

  constructor(
    private titlebar: TitlebarService,
    private groupRegistrationService: GroupRegistrationService,
    private authService: AuthService,
    private i18NextPipe: I18NextPipe,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {}

  ngOnInit(): void {
    this.i18NextService.events.languageChanged.subscribe(() => {
      this.titlebar.emitTitle(
        this.i18NextPipe.transform("sidebar.label.myGroups")
      );
    });
    this.userID = this.authService.getToken().id;
    this.groups = this.groupRegistrationService.getRegisteredGroups(
      this.userID
    );
  }
}
