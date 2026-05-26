import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RecipeComponent } from './recipe.component';
import { RecipeService } from '../../services/recipe.service';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let recipeServiceMock: { searchExternal: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    recipeServiceMock = {
      searchExternal: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RecipeComponent],
      providers: [{ provide: RecipeService, useValue: recipeServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
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
});
