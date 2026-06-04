import { TestBed } from '@angular/core/testing';
import { LocalStoreService } from './local-store.service';

describe('LocalStoreService', () => {
  let service: LocalStoreService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [LocalStoreService]
    });

    service = TestBed.inject(LocalStoreService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should detect demo mode from prefixed storage key', () => {
    localStorage.setItem('receitasapi_demo_mode', '1');

    expect(service.isDemoMode()).toBe(true);
  });

  it('should get and set JSON values', () => {
    service.set('profile', { name: 'Usuario' });

    expect(service.get<{ name: string }>('profile')).toEqual({ name: 'Usuario' });
  });

  it('should return null when stored JSON is invalid', () => {
    localStorage.setItem('receitasapi_broken', '{invalid');

    expect(service.get('broken')).toBeNull();
  });

  it('should ignore storage errors when setting and removing', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => service.set('profile', { name: 'Usuario' })).not.toThrow();
    expect(() => service.remove('profile')).not.toThrow();

    expect(setSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });

  it('should generate deterministic ids from date and random', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(service.generateId()).toBe(501);
  });
});
