import { showAlert, showAlertError } from "../tools/message-functions";

export class Asistencia {

  static jsonAsistenciaExample =
    `{
      "bloqueInicio": "12",
      "bloqueTermino": "14",
      "dia": "Miercoles",
      "horaFin": "14:00",
      "horaInicio": "12:00",
      "idAsignatura": "A445",
      "nombreAsignatura": "Calidad de Software",
      "nombreProfesor": "Francisco Toro",
      "seccion": "A441",
      "sede": "Padre alonso de ovalle",
    }`;

    static jsonAsistenciaEmpty =
    `{
      "bloqueInicio": 0,
      "bloqueTermino": 0,
      "dia": "",
      "horaFin": "",
      "horaInicio": "",
      "idAsignatura": "",
      "nombreAsignatura": "",
      "nombreProfesor": "",
      "seccion": "",
      "sede": ""
    }`;

   bloqueInicio = 0;
   bloqueTermino = 0;
   dia = '';
   horaFin = '';
   horaInicio = '';
   idAsignatura = '';
   nombreAsignatura = '';
   nombreProfesor = '';
   seccion = '';
   sede = '';

  constructor() { }

  public static getNewAsistencia(
    bloqueInicio: number,
    bloqueTermino: number,
    dia: string,
    horaFin: string,
    horaInicio: string,
    idAsignatura: string,
    nombreAsignatura: string,
    nombreProfesor: string,
    seccion: string,
    sede: string,
  ) {
    const asistencia = new Asistencia();
    asistencia.bloqueInicio = bloqueInicio;
    asistencia.bloqueTermino = bloqueTermino;
    asistencia.dia = dia;
    asistencia.horaFin = horaFin;
    asistencia.horaInicio = horaInicio;
    asistencia.idAsignatura = idAsignatura;
    asistencia.nombreAsignatura = nombreAsignatura;
    asistencia.nombreProfesor = nombreProfesor;
    asistencia.seccion = seccion;
    asistencia.sede = sede;
    return asistencia;
  }

  static isValidAsistenciaQrCode(qr: string) {

    if (qr === '') return false;

    try {
      const json = JSON.parse(qr);

      if ( json.bloqueInicio       !== undefined
        && json.bloqueTermino     !== undefined
        && json.dia     !== undefined
        && json.horaFin     !== undefined
        && json.horaInicio       !== undefined
        && json.idAsignatura     !== undefined
        && json.nombreAsignatura !== undefined
        && json.nombreProfesor      !== undefined
        && json.seccion      !== undefined
        && json.sede      !== undefined)
      {
        return true;
      }
    } catch(error) { }

    showAlert('El código QR escaneado no corresponde a un dinosaurio');
    return false;
  }

}
