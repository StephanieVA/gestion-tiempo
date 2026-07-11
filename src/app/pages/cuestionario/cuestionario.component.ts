import { Component, inject, PLATFORM_ID } from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { RespuestasService } from '../../services/respuestas.service';

@Component({
  selector: 'app-cuestionario',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './cuestionario.component.html',
  styleUrls: ['./cuestionario.component.css'],
})
export class CuestionarioComponent {
  platformId = inject(PLATFORM_ID);

  constructor(private api: RespuestasService) {
    if (isPlatformBrowser(this.platformId)) {
      // Cuestionario público: NO depende de sesión.
      // Se deja persona base (id=0) y semestre vacío hasta que el usuario lo seleccione.
      const storedSemestre = localStorage.getItem('semestre') || '';
      this.persona = {
        id: 0,
        nombre: '',
        edad: '',
        sexo: '',
        semestre: storedSemestre,
      };

      this.inicializar();
      return;
    }

    // En SSR: solo inicializar estructura
    this.inicializar();
  }

  persona = {
    id: 0,

    nombre: '',

    edad: '',

    sexo: '',

    semestre: '',
  };

  cargandoCursos = false;

  dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  // Por defecto (I ciclo) - se reemplaza al cargar cursos desde la API.
  seccion1: string[] = [];

  seccion2: string[] = [];

  seccion3 = [
    'Deporte',
    'Danza',
    'Ofimática',
    'Idiomas',
    'Circulo de estudio',
    'Circulo de debate',
  ];
  seccion4 = [
    'Uso del aparato electrónico',
    'Descanso',
    'Sueño',
    'Transporte',
    'Comida',
    'Actividades domésticas',
    'Pareja',
    'Amigos',
    'Trabajo',
    'Familia',
  ];

  // Por compatibilidad con el cuestionario original: si la API no devuelve cursos,
  // se cargan estos cursos por defecto (I ciclo).
  private cursosPorDefectoI = [
    'Relaciones interpersonales',
    'Realidad nacional y globalización',
    'Filosofía y ética',
    'Propedéutica',
    'Comprensión lectora y redacción',
  ];

  private cursosPorDefectoIParaPregunta2 = this.cursosPorDefectoI.map(
    (c) => `${c} (Estudio)`,
  );

  // Para cada pregunta (1..5), se puede agregar una lista dinámica de asignaturas/actividades.

  extras: {
    [key: number]: { nombre: string; horas: Record<string, number> }[];
  } = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  datos: any = {};

  private normalizarCiclo(ciclo: string) {
    return String(ciclo || '').trim();
  }
  private obtenerCicloBD(semestre: string): string {
    switch (semestre) {
      case 'I':
        return 'I';
      case 'II':
        return 'II';
      case 'III':
        return 'III';
      case 'IV':
        return 'IV';
      case 'V':
        return 'V';
      case 'VI':
        return 'VI';
      case 'VII':
        return 'VII';
      case 'VIII':
        return 'VIII';
      case 'IX':
        return 'IX';
      case 'X':
        return 'X';
      default:
        return 'I';
    }
  }

  private async cargarCursosPorCiclo() {
    // Si no se seleccionó semestre, asumimos I ciclo por defecto.
    // En UI viene como "I ciclo" / "II ciclo".
    // En BD la columna `ciclo` guarda el romano: 'I' o 'II'.
    const cicloBD = this.obtenerCicloBD(this.persona.semestre);
    console.log('Consultando ciclo:', cicloBD);

    // fallback para mantener compatibilidad si la API devuelve vacío.
    // Si la API devuelve vacío para un ciclo, mantenemos lo que corresponda a ese ciclo.
    // - Para I: usamos cursos por defecto I
    // - Para II: usamos cursos por defecto I (por compatibilidad) pero NO deberías ver esto
    //   si tu BD ya trae datos reales para II.
    let nombresFallback: string[] = [...this.cursosPorDefectoI];

    this.cargandoCursos = true;

    try {
      const resp: any = await this.api.getCursosByCiclo(cicloBD).toPromise();

      const cursos = resp?.cursos ?? [];
      const nombres = cursos.map((c: any) => c.nombre).filter(Boolean);

      const nombresFinales = nombres.length ? nombres : nombresFallback;

      // Pregunta 1
      this.seccion1 = [...nombresFinales];

      // Pregunta 2 (vista con etiqueta)
      this.seccion2 = nombresFinales.map((n: string) => `${n} (Estudio)`);
    } catch (e) {
      console.log(e);
      alert('Error al cargar cursos');
      this.seccion1 = [];
      this.seccion2 = [];
    } finally {
      this.cargandoCursos = false;
    }
  }

