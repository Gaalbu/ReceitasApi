import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateRecipeComponent } from './create-recipe.component';
import { RecipeService } from '../../services/recipe.service';

describe('CreateRecipeComponent', () => {
  let component: CreateRecipeComponent;
  let recipeServiceMock: { createMyRecipe: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    recipeServiceMock = {
      createMyRecipe: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CreateRecipeComponent],
      providers: [{ provide: RecipeService, useValue: recipeServiceMock }]
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should block submit when form is invalid', () => {
    component.createForm.setValue({
      title: '',
      ingredients: '',
      instructions: '',
      prep_time: 0
    });

    component.create();

    expect(recipeServiceMock.createMyRecipe).not.toHaveBeenCalled();
    expect(component.message).toContain('Preencha todos os campos corretamente');
  });

  it('should call service when form is valid', () => {
    component.createForm.setValue({
      title: 'Omelete',
      ingredients: 'Ovos',
      instructions: 'Misturar e fritar',
      prep_time: 10
    });
    recipeServiceMock.createMyRecipe.mockReturnValue(of({ id: 1 }));

    component.create();

    expect(recipeServiceMock.createMyRecipe).toHaveBeenCalled();
    expect(component.message).toBe('Receita criada com sucesso!');
  });

  it('should show error message when create fails', () => {
    component.createForm.setValue({
      title: 'Omelete',
      ingredients: 'Ovos',
      instructions: 'Misturar e fritar',
      prep_time: 10
    });
    recipeServiceMock.createMyRecipe.mockReturnValue(throwError(() => new Error('boom')));

    component.create();

    expect(component.message).toBe('Erro ao criar a receita');
  });
});
