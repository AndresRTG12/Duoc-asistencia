import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, pawOutline, pencilOutline, qrCodeOutline, peopleOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule,
    IonFooter, IonToolbar, IonSegment, IonSegmentButton, IonIcon
  ]
})
export class FooterComponent implements OnInit {
  selectedButton = 'welcome';
  @Output() footerClick = new EventEmitter<string>();
  isAdmin: boolean = false;
  isAtorres: boolean = false;

  constructor(private authService: AuthService) {
    addIcons({ homeOutline, pawOutline, pencilOutline, peopleOutline, qrCodeOutline });
  }

  async ngOnInit() {
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser && currentUser.userName === 'atorres') {
      this.isAtorres = true;
    }
  }

  async checkIfAdmin() {
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser && currentUser.userName) {
      this.isAdmin = currentUser.userName === 'admin';
    } else {
      this.isAdmin = false;
    }
  }

  sendClickEvent($event: any) {
    this.footerClick.emit(this.selectedButton);
  }
}
