import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';

import { CuestionarioComponent } from './pages/cuestionario/cuestionario.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },

  {
    path: 'cuestionario',
    component: CuestionarioComponent,
  },
];
