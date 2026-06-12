import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-delivery',
  imports: [RouterLink],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css',
})
export class DeliveryComponent {
  regions = [
    "Gouvernorat de l'Ariana",
    'Gouvernorat de Béja',
    'Gouvernorat de Ben Arous',
    'Gouvernorat de Bizerte',
    'Gouvernorat de Gabès',
    'Gouvernorat de Gafsa',
    'Gouvernorat de Jendouba',
    'Gouvernorat de Kairouan',
    'Gouvernorat de Kasserine',
    'Gouvernorat de Kébili',
    'Gouvernorat du Kef',
    'Gouvernorat de Mahdia',
    'Gouvernorat de la Manouba',
    'Gouvernorat de Médenine',
    'Gouvernorat de Monastir',
    'Gouvernorat de Nabeul',
    'Gouvernorat de Sfax',
    'Gouvernorat de Sidi Bouzid',
    'Gouvernorat de Siliana',
    'Gouvernorat de Sousse',
    'Gouvernorat de Tataouine',
    'Gouvernorat de Tozeur',
    'Gouvernorat de Tunis',
    'Gouvernorat de Zaghouan',
  ];
}
