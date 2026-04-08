import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable, of, switchMap } from 'rxjs';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { environment } from '../../../../../shared/src/lib/environments/environment';

type DialogData = {
  supercenter?: {
    id: string;
    name: string;
    estimateLocation: string;
    exactLocation?: string;
    [key: string]: any;
  };
};

@Component({
  selector: 'lib-food-description-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-description-dialog.component.html',
  styleUrl: './food-description-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodDescriptionDialogComponent implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);

  private readonly baseUrl = 'https://api.spoonacular.com/recipes/guessNutrition';
  private readonly apiKey = environment.spoonacular.appKey // 🔴 pon tu key aquí

  foodData$!: Observable<any>;
  foodName = signal<string>('chicken breast');

isDetailed = signal(false);

ngOnInit(): void {
  const data = this.dynamicDialogConfig.data as DialogData;
  const estimatedName = data?.supercenter?.estimateLocation || 'chicken breast';
  const exactName = data?.supercenter?.exactLocation || estimatedName;

  this.foodName.set(estimatedName);

  // 👇 carga rápida inicial
  this.foodData$ = this.getNutrition(exactName);
}

loadFullData() {
  const query = this.foodName();

  this.foodData$ = this.searchFood(query).pipe(
    switchMap((res: any) => {
      const id = res.results?.[0]?.id;

      if (!id) return of(null);

      return this.getNutritionById(id);
    }),
    map((res: any) => {
      
      const nutrients = res?.nutrition?.nutrients || [];

      const find = (name: string) =>
        nutrients.find((n: any) => n.name === name);

      return {
        calories: find('Calories'),
        protein: find('Protein'),
        fat: find('Fat'),
        carbs: find('Carbohydrates'),
        fiber: find('Fiber'),
        sugar: find('Sugar'),
        iron: find('Iron'),
        calcium: find('Calcium'),
        potassium: find('Potassium'),
        vitaminC: find('Vitamin C'),
        vitaminA: find('Vitamin A'),
        vitaminD: find('Vitamin D')
      };
    })
  );

  this.isDetailed.set(true);
}


searchFood(query: string) {
  return this.http.get('https://api.spoonacular.com/food/ingredients/search', {
    params: {
      query,
      apiKey: this.apiKey
    }
  });
}

getNutritionById(id: number) {
  return this.http.get(`https://api.spoonacular.com/food/ingredients/${id}/information`, {
    params: {
      amount: 1,
      unit: 'piece',
      apiKey: this.apiKey
    }
  });
}

getNutrition(food: string) {
  return this.http.get('https://api.spoonacular.com/recipes/guessNutrition', {
    params: {
      title: food,
      apiKey: this.apiKey
    }
  });
}
}