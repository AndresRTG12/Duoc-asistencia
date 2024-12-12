import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { APIClientService } from 'src/app/services/apiclient.service';
import { ScannerService } from 'src/app/services/scanner.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EducationalLevel } from 'src/app/model/educational-level';
import { showToast } from 'src/app/tools/message-functions';
import { User } from 'src/app/model/user';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LanguageComponent } from 'src/app/components/language/language.component';

@Component({
  selector: 'app-registrarme',
  templateUrl: './registrarme.page.html',
  styleUrls: ['./registrarme.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslateModule, FormsModule, HeaderComponent, LanguageComponent]
})
export class RegistrarmePage {
  userName: string = '';
  email: string = '';
  password: string = '';
  secretQuestion: string = '';
  secretAnswer: string = '';
  firstName: string = '';
  lastName: string = '';
  educationalLevelId: number | null = null;
  dateOfBirth: string = ''; // Para el input de fecha
  address: string = '';
  educationalLevels = EducationalLevel.getLevels();

  constructor(
    private authService: AuthService,
    private db: DatabaseService,
    private api: APIClientService,
    private router: Router
  ) {}

  async headerClick(button: string) {
    // Lógica para manejar clics en el encabezado (si es necesario)
  }

  async registrarUsuario() {
    if (
      !this.userName.trim() ||
      !this.email.trim() ||
      !this.password.trim() ||
      !this.secretQuestion.trim() ||
      !this.secretAnswer.trim() ||
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.educationalLevelId ||
      !this.dateOfBirth.trim() ||
      !this.address.trim()
    ) {
      showToast('Por favor, completa todos los campos.');
      return;
    }

    const selectedLevel = EducationalLevel.findLevel(this.educationalLevelId);
    if (!selectedLevel) {
      showToast('Selecciona un nivel educativo válido.');
      return;
    }

    const newUser = User.getNewUsuario(
      this.userName,
      this.email,
      this.password,
      this.secretQuestion,
      this.secretAnswer,
      this.firstName,
      this.lastName,
      selectedLevel,
      new Date(this.dateOfBirth),
      this.address,
      true
    );

    try {
      await this.db.saveUser(newUser);
      showToast('Usuario registrado exitosamente.');
      this.limpiarFormulario();
    } catch (error) {
      console.error('Error registrando el usuario:', error);
      showToast('Error al registrar el usuario. Inténtalo nuevamente.');
    }
  }

  limpiarFormulario() {
    this.userName = '';
    this.email = '';
    this.password = '';
    this.secretQuestion = '';
    this.secretAnswer = '';
    this.firstName = '';
    this.lastName = '';
    this.educationalLevelId = null;
    this.dateOfBirth = '';
    this.address = '';
  }

  login() {
    this.router.navigate(['/login']);
  }
}
