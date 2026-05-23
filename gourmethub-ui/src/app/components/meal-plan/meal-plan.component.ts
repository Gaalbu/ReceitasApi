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
  private readonly draftKey = 'gourmethub.mealplan.draft';

  readonly weekdays = [
    { value: 'MONDAY', label: 'Segunda' },
    { value: 'TUESDAY', label: 'Terca' },
    { value: 'WEDNESDAY', label: 'Quarta' },
    { value: 'THURSDAY', label: 'Quinta' },
    { value: 'FRIDAY', label: 'Sexta' },
    { value: 'SATURDAY', label: 'Sabado' },
    { value: 'SUNDAY', label: 'Domingo' }
  ] as const;

  readonly mealTypes = [
    { value: 'LUNCH', label: 'Almoco' },
    { value: 'DINNER', label: 'Jantar' }
  ] as const;

  form!: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private mealPlanService: MealPlanService) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        plan_name: ['', Validators.required],
        start_date: ['', Validators.required],
        ...this.buildScheduleControls()
      }
    );

    this.loadDraft();
    this.form.valueChanges.subscribe(() => this.saveDraft());
  }

  private buildScheduleControls(): Record<string, unknown> {
    const controls: Record<string, unknown> = {};

    for (const day of this.weekdays) {
      for (const mealType of this.mealTypes) {
        controls[this.controlName(day.value, mealType.value)] = [''];
      }
    }

    return controls;
  }

  controlName(dayOfWeek: string, mealType: string): string {
    return `${dayOfWeek}_${mealType}`;
  }

  private toPositiveNumber(value: unknown): number | null {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  private buildItemsFromGrid() {
    const items: Array<{ dayOfWeek: string; mealType: string; recipeId: number }> = [];

    for (const day of this.weekdays) {
      for (const mealType of this.mealTypes) {
        const control = this.form.get(this.controlName(day.value, mealType.value));
        const recipeId = this.toPositiveNumber(control?.value);

        if (recipeId !== null) {
          items.push({
            dayOfWeek: day.value,
            mealType: mealType.value,
            recipeId
          });
        }
      }
    }

    return items;
  }

  saveDraft() {
    try {
      localStorage.setItem(this.draftKey, JSON.stringify(this.form.getRawValue()));
    } catch {
      // Ignore storage errors (private mode / SSR / quota).
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      this.form.patchValue(parsed);
      this.message = 'Rascunho carregado.';
    } catch {
      this.message = 'Nao foi possivel carregar o rascunho.';
    }
  }

  clearDraft() {
    try {
      localStorage.removeItem(this.draftKey);
    } catch {
      // Ignore storage errors.
    }
  }

  submit() {
    if (this.form.invalid) {
      this.message = 'Preencha nome do plano e data inicial.';
      return;
    }

    const items = this.buildItemsFromGrid();
    if (items.length === 0) {
      this.message = 'Informe ao menos um recipeId para o calendario semanal.';
      return;
    }

    const payload = {
      plan_name: this.form.value.plan_name,
      start_date: this.form.value.start_date,
      items: items
    };

    this.mealPlanService.createMealPlan(payload).subscribe({
      next: () => {
        this.message = 'Plano de refeicao criado com sucesso!';
        this.clearDraft();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erro ao criar o plano de refeicao. Verifique o console para mais detalhes.';
      }
    });
  }
}
