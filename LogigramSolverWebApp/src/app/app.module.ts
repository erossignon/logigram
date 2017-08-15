

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SquareComponent } from './square/square.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { CellComponent } from './cell/cell.component';

@NgModule({
  declarations: [
    AppComponent,
    SquareComponent,
    CellComponent,
  ],
  imports: [
    NgbModule.forRoot(),BrowserModule, FormsModule, CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
