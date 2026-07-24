import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncuestaService } from '../../services/encuesta.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
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
respuestasPregunta2: any[] = [];
respuestasPregunta3: any[] = [];
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

        console.log("Cursos recibidos:", resp);

        this.cursos = resp;

      },

      error: (err) => {

        console.log("Error cursos:", err);

      }

    });

}
  siguientePaso(){
  if(
    !this.persona.dni ||
    !this.persona.apellidos_nombres ||
    !this.persona.edad ||
    !this.persona.sexo ||
    !this.persona.semestre
  ){
    alert("Complete todos los datos personales");
    return;
  }
  this.respuestasPregunta1 = this.cursos.map(curso => ({
    idCurso: curso.id,
    nombre: curso.nombre,
    respuesta:''
 }));
  this.paso = 2;
}
continuarPregunta1(){

  const incompletos =
    this.respuestasPregunta1.some(
      r => !r.respuesta
    );
  if(incompletos){
    alert(
      "Seleccione Sí o No para todos los cursos" );
    return;
  }
  const tieneTutorias =
    this.respuestasPregunta1.some(
      r => r.respuesta === 'SI'
    );
  if(!tieneTutorias){
    alert(
      "Encuesta finalizada correctamente"
    );
    return;
  }
  this.respuestasPregunta2 =
    this.respuestasPregunta1
    .filter(r=>r.respuesta==='SI')
    .map(curso=>({
      idCurso:curso.idCurso,
      nombre:curso.nombre,
      respuesta:''
    }));
  this.paso=3;

}
}
