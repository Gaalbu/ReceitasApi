import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MealPlanService } from '../../services/mealplan.service';

@Component({
  selector: 'app-meal-plan',
  templateUrl: './meal-plan.component.html'
})
export class MealPlanComponent {
  form!: FormGroup;

  message = '';

  constructor(private fb: FormBuilder, private mealPlanService: MealPlanService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      itemsJson: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    let items;
    try {
      items = JSON.parse(this.form.value.itemsJson);
    } catch (e) {
      this.message = 'JSON inválido';
      return;
    }

    const payload = {
      name: this.form.value.name,
      items: items
    };

    this.mealPlanService.createMealPlan(payload).subscribe({
      next: () => (this.message = 'Plano criado'),
      error: () => (this.message = 'Erro ao criar')
    });
  }
}
