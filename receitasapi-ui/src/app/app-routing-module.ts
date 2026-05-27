import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecipeComponent } from './components/recipe/recipe.component';
import { CreateRecipeComponent } from './components/create-recipe/create-recipe.component';
import { MealPlanComponent } from './components/meal-plan/meal-plan.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { UsersComponent } from './components/users/users.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { RatingsComponent } from './components/ratings/ratings.component';
import { RecipeManagerComponent } from './components/recipe-manager/recipe-manager.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  // Rotas públicas (não requerem autenticação)
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  
  // Rotas protegidas (requerem autenticação)
  { path: '', component: RecipeComponent, canActivate: [AuthGuard] },
  { path: 'my-recipes', component: RecipeManagerComponent, canActivate: [AuthGuard] },
  { path: 'create-recipe', component: CreateRecipeComponent, canActivate: [AuthGuard] },
  { path: 'meal-plans', component: MealPlanComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'ratings', component: RatingsComponent, canActivate: [AuthGuard] },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
