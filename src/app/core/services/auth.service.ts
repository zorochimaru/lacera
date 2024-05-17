import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, map, Observable, Subject } from 'rxjs';

@Injectable()
export class AuthService {
  readonly #afAuth = inject(AngularFireAuth);

  #currentUserSubject = new Subject<firebase.default.User | null>();
  public currentUser$ = this.#currentUserSubject.asObservable();

  public isAuthenticated$ = this.currentUser$.pipe(map(Boolean));

  constructor() {
    this.#afAuth.authState.subscribe(user => {
      this.#currentUserSubject.next(user);
    });
  }

  public signUp(email: string, password: string): Observable<void> {
    return from(
      this.#afAuth.createUserWithEmailAndPassword(email, password)
    ).pipe(map(() => void 0));
  }

  public signIn(email: string, password: string): Observable<void> {
    return from(this.#afAuth.signInWithEmailAndPassword(email, password)).pipe(
      map(() => void 0)
    );
  }

  public signOut(): Observable<void> {
    return from(this.#afAuth.signOut());
  }
}
