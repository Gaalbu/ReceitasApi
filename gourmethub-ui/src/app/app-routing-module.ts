import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecipeComponent } from './components/recipe/recipe.component';
import { CreateRecipeComponent } from './components/create-recipe/create-recipe.component';
import { MealPlanComponent } from './components/meal-plan/meal-plan.component';
import { FeedbackComponent } from './components/feedback/feedback.component';

const routes: Routes = [
  { path: '', component: RecipeComponent },
  { path: 'create-recipe', component: CreateRecipeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'meal-plans', component: MealPlanComponent },
  { path: 'feedback', component: FeedbackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
