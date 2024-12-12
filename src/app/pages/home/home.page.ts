import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { IonContent } from '@ionic/angular/standalone'
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { QrWebScannerComponent } from 'src/app/components/qr-web-scanner/qr-web-scanner.component';
import { Capacitor } from '@capacitor/core';
import { ScannerService } from 'src/app/services/scanner.service';
import { WelcomeComponent } from 'src/app/components/welcome/welcome.component';
import { ForumComponent } from 'src/app/components/forum/forum.component';
import { MydataComponent } from 'src/app/components/mydata/mydata.component';
import { MyclassComponent } from 'src/app/components/myclass/myclass.component';
import { Asistencia } from 'src/app/model/asistencia';
import { UsuariosComponent } from 'src/app/components/usuarios/usuarios.component';
import { LanguageComponent } from 'src/app/components/language/language.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, IonContent,
    HeaderComponent, FooterComponent,
    WelcomeComponent, QrWebScannerComponent,
    ForumComponent, MydataComponent, MyclassComponent, UsuariosComponent,TranslateModule, LanguageComponent
  ]
})
export class HomePage implements OnInit {

  @ViewChild(FooterComponent) footer!: FooterComponent;
  selectedComponent = 'welcome';
  isAdmin: boolean = false;

  constructor(private auth: AuthService, private scanner: ScannerService) { }

  async ngOnInit() {
    await this.checkIfAdmin();
  }

  ionViewWillEnter() {
    this.changeComponent('welcome');
  }

  async checkIfAdmin() {
    const currentUser = await this.auth.getCurrentUser();
    if (currentUser) {
      const user = await this.auth.getUserInfo(currentUser.userName);
      if (user) {
        this.isAdmin = user.isAdmin;
      }
    }
  }

  async headerClick(button: string) {

    if (button === 'testqr')
      this.showAsistenciaComponent(Asistencia.jsonAsistenciaExample);

    if (button === 'scan' && Capacitor.getPlatform() === 'web')
      this.selectedComponent = 'qrwebscanner';

    if (button === 'scan' && Capacitor.getPlatform() !== 'web')
      this.showAsistenciaComponent(await this.scanner.scan());
  }

  webQrScanned(qr: string) {
    this.showAsistenciaComponent(qr);
  }

  webQrStopped() {
    this.changeComponent('welcome');
  }

  showAsistenciaComponent(qr: string) {

    if (Asistencia.isValidAsistenciaQrCode(qr)) {
      this.auth.qrCodeData.next(qr);
      this.changeComponent('myclass');
      return;
    }

    this.changeComponent('welcome');
  }

  footerClick(button: string) {
    this.selectedComponent = button;
  }

  changeComponent(name: string) {
    this.selectedComponent = name;
    this.footer.selectedButton = name;
  }

}
