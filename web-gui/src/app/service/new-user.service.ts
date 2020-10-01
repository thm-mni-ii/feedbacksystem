import { Injectable } from '@angular/core';
import {USERS} from '../mock-data/mock-users';
import {User} from '../model/User';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NewUserService {

  constructor() { }

  // GET /users
  getAllUsers(): Observable<User[]>{
    return of(USERS)
  }

  // POST /users
  createUser(){

  }

  // GET /users/{uid}
  getUser(uid: number): Observable<User>{
    return of(USERS.pop())
  }

  // DELETE /users/{uid}
  deleteUser(uid: number){ // TODO: bei response code: Observable<number> ??

  }

  // PUT /users/{uid}/passwd
  changePassword(uid: number, passwd: String, passwdRepeat: String){

  }

  //PUT /users/{uid}/global-role
  changeRole(uid: number, roleId: number){

  }
}
