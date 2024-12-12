import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosComponent } from './usuarios.component';
import { DatabaseService } from 'src/app/services/database.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/model/user';
import { EducationalLevel } from 'src/app/model/educational-level';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let fixture: ComponentFixture<UsuariosComponent>;
  let databaseService: jasmine.SpyObj<DatabaseService>;

  const mockEducationalLevel: EducationalLevel = {
    id: 1,
    name: 'Level1',
    setLevel: (id: number, name: string) => { /* Mock implementation */ },
    getEducation: () => 'Education1'
  };

  const mockUsers: User[] = [
    { userName: 'user1', email: 'user1@example.com', password: 'password1', secretQuestion: 'question1', secretAnswer: 'answer1', firstName: 'FirstName1', lastName: 'LastName1', educationalLevel: mockEducationalLevel, dateOfBirth: new Date('2000-01-01'), address: 'Address1', isAdmin: false },
    { userName: 'admin', email: 'admin@example.com', password: 'adminpass', secretQuestion: 'adminquestion', secretAnswer: 'adminanswer', firstName: 'AdminFirst', lastName: 'AdminLast', educationalLevel: mockEducationalLevel, dateOfBirth: new Date('2000-01-01'), address: 'AdminAddress', isAdmin: true },
  ];

  beforeEach(async () => {
    const databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['readUsers', 'deleteByUserName']);
    databaseServiceSpy.readUsers.and.returnValue(Promise.resolve(mockUsers));
    databaseServiceSpy.deleteByUserName.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forRoot(),
        IonicModule.forRoot(),
        UsuariosComponent
      ],
      providers: [
        { provide: DatabaseService, useValue: databaseServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', async () => {
    await component.ngOnInit();
    expect(component.users.length).toBe(2);
    expect(component.users).toEqual(mockUsers);
  });

  it('should call deleteByUserName with the correct userName', async () => {
    spyOn(window, 'confirm').and.returnValue(true); // Simula la confirmación de eliminación
    await component.loadUsers();
    await component.deleteUser('user1');
    expect(databaseService.deleteByUserName).toHaveBeenCalledWith('user1');
  });

  it('should not delete the admin user', async () => {
    spyOn(window, 'confirm').and.returnValue(true); // Simula la confirmación de eliminación
    await component.loadUsers();
    await component.deleteUser('admin');
    expect(databaseService.deleteByUserName).not.toHaveBeenCalledWith('admin');
    expect(component.users.length).toBe(2); // El número de usuarios no debe cambiar
  });

  // Nueva prueba: Verificar el manejo de errores al cargar usuarios
  it('should handle error when loading users fails', async () => {
    // Simula un error al cargar los usuarios
    databaseService.readUsers.and.returnValue(Promise.reject('Error loading users'));
    await component.ngOnInit(); // Inicializa el componente
    expect(component.users.length).toBe(0); // Verifica que la lista de usuarios esté vacía
    expect(component.users).toEqual([]); // Verifica que la lista de usuarios esté vacía
  });
});
