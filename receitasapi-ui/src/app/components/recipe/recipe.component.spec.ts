import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecipeComponent } from './recipe.component';
import { RecipeService } from '../../services/recipe.service';
import { vi } from 'vitest';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let recipeServiceMock: {
    searchExternal: ReturnType<typeof vi.fn>;
    getMyRecipes: ReturnType<typeof vi.fn>;
    getMyFavorites: ReturnType<typeof vi.fn>;
    createMyRecipe: ReturnType<typeof vi.fn>;
    updateMyRecipe: ReturnType<typeof vi.fn>;
    deleteMyRecipe: ReturnType<typeof vi.fn>;
    addFavorite: ReturnType<typeof vi.fn>;
    deleteFavorite: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    recipeServiceMock = {
      searchExternal: vi.fn(),
      getMyRecipes: vi.fn(),
      getMyFavorites: vi.fn(),
      createMyRecipe: vi.fn(),
      updateMyRecipe: vi.fn(),
      deleteMyRecipe: vi.fn(),
      addFavorite: vi.fn(),
      deleteFavorite: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [{ provide: RecipeService, useValue: recipeServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    recipeServiceMock.getMyRecipes.mockReturnValue(of([]));
    recipeServiceMock.getMyFavorites.mockReturnValue(of([]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.detectChanges();
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

  it('should load my recipes and allow editing and deleting', () => {
    recipeServiceMock.getMyRecipes.mockReturnValue(of([
      { id: 1, name: 'Omelete', description: 'Ovos', instructions: 'Misturar', prepTime: 10 }
    ]));

    component.loadMyRecipes();

    expect(component.myRecipes.length).toBe(1);
    component.editMyRecipe(component.myRecipes[0]);
    expect(component.editingRecipeId).toBe(1);

    recipeServiceMock.updateMyRecipe.mockReturnValue(of({}));
    component.recipeForm.setValue({
      title: 'Omelete 2',
      ingredients: 'Ovos',
      instructions: 'Misturar e fritar',
      prep_time: 12
    });
    component.submitMyRecipe();
    expect(recipeServiceMock.updateMyRecipe).toHaveBeenCalledWith(1, {
      name: 'Omelete 2',
      description: 'Ovos',
      instructions: 'Misturar e fritar',
      prep_time: 12
    });

    recipeServiceMock.deleteMyRecipe.mockReturnValue(of(void 0));
    component.deleteMyRecipe({ id: 1, name: 'Omelete', description: 'Ovos', instructions: 'Misturar', prepTime: 10 });
    expect(recipeServiceMock.deleteMyRecipe).toHaveBeenCalledWith(1);
  });

  it('should load my favorites and allow adding and deleting', () => {
    recipeServiceMock.getMyFavorites.mockReturnValue(of([
      { id: 3, recipeName: 'Pizza', externalRecipeId: '22', imageUrl: 'img' }
    ]));

    component.loadMyFavorites();

    expect(component.myFavorites.length).toBe(1);

    recipeServiceMock.addFavorite.mockReturnValue(of({}));
    component.addFavorite({ idMeal: '22', strMeal: 'Pizza', strMealThumb: 'img' });
    expect(recipeServiceMock.addFavorite).toHaveBeenCalledWith({
      external_recipe_id: '22',
      recipe_name: 'Pizza',
      image_url: 'img'
    });

    recipeServiceMock.deleteFavorite.mockReturnValue(of(void 0));
    component.deleteFavorite({ id: 3, externalRecipeId: '22', recipeName: 'Pizza', imageUrl: 'img' });
    expect(recipeServiceMock.deleteFavorite).toHaveBeenCalledWith(3);
  });
});
