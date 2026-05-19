import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealPlanService } from '../../services/mealplan.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  templateUrl: './meal-plan.component.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class MealPlanComponent implements OnInit {
  form!: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private mealPlanService: MealPlanService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      plan_name: ['', Validators.required],
      start_date: ['', Validators.required],
      itemsJson: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    let items;
    try {
      items = JSON.parse(this.form.value.itemsJson);
    } catch (e) {
      this.message = 'JSON inválido para os itens';
      return;
    }

    const payload = {
      plan_name: this.form.value.plan_name,
      start_date: this.form.value.start_date,
      items: items
    };

    this.mealPlanService.createMealPlan(payload).subscribe({
      next: () => (this.message = 'Plano de refeição criado com sucesso!'),
      error: (err) => {
        console.error(err);
        this.message = 'Erro ao criar o plano de refeição. Verifique o console para mais detalhes.';
      }
    });
  }
}
