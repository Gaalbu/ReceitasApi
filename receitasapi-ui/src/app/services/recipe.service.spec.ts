import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;
  const apiBase = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecipeService]
    });

    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search external recipes with GET request', () => {
    const searchName = 'pasta';
    const mockResponse = [
      { id: 1, name: 'Pasta Carbonara', image: 'url1' },
      { id: 2, name: 'Pasta Bolognesa', image: 'url2' }
    ];

    service.searchExternal(searchName).subscribe(result => {
      expect(result).toEqual(mockResponse);
      expect(result.length).toBe(2);
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/recipes/search') && request.url.includes('pasta')
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should encode special characters in search', () => {
    const searchName = 'pasta & risotto';
    const mockResponse: any[] = [];

    service.searchExternal(searchName).subscribe();

    const req = httpMock.expectOne(request => 
      request.url.includes('/recipes/search') && request.url.includes('pasta')
    );
    expect(req.request.url).toContain(encodeURIComponent(searchName));
    req.flush(mockResponse);
  });

  it('should handle empty search results', () => {
    const searchName = 'nonexistent';
    const mockResponse: any[] = [];

    service.searchExternal(searchName).subscribe(result => {
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/recipes/search')
    );
    req.flush(mockResponse);
  });

  it('should handle search error', () => {
    const searchName = 'pasta';
    const errorMessage = 'Search failed';
    let errorReceived = false;

    service.searchExternal(searchName).subscribe(
      () => {},
      error => {
        errorReceived = true;
        expect(error.status).toBe(500);
      }
    );

    const req = httpMock.expectOne(request => 
      request.url.includes('/recipes/search')
    );
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should create a recipe with POST request', () => {
    const payload = {
      name: 'New Recipe',
      description: 'Test recipe',
      ingredients: ['item1', 'item2'],
      instructions: 'Mix and cook'
    };
    const mockResponse = { id: 1, ...payload };

    service.createMyRecipe(payload).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiBase}/recipes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should get my recipes with GET request', () => {
    const mockResponse = [
      { id: 1, name: 'Omelete' },
      { id: 2, name: 'Salada' }
    ];

    service.getMyRecipes().subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiBase}/recipes/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get my favorites with GET request', () => {
    const mockResponse = [
      { id: 11, recipeName: 'Lasanha', externalRecipeId: '200', imageUrl: 'img' }
    ];

    service.getMyFavorites().subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiBase}/favorites/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a recipe with PUT request', () => {
    const payload = {
      name: 'Updated Recipe',
      description: 'Updated description',
      instructions: 'Updated instructions',
      prep_time: 20
    };

    service.updateMyRecipe(10, payload).subscribe(result => {
      expect(result).toEqual({ id: 10, ...payload });
    });

    const req = httpMock.expectOne(`${apiBase}/recipes/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 10, ...payload });
  });

  it('should delete a recipe with DELETE request', () => {
    service.deleteMyRecipe(7).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${apiBase}/recipes/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should add a favorite with POST request', () => {
    const payload = {
      external_recipe_id: '321',
      recipe_name: 'Pizza',
      image_url: 'https://img'
    };

    service.addFavorite(payload).subscribe(result => {
      expect(result).toEqual({ id: 1, ...payload });
    });

    const req = httpMock.expectOne(`${apiBase}/favorites`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({ id: 1, ...payload });
  });

  it('should delete a favorite with DELETE request', () => {
    service.deleteFavorite(9).subscribe(result => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne(`${apiBase}/favorites/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle error on create recipe', () => {
    const payload = {
      name: 'Invalid Recipe',
      description: 'Invalid description',
      instructions: 'Invalid instructions',
      prep_time: 0
    };
    const errorMessage = 'Recipe validation failed';
    let errorReceived = false;

    service.createMyRecipe(payload).subscribe(
      () => {},
      error => {
        errorReceived = true;
        expect(error.status).toBe(400);
      }
    );

    const req = httpMock.expectOne(`${apiBase}/recipes`);
    req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
  });

  it('should pass correct content-type header on create recipe', () => {
    const payload = {
      name: 'Test Recipe',
      description: 'Test description',
      instructions: 'Test instructions',
      prep_time: 15
    };

    service.createMyRecipe(payload).subscribe();

    const req = httpMock.expectOne(`${apiBase}/recipes`);
    expect(req.request.headers.get('Content-Type')).not.toBeNull();
    req.flush({});
  });

  it('should handle large payload on create recipe', () => {
    const payload = {
      name: 'Complex Recipe',
      description: 'A'.repeat(1000),
      ingredients: Array(50).fill('ingredient'),
      instructions: 'B'.repeat(500)
    };

    service.createMyRecipe(payload).subscribe();

    const req = httpMock.expectOne(`${apiBase}/recipes`);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload });
  });

  it('should construct correct search endpoint with different names', () => {
    const names = ['pasta', 'pizza', 'salad'];

    names.forEach(name => {
      service.searchExternal(name).subscribe();
      
      const req = httpMock.expectOne(request => 
        request.url.includes('/recipes/search') && request.url.includes(name)
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
