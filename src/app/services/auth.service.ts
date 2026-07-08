import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //api = 'http://localhost:3000/api/auth';
  api = 'https://backend-gestion-production-1e84.up.railway.app/api/auth';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(
      `${this.api}/login`,

      data,
    );
  }
}
