import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { LanguageComponent } from 'src/app/components/language/language.component';

@Component({
  selector: 'app-pregunta',
  templateUrl: './pregunta.page.html',
  styleUrls: ['./pregunta.page.scss'],
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
export class PreguntaPage implements OnInit {
  correo: string = '';
  question: string = '';
  answer: string = '';

  constructor(
    private route: ActivatedRoute,
    private dbService: DatabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.correo = this.route.snapshot.paramMap.get('correo') || '';
    const user = await this.dbService.findUserByEmail(this.correo);
    if (user) {
      this.question = user.secretQuestion;
    } else {
      this.router.navigate(['/incorrecto']);
    }
  }

  async verificarRespuesta() {
    const user = await this.dbService.findUserByEmail(this.correo);
    if (user && user.secretAnswer.toLowerCase() === this.answer.toLowerCase()) {
      this.router.navigate(['/correcto']);
    } else {
      this.router.navigate(['/incorrecto']);
    }
  }
}
