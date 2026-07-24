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
    semestre: '',
     seccion: ''
  };
  paso = 1;
  mensajeError = '';
  cursos: any[] = [];
  respuestasPregunta1: any[] = [];
 respuestasPregunta2: any[] = [];
  respuestasPregunta3: any[] = [];

  // ==========================
  // VALIDAR DNI
  // ==========================
  validarDni() {
    if(this.persona.dni.length !== 8){
      return;
    }
    this.api.validarDni(this.persona.dni)
    .subscribe({
      next:(resp:any)=>{
       if(resp.existe){
          alert(
            'El DNI ya se encuentra registrado'
          );
         this.persona.dni='';
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });


  }

  // ==========================
  // CARGAR CURSOS POR SEMESTRE
  // ==========================
  onSemestreChange(){
    if(!this.persona.semestre){
      return;
    }
    this.api.obtenerCursos(this.persona.semestre)
    .subscribe({

      next:(resp:any)=>{
        console.log(
          "Cursos recibidos:",
          resp
        );
        this.cursos = resp;
      },
      error:(err)=>{
        console.log(
          "Error cursos:",
          err
        );
      }
    });
  }
 // ==========================
  // PASAR DATOS A PREGUNTA 1
  // ==========================


  siguientePaso(){
   if(
      !this.persona.dni ||
      !this.persona.apellidos_nombres ||
     !this.persona.edad ||
      !this.persona.sexo ||
      !this.persona.semestre || 
      !this.persona.seccion
    ){
      alert(
        "Complete todos los datos personales"
      );
      return;
    }
    if(this.cursos.length===0){
      alert(
        "No existen cursos cargados"
      );
      return;
    }
    this.respuestasPregunta1 = 
    this.cursos.map(curso=>({
      idCurso: curso.id,
      nombre: curso.nombre,
    respuesta:''
    }));
    this.paso=2;
  }

  // ==========================
  // VALIDAR PREGUNTA 1
  // ==========================
  continuarPregunta1(){
    const incompletos =
    this.respuestasPregunta1.some(
      r=>!r.respuesta
    );
    if(incompletos){
      alert(
        "Seleccione Sí o No en todos los cursos"
      );
      return;
    }
    const tieneTutorias =
    this.respuestasPregunta1.some(
      r=>r.respuesta==='SI'
    );
    if(!tieneTutorias){
      alert(
        "Encuesta finalizada"
      );
      return;
    }
    this.prepararPregunta2();
    this.prepararPregunta2();

console.log(
  "Pregunta 1:",
  this.respuestasPregunta1
);
console.log(
  "Pregunta 2:",
  this.respuestasPregunta2
);
    this.paso=3;
  }
  // ==========================
  // PREPARAR PREGUNTA 2
  // ==========================
  prepararPregunta2(){
    this.respuestasPregunta2 =
    this.respuestasPregunta1
    .filter(
      r=>r.respuesta==='SI'
    )
    .map(curso=>({
      idCurso:curso.idCurso,
     nombre:curso.nombre,
      tipo:''
    }));
  }
  continuarPregunta2(){
const incompletos =
this.respuestasPregunta2.some(
r => !r.tipo
);
if(incompletos){
alert(
"Seleccione Individual o Grupal para todos los cursos"
);
return;
}
this.respuestasPregunta3 = 
this.respuestasPregunta2.map(curso => ({
idCurso: curso.idCurso,
nombre: curso.nombre,
modalidad:''
}));
this.paso=4;


}
  guardar(){


let respuestas:any[]=[];



this.respuestasPregunta1
.filter(c=>c.respuesta==='SI')
.forEach(curso=>{


const tipo =
this.respuestasPregunta2.find(
x=>x.idCurso===curso.idCurso
);


const modalidad =
this.respuestasPregunta3.find(
x=>x.idCurso===curso.idCurso
);



respuestas.push({

idCurso:curso.idCurso,

recibio:'SI',

tipo:tipo?.tipo || '',

modalidad:modalidad?.modalidad || ''

});


});



const datos={


persona:this.persona,

respuestas:respuestas


};



console.log(
"Datos enviados:",
datos
);



this.api.guardarEncuesta(datos)
.subscribe({

  next:(resp:any)=>{

    alert("Encuesta registrada correctamente");


    // Limpiar datos personales
    this.persona = {
      dni:'',
      apellidos_nombres:'',
      edad:'',
      sexo:'',
      semestre:'',
      seccion:''
    };


    // Limpiar cursos cargados
    this.cursos = [];


    // Limpiar respuestas
    this.respuestasPregunta1 = [];
    this.respuestasPregunta2 = [];
    this.respuestasPregunta3 = [];


    // Regresar al inicio
    this.paso = 1;


  },


  error:(error)=>{

    console.log(error);

    alert("Error al guardar encuesta");

  }

});

}
}
