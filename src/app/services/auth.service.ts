import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { showAlertError, showToast } from 'src/app/tools/message-functions';
import { User } from '../model/user';
import { Storage } from '@ionic/storage-angular';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storageAuthUserKey = 'AUTHENTICATED_USER';
  authUser = new BehaviorSubject<User | null>(null);
  isFirstLogin = new BehaviorSubject<boolean>(false);
  storageQrCodeKey = 'QR_CODE';
  qrCodeData = new BehaviorSubject<string | null>(null);

  constructor(private router: Router, private db: DatabaseService, private storage: Storage) { }

  async initializeAuthService() {
    try {
      await this.storage.create();
    } catch (error) {
      showAlertError('AuthService.initializeAuthService', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      return Boolean(await this.readAuthUser());
    } catch (error) {
      showAlertError('AuthService.isAuthenticated', error);
      return false;
    }
  }

  async readAuthUser(): Promise<User | null> {
    try {
      const user = (await this.storage.get(this.storageAuthUserKey)) as User | null;
      this.authUser.next(user ?? null);
      return user;
    } catch (error) {
      showAlertError('AuthService.readAuthUser', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authUser.value;
  }

  async getUserInfo(userName: string): Promise<User | undefined> {
    try {
      const user = await this.db.findUserByUserName(userName);
      return user ? user : undefined;
    } catch (error) {
      showAlertError('AuthService.getUserInfo', error);
      return undefined;
    }
  }

  async saveAuthUser(user: User): Promise<User | null> {
    try {
      await this.storage.set(this.storageAuthUserKey, user);
      this.authUser.next(user);
      return user;
    } catch (error) {
      showAlertError('AuthService.saveAuthUser', error);
      return null;
    }
  }

  async deleteAuthUser(): Promise<boolean> {
    try {
      await this.storage.remove(this.storageAuthUserKey);
      this.authUser.next(null);
      return true;
    } catch (error) {
      showAlertError('AuthService.deleteAuthUser', error);
      return false;
    }
  }

  async login(userName: string, password: string): Promise<boolean> {
    try {
      const authUser = await this.storage.get(this.storageAuthUserKey);
      if (!password.trim()) {
        showToast('Por favor ingresa una contraseña válida');
        return false;
      }

      if (authUser) {
        this.authUser.next(authUser);
        this.isFirstLogin.next(false);
        await this.router.navigate(['/home']);
        return true;
      } else {
        const user = await this.db.findUser(userName, password);
        if (user && user.password === password) {
          await this.saveAuthUser(user);
          this.isFirstLogin.next(true);
          await this.router.navigate(['/home']);
          return true;
        } else {
          showToast('El correo o la contraseña son incorrectos');
          return false;
        }
      }
    } catch (error) {
      showAlertError('AuthService.login', error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const user = await this.readAuthUser();

      if (user) {
        showToast(`¡Hasta pronto ${user.firstName} ${user.lastName}!`);
        await this.deleteAuthUser();
      }

      await this.router.navigate(['/login']);
      return true;
    } catch (error) {
      showAlertError('AuthService.logout', error);
      return false;
    }
  }
}
