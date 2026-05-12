import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

export interface PlaygroundContext {
  userId: number;
  readOnly: boolean;
  courseId: number | null;
  ownerName: string | null;
}

@Injectable({
  providedIn: "root",
})
export class PlaygroundContextService {
  private context: PlaygroundContext | null = null;

  constructor(private authService: AuthService) {}

  setContext(context: Partial<PlaygroundContext>) {
    this.context = {
      userId: this.authService.getToken().id,
      readOnly: false,
      courseId: null,
      ownerName: null,
      ...context,
    };
  }

  reset() {
    this.context = null;
  }

  get userId(): number {
    return this.context?.userId ?? this.authService.getToken().id;
  }

  get courseId(): number | null {
    return this.context?.courseId ?? null;
  }

  get ownerName(): string | null {
    return this.context?.ownerName ?? null;
  }

  isReadOnly(): boolean {
    return this.context?.readOnly ?? false;
  }
}
