import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { User } from 'src/app/model/user';
import { DatabaseService } from 'src/app/services/database.service';
import { showToast } from 'src/app/tools/message-functions';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule]
})
export class UsuariosComponent implements OnInit {

  usuario: User = new User();
  users: User[] = [];

  constructor(private dbService: DatabaseService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.dbService.readUsers();
    } catch (error) {
      this.users = [];
      showToast('UsuariosComponent.loadUsers');
    }
  }

  async deleteUser(userName: string) {
    if (userName === 'admin') {
      alert('No se puede eliminar la cuenta admin.');
      return;
    }

    const confirmDelete = confirm(`¿Está seguro de eliminar el usuario ${userName}?`);
    if (confirmDelete) {
      try {
        const success = await this.dbService.deleteByUserName(userName);
        if (success) {
          await this.loadUsers();
        } else {
          alert('No se pudo eliminar el usuario.');
        }
      } catch (error) {
        showToast('UsuariosComponent.deleteUser');
      }
    }
  }
}
