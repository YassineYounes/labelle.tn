import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SOCIAL_LINKS } from '../../data/site-data';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  social = SOCIAL_LINKS;

  subject = 'Service client';
  email = '';
  message = '';
  attachmentName = signal('');
  sent = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachmentName.set(input.files?.[0]?.name ?? '');
  }

  submit(): void {
    // No backend yet: acknowledge locally so the flow can be demoed
    this.sent.set(true);
  }
}
