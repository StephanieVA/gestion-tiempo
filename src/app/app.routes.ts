import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CuestionarioComponent } from './pages/cuestionario/cuestionario.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { EncuestaComponent } from './pages/encuesta/encuesta.component';
export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'cuestionario',
    component: CuestionarioComponent,
  },
  {
    path: 'reportes',
    component: ReportesComponent,
  },
  {
    path: 'encuesta',
    component: EncuestaComponent
  },
];
