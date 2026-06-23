import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';

/**
 * Slim trust/reassurance strip shown high on the home page (just under the
 * hero) so the key promises are visible before scrolling. The fuller version
 * with the same promises also lives in the about/info section at the bottom.
 */
@Component({
  selector: 'app-reassurance-bar',
  templateUrl: './reassurance-bar.component.html',
  styleUrl: './reassurance-bar.component.css',
})
export class ReassuranceBarComponent {
  config = inject(ConfigService);
}
