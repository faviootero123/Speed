import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpeedGameComponent } from './speed-game/speed-game.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
//import { FlexModule } from '@angular/flex-layout';
import { CardsComponent } from './cards/cards.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    SpeedGameComponent,
    CardsComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: SpeedGameComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'cards', component: CardsComponent },
      { path: 'speed-game', component: SpeedGameComponent },
    ]),
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule,
    //FlexModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