  inicializar() {
    this.datos = {};

    const todas = [
      ...this.seccion1,
      ...this.seccion2,
      ...this.seccion3,
      ...this.seccion4,
    ];

    todas.forEach((a: string) => {
      this.datos[a] = {};

      this.dias.forEach((d: string) => {
        this.datos[a][d] = 0;
      });
    });

    // Inicializa también horas para extras por pregunta.
    Object.keys(this.extras).forEach((q) => {
      const pregunta = Number(q) as 1 | 2 | 3 | 4 | 5;

      if (!this.extras[pregunta]) {
        this.extras[pregunta] = [];
      }
    });
  }
validarHora(objeto: any, dia: string) {

  let valor = Number(objeto[dia]);

  if (valor < 0 || valor > 9 || !Number.isInteger(valor)) {

    alert('Solo se puede ingresar valores enteros del 0 al 9');

    objeto[dia] = 0;
  }
}
  agregarActividad(pregunta: 1 | 2 | 3 | 4 | 5) {
    const nueva = {
      nombre: '',
      horas: {} as Record<string, number>,
    };

    this.dias.forEach((d: string) => {
      nueva.horas[d] = 0;
    });

    this.extras[pregunta].push(nueva);
  }

  onSemestreChange() {
    // Importante: primero actualizamos las secciones desde la API (P1 y P2)
    // y luego reconstruimos el objeto `datos` para que el template refleje el cambio.
    this.cargarCursosPorCiclo().then(() => {
      // Forzar que Angular detecte cambios y vuelva a renderizar.
      this.datos = {};
      this.inicializar();
    });
  }

  guardar() {
    
  if (
    !this.persona.nombre ||
    !this.persona.edad ||
    !this.persona.sexo ||
    !this.persona.semestre
  ) {

    alert(
      'Complete todos los datos personales antes de enviar el cuestionario'
    );

    return;
  }



  // Validar máximo 24 horas por día

  const diaExcedido = this.dias.find(
    d => this.obtenerTotalDia(d) > 24
  );


  if (diaExcedido) {

    alert(
      `El día ${diaExcedido} supera las 24 horas permitidas. Reduzca las horas antes de enviar.`
    );

    return;
  }
     if (
    !this.persona.nombre ||
    !this.persona.edad ||
    !this.persona.sexo ||
    !this.persona.semestre
  ) {

    alert('Complete todos los datos personales antes de enviar el cuestionario');

    return;
  }


  let respuestas: any[] = [];

    const agregar = (
      lista: string[],

      seccion: number,
    ) => {
      lista.forEach((a: string) => {
        this.dias.forEach((d: string) => {
          const horas = Number(this.datos[a][d]);

          if (horas > 0) {
            respuestas.push({
              estudiante_id: this.persona.id,
              name_estudiante: this.persona.nombre,
              semestre: this.persona.semestre,
              seccion,

              categoria: a,
              actividad: a,
              dia: d,
              horas,
            });
          }
        });
      });
    };

    agregar(this.seccion1, 1);

    agregar(this.seccion2, 2);

    agregar(this.seccion3, 3);
    agregar(this.seccion4, 4);

    Object.keys(this.extras).forEach((q) => {
      const pregunta = Number(q);

      this.extras[pregunta].forEach((o) => {
        if (o.nombre) {
          this.dias.forEach((d) => {
            const horas = Number(o.horas[d]);

            if (horas > 0) {
              respuestas.push({
                estudiante_id: this.persona.id,
                name_estudiante: this.persona.nombre,
                semestre: this.persona.semestre,
                seccion: pregunta,

                categoria: 'Actividades agregadas',
                actividad: o.nombre,
                dia: d,
                horas,
              });
            }
          });
        }
      });
    });

    if (respuestas.length === 0) {
      alert('Ingrese al menos una hora');

      return;
    }
// Validar horas antes de guardar

const valoresInvalidos = respuestas.some(
  r => r.horas < 1 || r.horas > 9 || !Number.isInteger(r.horas)
);


if(valoresInvalidos){

  alert('Existen valores incorrectos. Solo se permiten horas del 1 al 9');

  return;
}
    this.api
      .guardar(respuestas)

      .subscribe({
        next: () => {

  alert('Cuestionario enviado correctamente');

  this.limpiarFormulario();

},

        error: (e: any) => {
          console.log(e);

          alert('Error al guardar');
        },
      });
  }
  limpiarFormulario(){

  this.persona = {
    id:0,
    nombre:'',
    edad:'',
    sexo:'',
    semestre:''
  };


  this.extras = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };


  this.inicializar();

}
  obtenerTotalDia(dia: string): number {

  let total = 0;


  // Suma preguntas 1, 2, 3 y 4
  const actividades = [
    ...this.seccion1,
    ...this.seccion2,
    ...this.seccion3,
    ...this.seccion4
  ];


  actividades.forEach((a: string) => {

    total += Number(this.datos[a]?.[dia]) || 0;

  });


  // Suma actividades agregadas manualmente
  Object.keys(this.extras).forEach((q) => {

    this.extras[Number(q)].forEach((o) => {

      total += Number(o.horas[dia]) || 0;

    });

  });


  return total;
}
}
