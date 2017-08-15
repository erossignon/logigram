import { Component } from '@angular/core';

import { Logigram } from '../../../LogigramSolver/index2';
import { NgModel }  from '@angular/forms';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  logigram = new Logigram(4,5);
  
  tableRows = [];
  _squareRows = null;
  
  constructor() {
  
     this.logigram.series[0].title = "Witness";
     this.logigram.series[0].seriesItems[0].name = "Alan";    
     this.logigram.series[0].seriesItems[1].name = "Bianca";
  
    this.tableRows = [
       { row: [{},{}] }, 
       { row: [{},{}] }
     ] ;
    
  }
  
  squareRows() {
    
    if(this._squareRows) {
      return this._squareRows;
    }
    
    this._squareRows=[];
    for (let i =0; i< this.logigram.getSquareRowCount(); i++) {
        this._squareRows.push( this.logigram.getSquareRow(i));
    }
    return this._squareRows;
  }
  
  squareCols(row: number) {
    return this.logigram.getSquareRow(row);
  }
  
  sRows(square) {
    
    const dim = this.logigram.getDimension();
    
    for (let r =0; r<dim;r++) {
      for (let c =0; c<dim;c++) {
        
      }
    }
  }
  
}


