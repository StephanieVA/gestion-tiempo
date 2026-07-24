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

  cursos: any[] = [];

}
