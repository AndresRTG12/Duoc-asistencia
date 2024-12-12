import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LanguageComponent } from 'src/app/components/language/language.component';

@Component({
  selector: 'app-correo',
  templateUrl: './correo.page.html',
  styleUrls: ['./correo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    TranslateModule,
    LanguageComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CorreoPage {
  correo: string = '';

  constructor(private dbService: DatabaseService, private router: Router) {}

  async verificarCorreo() {
    try {
      console.log('Verificando correo:', this.correo);
      const user = await this.dbService.findUserByEmail(this.correo);
      if (user) {
        console.log('Usuario encontrado:', user);
        this.router.navigate(['/pregunta', this.correo]);
      } else {
        console.log('Usuario no encontrado');
        this.router.navigate(['/incorrecto']);
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      this.router.navigate(['/incorrecto']);
    }
  }

  volverAtras() {
    this.router.navigate(['/login']);
  }
}
