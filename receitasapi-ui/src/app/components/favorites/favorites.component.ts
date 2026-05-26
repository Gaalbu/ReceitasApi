import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  error: string | null = null;

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
}
