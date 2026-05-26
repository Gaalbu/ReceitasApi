import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MealPlanComponent } from './meal-plan.component';
import { MealPlanService } from '../../services/mealplan.service';

describe('MealPlanComponent', () => {
  let component: MealPlanComponent;
  let mealPlanServiceMock: { createMealPlan: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();

    mealPlanServiceMock = {
      createMealPlan: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MealPlanComponent],
      providers: [{ provide: MealPlanService, useValue: mealPlanServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(MealPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should require base fields before submit', () => {
    component.form.patchValue({ plan_name: '', start_date: '' });

    component.submit();

    expect(component.message).toContain('Preencha nome do plano e data inicial.');
    expect(mealPlanServiceMock.createMealPlan).not.toHaveBeenCalled();
  });

  it('should require at least one recipe slot', () => {
    component.form.patchValue({ plan_name: 'Semana 1', start_date: '2026-05-23' });

    component.submit();

    expect(component.message).toContain('Informe ao menos um recipeId');
    expect(mealPlanServiceMock.createMealPlan).not.toHaveBeenCalled();
  });

  it('should submit valid weekly plan payload', () => {
    component.form.patchValue({
      plan_name: 'Semana 1',
      start_date: '2026-05-23',
      MONDAY_LUNCH: 10,
      TUESDAY_DINNER: 20
    });
    mealPlanServiceMock.createMealPlan.mockReturnValue(of({ id: 1 }));

    component.submit();

    expect(mealPlanServiceMock.createMealPlan).toHaveBeenCalled();
    const payload = mealPlanServiceMock.createMealPlan.mock.calls[0][0];
    expect(payload.plan_name).toBe('Semana 1');
    expect(payload.start_date).toBe('2026-05-23');
    expect(payload.items.length).toBe(2);
    expect(component.message).toBe('Plano de refeicao criado com sucesso!');
  });

  it('should save and load draft from localStorage', () => {
    localStorage.setItem(
      'receitasapi.mealplan.draft',
      JSON.stringify({ plan_name: 'Draft', start_date: '2026-05-23', MONDAY_LUNCH: 7 })
    );

    component.loadDraft();

    expect(component.form.value.plan_name).toBe('Draft');
    expect(component.form.value.MONDAY_LUNCH).toBe(7);
  });

  it('should expose control names and ignore invalid numeric slots', () => {
    expect(component.controlName('MONDAY', 'LUNCH')).toBe('MONDAY_LUNCH');

    component.form.patchValue({
      plan_name: 'Semana 1',
      start_date: '2026-05-23',
      MONDAY_LUNCH: 0,
      TUESDAY_DINNER: 'abc',
      WEDNESDAY_LUNCH: 3
    });
    const items = (component as any).buildItemsFromGrid();
    expect(items).toEqual([
      { day_of_week: 'WEDNESDAY', meal_type: 'LUNCH', recipe_id: 3 }
    ]);
  });

  it('should handle service errors and draft storage failures gracefully', () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('broken');
    });
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('broken');
    });

    mealPlanServiceMock.createMealPlan.mockReturnValue(throwError(() => new Error('boom')));
    component.form.patchValue({
      plan_name: 'Semana 2',
      start_date: '2026-05-23',
      MONDAY_LUNCH: 1
    });

    component.saveDraft();
    component.loadDraft();
    component.submit();
    component.clearDraft();

    expect(component.message).toContain('Erro ao criar o plano de refeicao');

    storageSpy.mockRestore();
    getSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('should report draft load failures without crashing', () => {
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('broken');
    });

    component.loadDraft();

    expect(component.message).toContain('Nao foi possivel carregar o rascunho.');

    getSpy.mockRestore();
  });
});
