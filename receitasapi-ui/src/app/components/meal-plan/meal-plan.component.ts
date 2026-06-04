import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealPlanService, MealPlanPayload } from '../../services/mealplan.service';
import { CommonModule } from '@angular/common';
import { RecipeOption, RecipeService } from '../../services/recipe.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  templateUrl: './meal-plan.component.html',
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class MealPlanComponent implements OnInit {
  private readonly draftKey = 'receitasapi.mealplan.draft';

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
  editForm!: FormGroup;
  mealPlans: any[] = [];
  loadingMealPlans = false;
  savingPlan = false;
  editingMealPlanId: number | null = null;
  message = '';
  error = '';
  recipeSearch = '';
  availableRecipes: RecipeOption[] = [];
  loadingRecipes = false;

  constructor(private fb: FormBuilder, private mealPlanService: MealPlanService, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        plan_name: ['', Validators.required],
        start_date: ['', Validators.required],
        ...this.buildScheduleControls()
      }
    );

    this.editForm = this.fb.group({
      plan_name: ['', [Validators.required, Validators.maxLength(100)]],
      week_number: [1, [Validators.required, Validators.min(1)]]
    });

    this.loadDraft();
    this.loadAvailableRecipes();
    this.loadMealPlans();
    this.form.valueChanges.subscribe(() => this.saveDraft());
  }

  loadMealPlans(): void {
    this.loadingMealPlans = true;
    this.mealPlanService.getMealPlans().subscribe({
      next: (plans) => {
        this.mealPlans = plans || [];
        this.loadingMealPlans = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar os planos.';
        this.loadingMealPlans = false;
      }
    });
  }

  loadAvailableRecipes(term = ''): void {
    this.loadingRecipes = true;
    const preservedSelections = this.preservedSelectedRecipes();
    this.recipeService.getRecipeOptions(term).subscribe({
      next: (options) => {
        this.availableRecipes = this.mergeSelectedRecipes(options || [], preservedSelections);
        this.loadingRecipes = false;
      },
      error: () => {
        this.message = 'Não foi possível carregar receitas válidas.';
        this.loadingRecipes = false;
      }
    });
  }

  searchRecipes(): void {
    this.loadAvailableRecipes(this.recipeSearch);
  }

  private preservedSelectedRecipes(): RecipeOption[] {
    const selectedIds = new Set<number>();

    for (const day of this.weekdays) {
      for (const mealType of this.mealTypes) {
        const control = this.form?.get(this.controlName(day.value, mealType.value));
        const recipeId = this.toPositiveNumber(control?.value);
        if (recipeId !== null) {
          selectedIds.add(recipeId);
        }
      }
    }

    return Array.from(selectedIds).map((recipeId) => {
      return this.availableRecipes.find((recipe) => recipe.id === recipeId) || {
        id: recipeId,
        label: `Receita #${recipeId}`,
        source: 'mine'
      };
    });
  }

  private mergeSelectedRecipes(options: RecipeOption[], preservedSelections: RecipeOption[]): RecipeOption[] {
    if (!preservedSelections.length) {
      return options;
    }

    const merged = new Map<number, RecipeOption>();
    for (const option of [...preservedSelections, ...options]) {
      merged.set(option.id, option);
    }

    return Array.from(merged.values()).sort((left, right) => left.label.localeCompare(right.label));
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
    const items: Array<{
      day_of_week: string;
      meal_type: string;
      recipe_id?: number;
      external_recipe_id?: string;
      external_recipe_name?: string;
    }> = [];
    const invalidIds: number[] = [];

    for (const day of this.weekdays) {
      for (const mealType of this.mealTypes) {
        const control = this.form.get(this.controlName(day.value, mealType.value));
        const recipeId = this.toPositiveNumber(control?.value);

        if (recipeId !== null) {
          const selectedRecipe = this.availableRecipes.find((recipe) => recipe.id === recipeId);
          if (selectedRecipe) {
            if (selectedRecipe.source === 'api') {
              items.push({
                day_of_week: day.value,
                meal_type: mealType.value,
                external_recipe_id: String(selectedRecipe.id),
                external_recipe_name: selectedRecipe.label
              });
            } else {
              items.push({
                day_of_week: day.value,
                meal_type: mealType.value,
                recipe_id: recipeId
              });
            }
          } else {
            invalidIds.push(recipeId);
          }
        }
      }
    }

    return { items, invalidIds };
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

    const { items, invalidIds } = this.buildItemsFromGrid();
    if (invalidIds.length > 0) {
      this.message = 'Selecione apenas receitas válidas da API ou das suas receitas.';
      return;
    }

    if (items.length === 0) {
      this.message = 'Informe ao menos um recipeId para o calendario semanal.';
      return;
    }

    const payload = {
      plan_name: this.form.value.plan_name,
      start_date: this.form.value.start_date,
      items
    };

    this.savingPlan = true;
    this.mealPlanService.createMealPlan(payload).subscribe({
      next: () => {
        this.message = 'Plano de refeicao criado com sucesso!';
        this.savingPlan = false;
        this.clearDraft();
        this.loadMealPlans();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Erro ao criar o plano de refeicao. Verifique o console para mais detalhes.';
        this.savingPlan = false;
      }
    });
  }

  startEdit(plan: any): void {
    this.editingMealPlanId = plan.id;
    this.message = '';
    this.error = '';
    this.editForm.setValue({
      plan_name: plan.planName || '',
      week_number: plan.weekNumber ?? 1
    });
  }

  cancelEdit(): void {
    this.editingMealPlanId = null;
    this.editForm.reset({ plan_name: '', week_number: 1 });
  }

  saveEdit(): void {
    if (this.editForm.invalid || !this.editingMealPlanId) {
      this.error = 'Preencha os dados do plano.';
      return;
    }

    const payload: MealPlanPayload = {
      plan_name: this.editForm.value.plan_name,
      week_number: Number(this.editForm.value.week_number)
    };

    this.mealPlanService.updateMealPlan(this.editingMealPlanId, payload).subscribe({
      next: (updated) => {
        this.mealPlans = this.mealPlans.map((plan) => plan.id === this.editingMealPlanId ? updated : plan);
        this.message = 'Plano atualizado com sucesso!';
        this.cancelEdit();
      },
      error: () => {
        this.error = 'Nao foi possivel atualizar o plano.';
      }
    });
  }

  deletePlan(plan: any): void {
    if (!globalThis.confirm(`Excluir o plano "${plan.planName}"?`)) {
      return;
    }

    this.mealPlanService.deleteMealPlan(plan.id).subscribe({
      next: () => {
        this.mealPlans = this.mealPlans.filter((item) => item.id !== plan.id);
        if (this.editingMealPlanId === plan.id) {
          this.cancelEdit();
        }
        this.message = 'Plano excluido com sucesso.';
      },
      error: () => {
        this.error = 'Nao foi possivel excluir o plano.';
      }
    });
  }
}
