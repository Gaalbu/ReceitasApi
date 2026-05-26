import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RecipeComponent } from './components/recipe/recipe.component';
import { CreateRecipeComponent } from './components/create-recipe/create-recipe.component';
import { MealPlanComponent } from './components/meal-plan/meal-plan.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { UsersComponent } from './components/users/users.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { RatingsComponent } from './components/ratings/ratings.component';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RecipeComponent,
    CreateRecipeComponent,
    LoginComponent,
    RegisterComponent,
    MealPlanComponent,
    FeedbackComponent,
    NavbarComponent,
    UsersComponent,
    FavoritesComponent,
    RatingsComponent,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
