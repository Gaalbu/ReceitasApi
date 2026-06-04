import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecipeComponent } from './recipe.component';
import { RecipeService } from '../../services/recipe.service';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let recipeServiceMock: {
    searchExternal: ReturnType<typeof vi.fn>;
    listMyRecipes: ReturnType<typeof vi.fn>;
    createMyRecipe: ReturnType<typeof vi.fn>;
    updateRecipe: ReturnType<typeof vi.fn>;
    deleteRecipe: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    recipeServiceMock = {
      searchExternal: vi.fn(),
      listMyRecipes: vi.fn().mockReturnValue(of([])),
      createMyRecipe: vi.fn(),
      updateRecipe: vi.fn(),
      deleteRecipe: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [{ provide: RecipeService, useValue: recipeServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not search when form is invalid', () => {
    component.searchForm.setValue({ q: '' });

    component.search();

    expect(recipeServiceMock.searchExternal).not.toHaveBeenCalled();
  });

  it('should update results when search succeeds', () => {
    component.searchForm.setValue({ q: 'chicken' });
    recipeServiceMock.searchExternal.mockReturnValue(of({ meals: [{ idMeal: '1', strMeal: 'Chicken' }] }));

    component.search();

    expect(recipeServiceMock.searchExternal).toHaveBeenCalledWith('chicken');
    expect(component.results.length).toBe(1);
  });

  it('should clear results when search fails', () => {
    component.results = [{ idMeal: 'old' } as any];
    component.searchForm.setValue({ q: 'broken' });
    recipeServiceMock.searchExternal.mockReturnValue(throwError(() => new Error('failed')));

    component.search();

    expect(component.results).toEqual([]);
  });

  it('should open and clear rating selection', () => {
    component.openRatingFor({ idMeal: '12' });
    expect(component.selectedRecipeId).toBe(12);
    expect(component.selectedRecipeName).toBe('Receita #12');

    expect(component.extractRecipeId({ external_api_id: '8' })).toBe(8);
    expect(component.extractRecipeId({ idMeal: '0' })).toBeNull();
    expect(component.trackByMeal(0, { idMeal: '99' })).toBe('99');

    component.clearRatingSelection();
    expect(component.selectedRecipeId).toBeNull();
  });

  it('should keep selection name when meal has display name', () => {
    component.openRatingFor({ idMeal: '12', strMeal: 'Chicken Soup' });

    expect(component.selectedRecipeName).toBe('Chicken Soup');
  });

  it('should load my recipes on demand', () => {
    recipeServiceMock.listMyRecipes.mockReturnValueOnce(of([{ id: 1, name: 'Bolo' }]));

    component.loadMyRecipes();

    expect(component.loadingMyRecipes).toBe(false);
    expect(component.myRecipes).toEqual([{ id: 1, name: 'Bolo' }]);
  });

  it('should handle load my recipes errors', () => {
    recipeServiceMock.listMyRecipes.mockReturnValueOnce(throwError(() => new Error('failed')));

    component.loadMyRecipes();

    expect(component.loadingMyRecipes).toBe(false);
    expect(component.recipeError).toBe('Nao foi possivel carregar suas receitas.');
  });

  it('should create a new recipe when form is valid', () => {
    component.recipeForm.setValue({
      title: 'Bolo de chocolate',
      ingredients: 'Farinha, ovos, chocolate',
      instructions: 'Misture e asse',
      prep_time: 30
    });
    recipeServiceMock.createMyRecipe.mockReturnValueOnce(of({ id: 10, name: 'Bolo de chocolate' }));

    component.submitRecipe();

    expect(recipeServiceMock.createMyRecipe).toHaveBeenCalledWith({
      name: 'Bolo de chocolate',
      description: 'Farinha, ovos, chocolate',
      instructions: 'Misture e asse',
      prep_time: 30
    });
    expect(component.recipeMessage).toBe('Receita criada com sucesso.');
    expect(component.recipeForm.value.title).toBe('');
  });

  it('should update an existing recipe when editing', () => {
    component.editingRecipeId = 7;
    component.myRecipes = [{ id: 7, name: 'Antiga' }];
    component.recipeForm.setValue({
      title: 'Nova',
      ingredients: 'Ingredientes',
      instructions: 'Passos',
      prep_time: 20
    });
    recipeServiceMock.updateRecipe.mockReturnValueOnce(of({ id: 7, name: 'Nova' }));

    component.submitRecipe();

    expect(recipeServiceMock.updateRecipe).toHaveBeenCalledWith(7, {
      name: 'Nova',
      description: 'Ingredientes',
      instructions: 'Passos',
      prep_time: 20
    });
    expect(component.recipeMessage).toBe('Receita atualizada com sucesso.');
    expect(component.editingRecipeId).toBeNull();
  });

  it('should reject invalid recipe submission', () => {
    component.recipeForm.reset({ title: '', ingredients: '', instructions: '', prep_time: 15 });

    component.submitRecipe();

    expect(component.recipeError).toBe('Preencha os campos obrigatorios da receita.');
  });

  it('should start and cancel edit mode', () => {
    component.startEdit({ id: 4, name: 'Torta', description: 'Massa', instructions: 'Assar', prepTime: 40 });

    expect(component.editingRecipeId).toBe(4);
    expect(component.recipeForm.value.title).toBe('Torta');

    component.cancelEdit();

    expect(component.editingRecipeId).toBeNull();
    expect(component.recipeMessage).toBe('');
  });

  it('should skip delete when confirmation is declined', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    component.deleteOwnRecipe({ id: 9, name: 'Bolo' });

    expect(recipeServiceMock.deleteRecipe).not.toHaveBeenCalled();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should delete a recipe and cancel edit when needed', () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    component.editingRecipeId = 9;
    component.myRecipes = [{ id: 9, name: 'Bolo' }, { id: 10, name: 'Pao' }];
    recipeServiceMock.deleteRecipe.mockReturnValueOnce(of(void 0));

    component.deleteOwnRecipe({ id: 9, name: 'Bolo' });

    expect(recipeServiceMock.deleteRecipe).toHaveBeenCalledWith(9);
    expect(component.myRecipes).toEqual([{ id: 10, name: 'Pao' }]);
    expect(component.editingRecipeId).toBeNull();
    expect(component.recipeMessage).toBe('Receita removida com sucesso.');
  });

  it('should handle delete errors', () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    recipeServiceMock.deleteRecipe.mockReturnValueOnce(throwError(() => new Error('failed')));

    component.deleteOwnRecipe({ id: 9, name: 'Bolo' });

    expect(component.recipeError).toBe('Falha ao remover a receita.');
  });
});
