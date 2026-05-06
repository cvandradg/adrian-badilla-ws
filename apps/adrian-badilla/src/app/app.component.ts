import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NutritionChatComponent } from 'adrian-badilla/settings';

@Component({
  imports: [RouterModule, NutritionChatComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'adrian-badilla';
}
