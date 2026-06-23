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

  ciclos = ['II ciclo', 'I ciclo', 'III ciclo', 'IV ciclo'];
  cicloSeleccionado = '';

  loading = false;
  error: string | null = null;

  dias = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];

  estudiantes: Array<{
    estudiante_id: number;
    nombres: string;
    reporte1: Record<string, number>;
    reporte2: Record<string, number>;
    reporteFinal: Record<string, number>;
  }> = [];

  // Permisos
  tieneAccesoReportes = false;

  // Paginación
  paginaActual = 1;
  tamPagina = 5;

  get estudiantesPaginados() {
    const start = (this.paginaActual - 1) * this.tamPagina;
    return this.estudiantes.slice(start, start + this.tamPagina);
  }

  get totalPaginas() {
    return Math.max(1, Math.ceil(this.estudiantes.length / this.tamPagina));
  }

  ngOnInit() {
    // En SSR build localStorage no existe: usar global/window solo en browser.
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

  cargar() {
    this.loading = true;
    this.error = null;

    const params: string[] = [];
    if (this.cicloSeleccionado) {
      params.push(`ciclo=${encodeURIComponent(this.cicloSeleccionado)}`);
    }

    const qs = params.length ? `?${params.join('&')}` : '';

    this.http
      .get<any>(`http://localhost:3000/api/reportes/por-ciclo${qs}`)
      .subscribe({
        next: (r) => {
          this.estudiantes = r.estudiantes || [];
          this.paginaActual = 1;
          this.loading = false;
        },
        error: (e) => {
          this.error = e?.message || 'Error al cargar reportes';
          this.loading = false;
        },
      });
  }

  cambiarPagina(delta: number) {
    const next = this.paginaActual + delta;
    if (next < 1 || next > this.totalPaginas) return;
    this.paginaActual = next;
  }

  // Exporta a CSV (compatible con Excel) para evitar dependencias XLSX.
  exportarExcel() {
    if (!this.estudiantes.length) return;

    const rows: string[] = [];
    const header = [
      'Estudiante',
      'Día',
      'Reporte1 (1+2)',
      'Reporte2 (3+4+5)',
      'ReporteFinal (1..5)',
    ];
    rows.push(header.join(','));

    for (const est of this.estudiantes) {
      for (const d of this.dias) {
        const r1 = est.reporte1[d] || 0;
        const r2 = est.reporte2[d] || 0;
        const rf = est.reporteFinal[d] || 0;

        // escapar comillas
        const estNombre = String(est.nombres).replace(/"/g, '""');
        const safeDia = String(d).replace(/"/g, '""');
        rows.push([`"${estNombre}"`, `"${safeDia}"`, r1, r2, rf].join(','));
      }
    }

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    const ciclo = this.cicloSeleccionado ? this.cicloSeleccionado : 'Todos';
    a.href = url;
    a.download = `reportes_${ciclo.replace(/\s+/g, '_')}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  cerrarSesion() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } catch {}

    // SPA: recargar para volver a login (simple)
    window.location.href = '/';
  }
}
