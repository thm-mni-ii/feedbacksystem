import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../../../../service/auth.service";
import { GroupRegistrationService } from "../../../../service/group-registration.sevice";
import {
  loadGroups,
  loadGroupsFailure,
  loadGroupsSuccess,
} from "./groups.actions";

@Injectable()
export class GroupsEffects {
  constructor(
    private actions$: Actions,
    private groupRegistrationService: GroupRegistrationService,
    private authService: AuthService
  ) {}

  loadGroups = createEffect(() =>
    this.actions$.pipe(
      ofType(loadGroups),
      switchMap(() => {
        const token = this.authService.getToken();
        if (!token || !token.id) {
          return of(loadGroupsFailure({ error: "No token available" }));
        }
        return this.groupRegistrationService
          .getRegisteredGroups(token.id)
          .pipe(
            switchMap((groups) => {
              return of(loadGroupsSuccess({ groups }));
            }),
            catchError((error) => of(loadGroupsFailure({ error })))
          );
      })
    )
  );
}
