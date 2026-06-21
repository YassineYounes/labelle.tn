import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-info-section',
  templateUrl: './info-section.component.html',
  styleUrl: './info-section.component.css',
})
export class InfoSectionComponent {
  config = inject(ConfigService);
}
