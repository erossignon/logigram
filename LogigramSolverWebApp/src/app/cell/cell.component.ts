import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css']
})
export class CellComponent implements OnInit {

  @Input() cell: any;
  @Input() logigram: any;

  constructor() { }

  ngOnInit() {
    if(!this.cell) {
      throw new Error("invalid cell");
    }
  }

  clickOn(choice) {
        
    const cell= this.cell;
    const logigram = this.logigram;
    const hf1 =logigram.makeHalfFact(cell.seriesIndex1,cell.index1);
    const hf2 =logigram.makeHalfFact(cell.seriesIndex2,cell.index2);

    if (choice === "True") {
      logigram.setTrue(hf1,hf2);
    } else {
      logigram.setFalse(hf1,hf2);
    }
    
  }

}
