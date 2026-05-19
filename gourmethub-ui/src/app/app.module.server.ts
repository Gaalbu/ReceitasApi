import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { App } from './app';
import { serverRoutes } from './app.routes.server';
import { AppRoutingModule } from './app-routing-module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ServerModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [provideServerRendering(withRoutes(serverRoutes))],
  bootstrap: [App],
})
export class AppServerModule {}
