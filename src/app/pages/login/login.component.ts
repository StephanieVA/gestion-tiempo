import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [FormsModule],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  codigo = '';

  password = '';

  constructor(
    private auth: AuthService,

    private router: Router,
  ) {}

  login() {
    this.auth
      .login({
        codigo: this.codigo,

        password: this.password,
      })

      .subscribe({
        next: (r: any) => {
          localStorage.setItem(
            'token',

            r.token,
          );

          localStorage.setItem(
            'usuario',

            JSON.stringify(r.usuario),
          );

          // Admin debe ir a reportes; estudiantes a cuestionario
          const codigo = String(r?.usuario?.codigo || r?.usuario?.id || '');
          if (codigo === '2026002') {
            this.router.navigate(['/reportes']);
          } else {
            this.router.navigate(['/cuestionario']);
          }
        },

        error: () => {
          alert('Código o contraseña incorrectos');
        },
      });
  }
}
