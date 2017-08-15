import { Component, Input, OnInit } from '@angular/core';
import { Logigram,LogigramCell } from '../../../../LogigramSolver/index2';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.css']
})
export class SquareComponent implements OnInit {

  @Input() square: any ;
  @Input() logigram: any;
  @Input() showVerticalTitles: boolean = false;
  @Input() showHorizontalTitles: boolean = false;
  
  getDimension() {
    return this.logigram.getDimension();
  }
  constructor() {
    
  }
  ngOnInit() {
      if (this.square.seriesIndex1 === 0) {
        this.showVerticalTitles = true;
      }
      if (this.square.seriesIndex2 === 1 || this.square.seriesIndex1 === 1) {
        this.showHorizontalTitles = true;
      }
  }
  getCell(i:number,j:number): LogigramCell {
    const square = this.square;
    return this.logigram.getCell(square.seriesIndex1,i,square.seriesIndex2,j);
  }
  
  clickOn(i,j) {


    const logigram = this.logigram;
    const square = this.square;
    
    const hf1 =logigram.makeHalfFact(square.seriesIndex1,i);
    const hf2 =logigram.makeHalfFact(square.seriesIndex2,j);

    logigram.setTrue(hf1,hf2);
    
  }

}
