import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../../../../service/auth.service";
import { JWTToken } from "../../../../model/JWTToken";
import { GroupRegistrationService } from "../../../../service/group-registration.sevice";
import {
  loadGroups,
  loadGroupsFailure,
  loadGroupsSuccess,
} from "./groups.actions";

@Injectable()
export class GroupsEffects {
  private token: JWTToken;
  constructor(
    private actions$: Actions,
    private groupRegistrationService: GroupRegistrationService,
    authService: AuthService
  ) {
    this.token = authService.isAuthenticated() ? authService.getToken() : null;
  }

  loadGroups = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroups),
      switchMap(() =>
        this.groupRegistrationService.getRegisteredGroups(this.token.id).pipe(
          switchMap((groups) => {
            return of(loadGroupsSuccess({ groups }));
          }),
          catchError((error) => of(loadGroupsFailure({ error })))
        )
      )
    )
  );
}
