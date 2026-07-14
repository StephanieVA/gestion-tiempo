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
  // URL base del backend
  api =
    'https://backend-gestion-production-b3b7.up.railway.app/api/reportes';
  ciclos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  cicloSeleccionado = '';
  loading = false;
  error: string | null = null;
  exportando = false;
  errorExport: string | null = null;
  estudiantes:any[]=[];
  modalVisible=false;
  detalle:any[]=[];
  estudianteSeleccionado:any=null;
  tieneAccesoReportes=false;
  paginaActual=1;
  totalPaginas=1;
  readonly limit=10;
  ngOnInit(){

    const usuario=this.getUsuarioLocal();
    this.tieneAccesoReportes =
      String(usuario?.codigo)==='2026002' ||
      String(usuario?.id)==='2026002';
    if(!this.tieneAccesoReportes){
      this.error='No tiene permisos para ver reportes.';
      return;
    }
    this.cargar();
  }
  private getUsuarioLocal(){
    try{
      const raw=localStorage.getItem('usuario');
      return raw ? JSON.parse(raw):null;
    }catch{
      return null;
    }
  }
  private getTokenLocal(){
    try{
      return localStorage.getItem('token');
    }catch{
      return null;
    }
  }
  cargar(){
    this.loading=true;
    this.error=null;
    let params:any={
      page:this.paginaActual,
      limit:this.limit
    };
    if(this.cicloSeleccionado){
      params.ciclo=this.cicloSeleccionado;
    }
    const token=this.getTokenLocal();
    this.http.get<any>(
      `${this.api}/por-ciclo`,

      {
        params,
        headers:token
        ?
        {
          Authorization:`Bearer ${token}`
        }
        :
        undefined
      }
    )
    .subscribe({
      next:(r)=>{
        console.log('RESPUESTA API',r);
        this.estudiantes=r.estudiantes || [];
        this.totalPaginas=r.totalPaginas || 1;
        this.loading=false;
      },
      error:(e)=>{
        console.log(e);
        this.error=e.message || 
        'Error al cargar reportes';
        this.loading=false;
      }
    });
 }
verDetalle(estudiante:any){
this.estudianteSeleccionado = estudiante;
this.http.get<any[]>(
'https://backend-gestion-production-b3b7.up.railway.app/api/reportes/detalle-estudiante',
{
params:{
nombre: estudiante.nombres,
semestre: estudiante.semestre,
encuesta_id: estudiante.encuesta_id
}
}
)
.subscribe({
next:(data)=>{
console.log("DETALLE:",data);
this.detalle=data;
this.modalVisible=true;
},
error:(error)=>{
console.log(error);
}
});
}
  onCambioSemestre(){
    this.paginaActual=1;
    this.cargar();
  }
  cambiarPagina(delta:number){
    const nueva=this.paginaActual+delta;
    if(nueva<1 || nueva>this.totalPaginas){
      return;
    }
    this.paginaActual=nueva;
    this.cargar();
  }
  exportarExcel(){
    this.exportando=true;
    this.errorExport=null;
    let params:any={};
    if(this.cicloSeleccionado){
      params.ciclo=this.cicloSeleccionado;
    }
    const token=this.getTokenLocal();
    this.http.get(

      `${this.api}/exportar-excel`,

      {
        params,
        headers:token
        ?
        {
          Authorization:`Bearer ${token}`
        }
        :
        undefined,
        responseType:'blob'
      }
    )
    .subscribe({
      next:(blob)=>{
        const url=window.URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;
        a.download='reportes.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.exportando=false;
      },
      error:(e)=>{
        this.errorExport=
        e.message ||
        'Error exportando Excel';
        this.exportando=false;
      }
    });
  }
  cerrarSesion(){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href='/';
  }
eliminar(estudiante:any){
if(!confirm(
`¿Eliminar registro de ${estudiante.nombres}?`
)){
return;
}

this.http.delete(
`${this.api}/eliminar`,
{
body:{
encuesta_id: estudiante.encuesta_id
}
}
)
.subscribe({
next:(r:any)=>{
alert(r.mensaje);
this.cargar();
},
error:(e)=>{
console.log(e);
alert("Error al eliminar");
}
});
}
editar(est:any){
  console.log("Editar estudiante:", est);
}
  validar(est:any){
this.http.put<any>(
`${this.api}/validar-estudiante`,
{
nombre: est.nombres,
semestre: est.semestre
}
)
.subscribe({
next:(resp)=>{
console.log(resp);
// volver a cargar datos
this.cargar();
},
error:(err)=>{
console.log(err);
}
});
}
}
