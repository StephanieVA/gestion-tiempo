import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RespuestasService {
  api = 'http://localhost:3000/api/respuestas';

  cursosApi = 'http://localhost:3000/api/cursos';

  constructor(private http: HttpClient) {}

  guardar(data: any) {
    return this.http.post(
      `${this.api}/guardar`,

      data,
    );
  }

  getCursosByCiclo(ciclo: string) {
    return this.http.get(`${this.cursosApi}/by-ciclo`, {
      params: { ciclo },
    });
  }
}
