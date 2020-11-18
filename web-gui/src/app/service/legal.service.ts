import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LegalService {
  constructor(private http: HttpClient) { }

  /**
   * Returns the impressum
   */
  getImpressum(): Observable<{ markdown: String }> {
    return this.http.get<{ markdown: String }>(`/api/v1/legal/impressum`);
  }

  /**
   * Returns the information of how user data is treated in the system
   */
  getPrivacyText(): Observable<{ markdown: String }> {
    return this.http.get<{ markdown: String }>(`/api/v1/legal/privacy-text`);
  }

  /**
   * Returns the information if a user accepted the terms of usage
   * @param uid the user id
   */
  getTermsOfUse(uid: number): Observable<{accepted: boolean}> {
    return this.http.get<{accepted: boolean}>(`/api/v1/legal/termsofuse/${uid}`);
  }

  /**
   * Accept the terms of usage
   * @param uid the user id
   * wouldn't work without argument in the body
   */
  acceptTermsOfUse(uid: number): Observable<void> {
    return this.http.put<void>(`/api/v1/legal/termsofuse/${uid}`, uid);
  }
}
