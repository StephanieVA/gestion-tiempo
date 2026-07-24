import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {

  private api = 'https://backend-gestion-production-b3b7.up.railway.app/api/encuesta';

  constructor(private http: HttpClient) {}

  validarDni(dni: string): Observable<any> {
    return this.http.get(`${this.api}/validar-dni/${dni}`);
  }

  obtenerCursos(semestre: string): Observable<any> {
    return this.http.get(`${this.api}/cursos/${semestre}`);
  }
  
  guardarEncuesta(data:any){
  return this.http.post(`${this.api}/guardar`,data);
}
}
