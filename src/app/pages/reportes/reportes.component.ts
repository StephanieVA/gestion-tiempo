import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent {
  private http = inject(HttpClient);

  // UI muestra: II ciclo, I ciclo, etc.
  // Backend recibe: I, II, III, ... (tal cual respuestas.semestre)
  ciclos = ['II', 'I', 'III', 'IV'];
  cicloSeleccionado = '';

  loading = false;
  error: string | null = null;

  exportando = false;
  errorExport: string | null = null;

  dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  //estudiantes: Array<{
  //  estudiante_id: number;
  //  nombres: string;
  //   reporte1: Record<string, number>;
  //  reporte2: Record<string, number>;
  //    reporteFinal: Record<string, number>;
  //}> = [];
  estudiantes: any[] = [];
  modalVisible = false;

  detalle: any[] = [];

  estudianteSeleccionado: any = null;

  // Permisos
  tieneAccesoReportes = false;

  // Paginación remota
  paginaActual = 1;
  totalPaginas = 1;
  readonly limit = 1;

  ngOnInit() {
    const usuario = this.getUsuarioLocal();

    this.tieneAccesoReportes =
      String(usuario?.codigo) === '2026002' ||
      String(usuario?.id) === '2026002';

    if (!this.tieneAccesoReportes) {
      this.error = 'No tiene permisos para ver reportes.';
      return;
    }

    this.cargar();
  }
  verDetalle(estudiante: any) {
    this.estudianteSeleccionado = estudiante;

    const token = this.getTokenLocal();

    this.http
      .get<any[]>(
        `https://backend-gestion-production-b3b7.up.railway.app/detalle-estudiante`,

        {
          params: {
            nombre: estudiante.nombres,
            semestre: estudiante.semestre,
          },

          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        },
      )
      .subscribe({
        next: (data) => {
          this.detalle = data;

          this.modalVisible = true;
        },

        error: (e) => {
          console.log(e);
        },
      });
  }
  private getUsuarioLocal(): any {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('usuario');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private getTokenLocal(): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }

  cargar() {
    this.loading = true;
    this.error = null;

    const params: string[] = [];
    if (this.cicloSeleccionado) {
      // backend recibe I/II/III... (sin "ciclo")
      params.push(`ciclo=${encodeURIComponent(this.cicloSeleccionado)}`);
    }

    params.push(`page=${this.paginaActual}`);
    params.push(`limit=${this.limit}`);

    const qs = `?${params.join('&')}`;

    const token = this.getTokenLocal();

    this.http
      .get<any>(
        `https://backend-gestion-production-b3b7.up.railway.app/${qs}`,
        {
          headers: token
            ? ({ Authorization: `Bearer ${token}` } as any)
            : undefined,
        },
      )
      .subscribe({
        next: (r) => {
          this.estudiantes = r?.estudiantes || [];
          this.totalPaginas =
            typeof r?.totalPaginas === 'number' ? r.totalPaginas : 1;
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.message || 'Error al cargar reportes';
          this.loading = false;
        },
      });
  }

  // Cuando cambie el semestre => vuelve a página 1
  onCambioSemestre() {
    this.paginaActual = 1;
    this.cargar();
  }

  // Anterior / Siguiente deben consultar nuevamente la API
  cambiarPagina(delta: number) {
    const nueva = this.paginaActual + delta;
    if (nueva < 1 || nueva > this.totalPaginas) return;

    this.paginaActual = nueva;
    this.cargar();
  }

  exportarExcel() {
    this.exportando = true;
    this.errorExport = null;

    const params: string[] = [];
    if (this.cicloSeleccionado) {
      params.push(`ciclo=${encodeURIComponent(this.cicloSeleccionado)}`);
    }

    const qs = params.length ? `?${params.join('&')}` : '';

    const token = this.getTokenLocal();

    this.http
      .get(`backend-gestion-production-b3b7.up.railway.app${qs}`, {
        headers: token
          ? ({ Authorization: `Bearer ${token}` } as any)
          : undefined,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');

          const ciclo = this.cicloSeleccionado
            ? this.cicloSeleccionado
            : 'todos';
          a.href = url;
          a.download = `reportes_${ciclo}.xlsx`;
          a.click();

          window.URL.revokeObjectURL(url);
          this.exportando = false;
        },
        error: (e) => {
          this.errorExport = e?.message || 'Error al exportar Excel';
          this.exportando = false;
        },
      });
  }

  cerrarSesion() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } catch {}

    window.location.href = '/';
  }
}
