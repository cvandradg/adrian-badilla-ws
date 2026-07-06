import { Injectable } from '@angular/core';

/**
 * Servicio de traducción para nombres de comidas de español a inglés.
 * Utilizado para enviar datos a la API que requiere nombres en inglés.
 */
@Injectable({
  providedIn: 'root',
})
export class MealTranslationService {
  private readonly mealDictionary: Map<string, string> = new Map([
    // BREAKFAST
    ['Yogurt griego con fresas', 'Greek yogurt with strawberries'],
    ['Batido verde con proteina', 'Green protein smoothie'],
    ['Claras con espinaca', 'Egg whites with spinach'],
    ['Avena con banano y nueces', 'Oats with banana and walnuts'],
    ['Tostadas integrales con huevo', 'Whole grain toast with eggs'],
    ['Pancakes de avena', 'Oat pancakes'],
    ['Omelette de pavo y queso', 'Turkey and cheese omelette'],
    ['Bowl de yogurt con whey', 'Yogurt bowl with whey'],
    ['Huevos revueltos con pollo', 'Scrambled eggs with chicken'],

    // MORNING SNACK
    ['Pepino con hummus', 'Cucumber with hummus'],
    ['Fresas con yogurt light', 'Strawberries with light yogurt'],
    ['Manzana con canela', 'Apple with cinnamon'],
    ['Yogurt con granola', 'Yogurt with granola'],
    ['Banano con mantequilla de mani', 'Banana with peanut butter'],
    ['Sandwich mini de pavo', 'Mini turkey sandwich'],
    ['Shake de proteina', 'Protein shake'],
    ['Rollitos de pavo y queso', 'Turkey and cheese rolls'],
    ['Cottage con almendras', 'Cottage with almonds'],

    // LUNCH
    ['Ensalada de atun', 'Tuna salad'],
    ['Pollo con vegetales salteados', 'Chicken with sautéed vegetables'],
    ['Wrap de lechuga con pavo', 'Lettuce wrap with turkey'],
    ['Pollo con arroz integral', 'Chicken with brown rice'],
    ['Carne magra con pure', 'Lean meat with mashed potatoes'],
    ['Salmon con quinoa', 'Salmon with quinoa'],
    ['Pechuga con camote y broccoli', 'Chicken breast with sweet potato and broccoli'],
    ['Bowl de res con arroz', 'Beef bowl with rice'],
    ['Tilapia con lentejas', 'Tilapia with lentils'],

    // AFTERNOON SNACK
    ['Gelatina light con yogurt', 'Sugar-free gelatin with yogurt'],
    ['Palitos de apio con dip', 'Celery sticks with dip'],
    ['Kiwi con semillas', 'Kiwi with seeds'],
    ['Tostada integral con aguacate', 'Whole grain toast with avocado'],
    ['Yogurt con fruta', 'Yogurt with fruit'],
    ['Queso cottage con galletas de arroz', 'Cottage cheese with rice crackers'],
    ['Batido de proteina con cacao', 'Protein smoothie with cocoa'],
    ['Huevos duros con pavo', 'Hard boiled eggs with turkey'],
    ['Yogurt griego con whey', 'Greek yogurt with whey'],

    // DINNER
    ['Crema de vegetales con pollo', 'Cream of vegetables with chicken'],
    ['Pescado blanco con ensalada', 'White fish with salad'],
    ['Tortilla de claras con hongos', 'Egg white tortilla with mushrooms'],
    ['Pollo con quinoa y vegetales', 'Chicken with quinoa and vegetables'],
    ['Tacos integrales de res', 'Whole grain beef tacos'],
    ['Pasta integral con atun', 'Whole grain pasta with tuna'],
    ['Salmon con espinaca', 'Salmon with spinach'],
    ['Pollo grillado con huevo', 'Grilled chicken with eggs'],
    ['Carne magra con esparragos', 'Lean meat with asparagus'],

    // NIGHT SNACK
    ['Leche de almendra con chia', 'Almond milk with chia'],
    ['Infusion con yogurt light', 'Herbal tea with light yogurt'],
    ['Gelatina zero con queso cottage', 'Sugar-free gelatin with cottage cheese'],
    ['Yogurt con avena', 'Yogurt with oats'],
    ['Fruta con nueces', 'Fruit with nuts'],
    ['Tostada integral con ricotta', 'Whole grain toast with ricotta'],
    ['Caseina con agua', 'Casein with water'],
    ['Yogurt griego con mani', 'Greek yogurt with peanuts'],
    ['Queso cottage proteico', 'Protein cottage cheese'],
  ]);

  /**
   * Traduce el nombre de una comida de español a inglés.
   * Si no encuentra una traducción, devuelve el nombre original.
   * @param mealNameInSpanish Nombre de la comida en español
   * @returns Nombre de la comida en inglés o el original si no existe en el diccionario
   */
  translateMealToEnglish(mealNameInSpanish: string): string {
    return this.mealDictionary.get(mealNameInSpanish) || mealNameInSpanish;
  }

  /**
   * Traduce múltiples nombres de comidas.
   * @param mealNames Array de nombres de comidas en español
   * @returns Array de nombres traducidos al inglés
   */
  translateMealsToEnglish(mealNames: string[]): string[] {
    return mealNames.map((name) => this.translateMealToEnglish(name));
  }
}
