import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { User } from '../model/user';
import { BehaviorSubject } from 'rxjs';
import { EducationalLevel } from '../model/educational-level';
import { showAlertError } from '../tools/message-functions';
import { convertDateToString, convertStringToDate } from '../tools/date-functions';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  testUser1 = User.getNewUsuario(
    'atorres',
    'atorres@duocuc.cl',
    '1234',
    '¿Cuál es tu animal favorito?',
    'gato',
    'Ana',
    'Torres',
    EducationalLevel.findLevel(6)!,
    new Date(2000, 0, 5),
    'La Florida',
    true // isAdmin
  );

  testUser2 = User.getNewUsuario(
    'jperez',
    'jperez@duocuc.cl',
    '5678',
    '¿Cuál es tu postre favorito?',
    'panqueques',
    'Juan',
    'Pérez',
    EducationalLevel.findLevel(5)!,
    new Date(2000, 1, 10),
    'La Pintana',
    false // isAdmin
  );

  testUser3 = User.getNewUsuario(
    'cmujica',
    'cmujica@duocuc.cl',
    '0987',
    '¿Cuál es tu vehículo favorito?',
    'moto',
    'Carla',
    'Mujica',
    EducationalLevel.findLevel(6)!,
    new Date(2000, 2, 20),
    'Providencia',
    false // isAdmin
  );

  userUpgrades = [
    {
      toVersion: 1,
      statements: [`
        CREATE TABLE IF NOT EXISTS USER (
          userName         TEXT PRIMARY KEY NOT NULL,
          email            TEXT NOT NULL,
          password         TEXT NOT NULL,
          secretQuestion   TEXT NOT NULL,
          secretAnswer     TEXT NOT NULL,
          firstName        TEXT NOT NULL,
          lastName         TEXT NOT NULL,
          educationalLevel INTEGER NOT NULL,
          dateOfBirth      TEXT NOT NULL,
          address          TEXT NOT NULL,
          isAdmin          INTEGER NOT NULL DEFAULT 0
        );
      `]
    },
    {
      toVersion: 2,
      statements: [`
        ALTER TABLE USER ADD COLUMN isAdmin INTEGER NOT NULL DEFAULT 0;
      `]
    }
  ];

  sqlInsertUpdate = `
    INSERT OR REPLACE INTO USER (
      userName,
      email,
      password,
      secretQuestion,
      secretAnswer,
      firstName,
      lastName,
      educationalLevel,
      dateOfBirth,
      address,
      isAdmin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  dataBaseName = 'DinosaurDataBase';
  db!: SQLiteDBConnection;
  userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(private sqliteService: SQLiteService) { }

  async initializeDataBase() {
    try {
      console.log('Inicializando la base de datos...');
      await this.sqliteService.createDataBase({ database: this.dataBaseName, upgrade: [] });
      this.db = await this.sqliteService.open(this.dataBaseName, false, 'no-encryption', 1, false);
      console.log('Base de datos abierta:', this.db);

      // Crear la tabla USER si no existe
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS USER (
          userName         TEXT PRIMARY KEY NOT NULL,
          email            TEXT NOT NULL,
          password         TEXT NOT NULL,
          secretQuestion   TEXT NOT NULL,
          secretAnswer     TEXT NOT NULL,
          firstName        TEXT NOT NULL,
          lastName         TEXT NOT NULL,
          educationalLevel INTEGER NOT NULL,
          dateOfBirth      TEXT NOT NULL,
          address          TEXT NOT NULL,
          isAdmin          INTEGER NOT NULL DEFAULT 0
        );
      `;
      await this.db.execute(createTableQuery);
      console.log('Tabla USER creada o existente.');

      // Validar si la columna 'isAdmin' ya existe
      const checkColumnQuery = `PRAGMA table_info(USER);`;
      const tableInfo = await this.db.query(checkColumnQuery);
      console.log('Información de la tabla:', tableInfo);

      if (tableInfo.values) {
        const columnExists = tableInfo.values.some((row: any) => row.name === 'isAdmin');
        console.log('Columna isAdmin existe:', columnExists);

        if (!columnExists) {
          // Ejecutar la actualización a la versión 2 si la columna no existe
          const upgrade2 = this.userUpgrades.find(up => up.toVersion === 2);
          if (upgrade2) {
            await this.sqliteService.createDataBase({ database: this.dataBaseName, upgrade: [upgrade2] });
            console.log('Actualización a la versión 2 ejecutada.');
          }
        }
      } else {
        throw new Error('Failed to retrieve table information.');
      }

      await this.createTestUsers();
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.initializeDataBase', error);
    }
  }

  async createTestUsers() {
    try {
      // Verifica y guarda al usuario 'atorres' si no existe
      const user1 = await this.readUser(this.testUser1.userName);
      if (!user1) {
        await this.saveUser(this.testUser1);
      }

      // Verifica y guarda al usuario 'jperez' si no existe
      const user2 = await this.readUser(this.testUser2.userName);
      if (!user2) {
        await this.saveUser(this.testUser2);
      }

      // Verifica y guarda al usuario 'cmujica' si no existe
      const user3 = await this.readUser(this.testUser3.userName);
      if (!user3) {
        await this.saveUser(this.testUser3);
      }

    } catch (error) {
      showAlertError('DataBaseService.createTestUsers', error);
    }
  }

  // Create y Update del CRUD
  async saveUser(user: User): Promise<void> {
    try {
      await this.db.run(this.sqlInsertUpdate, [
        user.userName,
        user.email,
        user.password,
        user.secretQuestion,
        user.secretAnswer,
        user.firstName,
        user.lastName,
        user.educationalLevel.id,
        convertDateToString(user.dateOfBirth),
        user.address,
        user.isAdmin ? 1 : 0
      ]);
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.saveUser', error);
    }
  }

  // ReadAll del CRUD
  async readUsers(): Promise<User[]> {
    try {
      const q = 'SELECT * FROM USER;';
      const rows = (await this.db.query(q)).values;
      let users: User[] = [];
      if (rows) {
        users = rows.map((row: any) => this.rowToUser(row));
      }
      this.userList.next(users);
      return users;
    } catch (error) {
      showAlertError('DataBaseService.readUsers', error);
      return [];
    }
  }

  // Read del CRUD
  async readUser(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.readUser', error);
      return undefined;
    }
  }

  // Delete del CRUD
  async deleteByUserName(userName: string): Promise<boolean> {
    try {
      const q = 'DELETE FROM USER WHERE userName=?';
      const result: capSQLiteChanges = await this.db.run(q, [userName]);
      const rowsAffected = result.changes?.changes ?? 0;
      await this.readUsers();
      return rowsAffected > 0;
    } catch (error) {
      showAlertError('DataBaseService.deleteByUserName', error);
      return false;
    }
  }

  // Validar usuario
  async findUser(userName: string, password: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=? AND password=?;';
      const rows = (await this.db.query(q, [userName, password])).values;
      return rows ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUser', error);
      return undefined;
    }
  }

  async findUserByUserName(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUserByUserName', error);
      return undefined;
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log('Buscando usuario por correo:', email);
      if (!this.db) {
        throw new Error('Database connection is not initialized');
      }
      const q = 'SELECT * FROM USER WHERE email=?;';
      const rows = (await this.db.query(q, [email])).values;
      console.log('Resultados de la búsqueda:', rows);
      if (rows && rows.length > 0) {
        const user = this.rowToUser(rows[0]);
        console.log('Usuario encontrado:', user);
        return user;
      } else {
        console.log('No se encontró ningún usuario con el correo:', email);
        return undefined;
      }
    } catch (error) {
      showAlertError('DataBaseService.findUserByEmail', error);
      return undefined;
    }
  }

  private rowToUser(row: any): User {
    try {
      const user = new User();
      user.userName = row?.userName || '';
      user.email = row?.email || '';
      user.password = row?.password || '';
      user.secretQuestion = row?.secretQuestion || '';
      user.secretAnswer = row?.secretAnswer || '';
      user.firstName = row?.firstName || '';
      user.lastName = row?.lastName || '';
      user.educationalLevel = row?.educationalLevel ? EducationalLevel.findLevel(row.educationalLevel) || new EducationalLevel() : new EducationalLevel();
      user.dateOfBirth = row?.dateOfBirth ? convertStringToDate(row.dateOfBirth) : new Date();
      user.address = row?.address || '';
      user.isAdmin = row?.isAdmin === 1;
      return user;
    } catch (error) {
      showAlertError('DataBaseService.rowToUser', error);
      return new User();
    }
  }
}
