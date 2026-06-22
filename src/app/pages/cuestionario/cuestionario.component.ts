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
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      this.persona = {
        id: usuario.id || 0,

        nombre: usuario.nombres || '',

        edad: usuario.edad || '',

        sexo: usuario.sexo || '',

        semestre: usuario.semestre || '',
      };
    }

    this.inicializar();
  }

  persona = {
    id: 0,

    nombre: '',

    edad: '',

    sexo: '',

    semestre: '',
  };

  dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  seccion1 = [
    'Relaciones interpersonales',

    'Realidad nacional y globalización',

    'Filosofía y ética',

    'Propedéutica',

    'Comprensión lectora y redacción',
  ];

  seccion2 = [
    'Relaciones interpersonales (Estudio)',

    'Realidad nacional y globalización (Estudio)',

    'Filosofía y ética (Estudio)',

    'Propedéutica (Estudio)',

    'Comprensión lectora y redacción (Estudio)',
  ];

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

  guardar() {
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

    this.api
      .guardar(respuestas)

      .subscribe({
        next: () => {
          alert('Cuestionario guardado');
        },

        error: (e: any) => {
          console.log(e);

          alert('Error al guardar');
        },
      });
  }
}
