import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  error: string | null = null;
  // create form
  newRecipeTitle = '';
  newRecipeId: number | null = null;
  showCreate = false;
  editing: any = null;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoritesService.listMyFavorites().subscribe({
      next: data => this.favorites = data || [],
      error: err => this.error = 'Não foi possível carregar favoritos'
    });
  }

  remove(id: number): void {
    this.favoritesService.deleteFavorite(id).subscribe({
      next: () => this.loadFavorites(),
      error: () => this.error = 'Falha ao remover favorito'
    });
  }

  create(): void {
    const payload = { recipeId: this.newRecipeId || 0, recipeTitle: this.newRecipeTitle };
    this.favoritesService.addFavorite(payload).subscribe({ next: () => { this.newRecipeTitle = ''; this.newRecipeId = null; this.loadFavorites(); }, error: () => this.error = 'Falha ao adicionar favorito' });
  }

  startEdit(f: any): void { this.editing = { ...f }; }
  saveEdit(): void {
    // no backend update endpoint; update local store directly
    const local = this.favoritesService as any;
    const stored = (local.local.get('favorites') || []).map((x: any) => x.id === this.editing.id ? this.editing : x);
    local.local.set('favorites', stored);
    this.loadFavorites();
    this.editing = null;
  }
  cancelEdit(): void { this.editing = null; }
}
