import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss']
})
export class EncuestaComponent {

  constructor(private api: EncuestaService) {}
  persona = {
    dni: '',
    apellidos_nombres: '',
    edad: '',
    sexo: '',
    semestre: ''
  };
  paso = 1;
mensajeError = '';
respuestasPregunta1: any[] = [];
  cursos: any[] = [];
  validarDni() {
  if (this.persona.dni.length !== 8) {
    return;
  }
  this.api.validarDni(this.persona.dni).subscribe({
    next: (resp: any) => {
      if (resp.existe) {
        alert('El DNI ya se encuentra registrado.');
        this.persona.dni = '';
      }
    },
    error: (err) => console.log(err)
  });
}
  onSemestreChange() {
  if (!this.persona.semestre) {
    return;
  }
  this.api.obtenerCursos(this.persona.semestre)
    .subscribe({
      next: (resp: any) => {
       this.cursos = resp;
      },
      error: (err) => console.log(err)
    });
}
  siguientePaso() {
  this.mensajeError = '';
  if (
    !this.persona.dni ||
    !this.persona.apellidos_nombres ||
    !this.persona.edad ||
    !this.persona.sexo ||
    !this.persona.semestre
  ) {
    this.mensajeError = 'Complete todos los datos personales.';
    return;
  }
  this.respuestasPregunta1 = this.cursos.map(curso => ({
    idCurso: curso.id,
    nombre: curso.nombre,
    respuesta: ''
  }));
  this.paso = 2;
}

}
