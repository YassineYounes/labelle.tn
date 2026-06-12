import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  mode = signal<'login' | 'register'>('login');
  submitted = signal(false);

  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.submitted.set(false);
  }

  submit(): void {
    // No backend yet: surface a friendly notice instead of a fake login
    this.submitted.set(true);
  }
}
