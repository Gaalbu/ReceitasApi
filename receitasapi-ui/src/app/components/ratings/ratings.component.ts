import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RatingsService } from '../../services/ratings.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ratings.component.html'
})
export class RatingsComponent implements OnInit {
  ratings: any[] = [];
  error: string | null = null;

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.ratingsService.myRatings().subscribe({
      next: data => this.ratings = data || [],
      error: () => this.error = 'Não foi possível carregar avaliações'
    });
  }
}
