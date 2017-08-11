// tsc index2.ts -t es5 --downlevelIteration --lib DOM.Iterable,ES2015.Core,ES2015
//import { assert } from "assert";
//import assert = require("assert");
//import * as  assert from "assert";
function assert(cond: any, message?: string) {
    
}
/**
 * @class SeriesItem  
 */
class SeriesItem {
    name: string;
    constructor() {
        this.name = "";
    }
}

export class LogigramSeries {
    title: string;
    seriesItems: Array<SeriesItem>;
    index: number;
    constructor(dimension: number) {
        this.title = "";
        this.seriesItems = new Array(dimension);
        for (let i=0;i<dimension;i++) { 
            this.seriesItems[i] = new SeriesItem(); 
        }
        this.index = -1;
    }
    
    getSeriesItemIndexByName(name: string): number {
        return this.seriesItems.findIndex(n => n.name === name);
    }
}

export class LogigramCell {

    seriesIndex1: number;
    index1: number;
    seriesIndex2: number;
    index2: number;
    fact: any;
    deduction: any;
    
    constructor(seriesIndex1: number,  i1:number,  seriesIndex2:number,  i2: number) {
        this.seriesIndex1 = seriesIndex1;
        this.index1 = i1;
        this.seriesIndex2 = seriesIndex2;
        this.index2 = i2;
        this.fact = null;
        this.deduction = null;
    }
    hasFact() : boolean {
        return this.fact !== null;
    }

    setFact(factType: any, clue: any) :void {
        this.fact = factType;
    }

    setDeduction(factType: any):void {
        this.deduction = factType;
    }

    getInfo() :string{
        if (!this.fact) {
            return this.deduction ? this.deduction : ".";
        }
        return this.fact === "True" ? "Y" : "N";
    }

    isUnknown(): boolean {
        return !this.fact && !this.deduction;
    }

    isTrue() : boolean {
        return this.getInfo().toUpperCase() === "Y";
    }

    isFalse(): boolean {
        return this.getInfo().toUpperCase() === "N";
    }
    
    getKey():string {
        return "" +this.seriesIndex1 + ":" + this.index1 + "," + this.seriesIndex2 + ":" + this.index2 ;
    }

    getLongInfo():string {
        return this.getKey()+"(" + this.getInfo() + ")";
    }

}
class LogigramRow {

    row: Array<LogigramCell>;
    
    constructor(row: LogigramCell[]) {
        this.row = row;
    }

    hasTrue(): boolean {
        return this.row.filter(x => x.isTrue()).length >= 1;
    }
    countFalse(): number {
        return this.row.reduce((c, x) => c += x.isFalse() ? 1 : 0, 0);
    }
    unknownCells(): LogigramCell[] {
        return this.row.filter(x=>x.isUnknown());
    }
}

class Square {
    seriesIndex1: number;
    seriesIndex2: number;
    constructor(seriesIndex1: number, seriesIndex2: number) {
        assert(seriesIndex1 < seriesIndex2);
        this.seriesIndex1 = seriesIndex1;
        this.seriesIndex2 = seriesIndex2;
    }
}

interface HalfFact { [id: string]: string };

export class Logigram {
    
    series: Array<LogigramSeries>;
    facts: any;
    cells: { [id: string]: LogigramCell };
    
    constructor(nbSeries: number, dimension:number) {

        this.series = new Array(nbSeries);
        for (let i:number = 0; i < nbSeries; i++) {
            this.series[i] = new LogigramSeries(dimension);
            this.series[i].index = i;
        }
        this.facts = [];
        this.cells = {};
    }

    getSeriesByName(title: string) {
        return this.series.filter(s => s.title === title)[0];
    }
    getSeriesIndex(title: string) {
        const series = this.getSeriesByName(title);
        if (!series) {
            throw new Error("Cannot find series with name : " + title);
        }
        assert(series.index>=0,"invalid series index" );
        return series.index;
    }
    /**
     * @param halfFact {Object} 
     */
    findHalfFact(halfFact: HalfFact) {

        const title = Object.keys(halfFact)[0] as string;
        const name:any = halfFact[title];
        const series = this.getSeriesByName(title);
        if (!series) {
            throw new Error("Cannot find series with name " + title);
        }
        const index = series.getSeriesItemIndexByName(name);
        if (index <0) {
            console.log("series = ",series);
            throw new Error("findHalfFact cannot find series item with name "+ name);
        }
        return {
            series: series,
            index: index
        };
    }
    setFalse(halfFact1:HalfFact, halfFact2:HalfFact):void {
        this.setFact("False", halfFact1, halfFact2);
    }
    setTrue(halfFact1:HalfFact, halfFact2:HalfFact):void {
        this.setFact("True", halfFact1, halfFact2);
    }
    getDimension():number {
        return this.series[0].seriesItems.length;
    }
    
    setCellFact(factType:string ,cell: LogigramCell,fact: any) {
        
        if (!cell.isUnknown()) {
            throw new Error("cell must be 'unknown' but is " + cell.getInfo() + " c " + cell.getLongInfo());
        }
        
        cell.setFact(factType, fact);

        if (factType === "True") {
            const dim = this.getDimension();
            // make deduction on same columms, rows
            for (let r = 0; r < dim; r++) {

                const tmpCell = this.getCell(cell.seriesIndex1, r, cell.seriesIndex2, cell.index2);
                if (!tmpCell.hasFact()) {
                    tmpCell.setDeduction("n");
                }
            }
            for (let c = 0; c < dim; c++) {
                const tmpCell = this.getCell(cell.seriesIndex1, cell.index1, cell.seriesIndex2, c);
                if (!tmpCell.hasFact()) {
                    tmpCell.setDeduction("n");
                }
            }
        }        
    }
    setFact(factType:string, halfFact1: HalfFact, halfFact2: HalfFact) {
        let c1 = this.findHalfFact(halfFact1);
        let c2 = this.findHalfFact(halfFact2);
        if (c1.series.index === c2.series.index) {
            throw new Error("Incoherent fact");
        }
        // swap c1 and c2 if necesseray
        if (c1.series.index > c2.series.index) {
            let tmp = c1;
            c1 = c2;
            c2 = tmp;
        }

        const fact = { fact: factType, c1: c1, c2: c2 };
    
        this.facts.push(fact);

        const cell = this.getCell(c1.series.index, c1.index, c2.series.index, c2.index);
        
        this.setCellFact(factType,cell,fact);

        //        this.addFact({})
    }

    getCell(halfFact1: object,halfFact2: object): LogigramCell;
    getCell(seriesIndex1:number, index1:number, seriesIndex2:number, index2:number): LogigramCell;
    
    getCell(seriesIndex1:any, index1:any, seriesIndex2?:number, index2?:number): LogigramCell {
        
        if (arguments.length === 2) {
            const halfFact1 = seriesIndex1;
            const halfFact2 = index1;
            const cell1 = this.findHalfFact(halfFact1);
            const cell2 = this.findHalfFact(halfFact2);
            return this.getCell(cell1.series.index, cell1.index, cell2.series.index, cell2.index);
        }
        if (seriesIndex1 === seriesIndex2) {
            throw new Error("Invalid series index specified seriesIndex1 = " + seriesIndex1 + " seriesIndex2 " + seriesIndex2);
        }
        if (seriesIndex1 > seriesIndex2) {
            return this.getCell(seriesIndex2, index2, seriesIndex1, index1);
        }
        const key = "" + seriesIndex1 + ":" + index1 + "|" + seriesIndex2 + ":" + index2;
        let cell = this.cells[key];
        if (!cell) {
            cell = new LogigramCell(seriesIndex1, index1, seriesIndex2, index2);
            this.cells[key] = cell;
        }
        return cell;
    }

    printFact(fact: any):void {
        console.log(fact.fact, ":",
            fact.c1.series.title, "-", fact.c1.series.seriesItems[fact.c1.index].name, " ==> ",
            fact.c2.series.title, "-", fact.c2.series.seriesItems[fact.c2.index].name);
    }

    getBandFromIndex(seriesIndex1:number, index1:number, seriesIndex2:number): LogigramRow {
        const row = [];
        for (let i = 0; i < this.getDimension(); i++) {
            row.push(this.getCell(seriesIndex1, index1, seriesIndex2, i));
        }
        return new LogigramRow(row);
    }

    getBand(halfFact: HalfFact, seriesTitle:string ): LogigramRow {
        const h = this.findHalfFact(halfFact);
        
        const seriesIndex2 = this.getSeriesIndex(seriesTitle);
        return this.getBandFromIndex(h.series.index, h.index, seriesIndex2);
    }

    makeDeductionOnColumns():void {

        const dim = this.getDimension();

        for (let s1 = 0; s1 < this.series.length; s1++) {

            for (let s2 = s1 + 1; s2 < this.series.length; s2++) {

                for (let c = 0; c < dim; c++) {

                    const band = this.getBandFromIndex(s1, c, s2);

                    if (band.hasTrue()) {
                        continue;
                    }
                    const nbFalse = band.countFalse();
                    if (nbFalse === dim - 1) {
                        console.log("We can set a Y");
                        const freeCell = band.unknownCells()[0];
                        
                        this.setCellFact("True",freeCell,{});
                        
                        //this.setTrue();
                    }
                }
            }
        }
    }

    *othersIterator(cell: LogigramCell): IterableIterator<Square> {
        function checkIsIn(v: number,ar: Array<number>) {
            return ar.indexOf(v) >=0;
        }
        //xx console.log("cell ",cell);
        const indexes = [cell.seriesIndex1, cell.seriesIndex2];
        //xx console.log("indexes = ",indexes);
        for (let sq of this.squareIterator()) {
            if (checkIsIn(sq.seriesIndex1,indexes) && !checkIsIn(sq.seriesIndex2,indexes)) {
                //xx console.log("$",sq.seriesIndex1," !",sq.seriesIndex2);
                yield sq;
            }
            if (!checkIsIn(sq.seriesIndex1,indexes) && checkIsIn(sq.seriesIndex2,indexes)) {
                //xx console.log("!",sq.seriesIndex1," $",sq.seriesIndex2);
                yield sq;
            }
        }
    }
    // return a collection of cells that belongs to other neighbouring 
    // square of the given cell
    //         1              2              3
    // |---------------|---------------|---------------|
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // | x  x  x  x  O | A  B  C  D  E | F  G  H  I  J |
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |   0 (refSeriesIndex)
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // |---------------|---------------|---------------|
    // | .  .  .  .  A'| .  .  .  .  . |
    // | .  .  .  .  B'| .  .  .  .  . |
    // | .  .  .  .  C'| .  .  .  .  . |  3
    // | .  .  .  .  D'| .  .  .  .  . |
    // | .  .  .  .  E'| .  .  .  .  . |
    // |---------------|---------------|
    // | .  .  .  .  F'|
    // | .  .  .  .  G'|
    // | .  .  .  .  H'|    2
    // | .  .  .  .  I'|
    // | .  .  .  .  J'|
    // |---------------|
    * band(cell: LogigramCell, refSeriesIndex: number): IterableIterator<LogigramCell> {

            const dim = this.getDimension();

            const si1    = ((cell.seriesIndex1 === refSeriesIndex) ? cell.seriesIndex1 : cell.seriesIndex2);
            const i1     = ((cell.seriesIndex1 === refSeriesIndex) ? cell.index1 : cell.index2);

            for (let sq of this.othersIterator(cell)) {
                
                if (sq.seriesIndex1 !== refSeriesIndex && sq.seriesIndex2 !== refSeriesIndex) {
                    continue;
                }
                const si2 = (sq.seriesIndex1 === refSeriesIndex) ? sq.seriesIndex2 : sq.seriesIndex1;
                for (let i2 = 0; i2 < dim; i2++) {
                    yield this.getCell(si1, i1, si2, i2);
                }
            }
        }


    *cellIterator(): IterableIterator<LogigramCell> {
        const dim = this.getDimension();
        for (let sq of this.squareIterator()) {
            for (let r = 0; r < dim; r++) {
                for (let c = 0; c < dim; c++) {
                    yield this.getCell(sq.seriesIndex1, r, sq.seriesIndex2, c);
                }
            }
        }
    }

    // iterator through the yes cells
    *yesCellIterator(): IterableIterator<LogigramCell> {
        for (let c of this.cellIterator()) {
            if (c.isTrue()) yield c;
        }
        // [ ... this.cellIterator()].filter(x=> x.isTrue());
    }


    /*
    //         1              2              3
    // |---------------|---------------|---------------|
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // | x  x  x  x  O | A  B  C  D  E | F  G  H  I  J |
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |   0 (refSeriesIndex)
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // | .  .  .  .  . | .  .  .  .  . | .  .  .  .  . |
    // |---------------|---------------|---------------|
    // | .  .  .  .  F'| .  .  .  .  . |
    // | .  .  .  .  G'| .  .  .  .  . |
    // | .  .  .  .  H'| .  .  .  .  . |  3
    // | .  .  .  .  I'| .  .  .  .  . |
    // | .  .  .  .  J'| .  .  .  .  . |
    // |---------------|---------------|
    // | .  .  .  .  A'|
    // | .  .  .  .  B'|
    // | .  .  .  .  C'|    2
    // | .  .  .  .  D'|
    // | .  .  .  .  E'|
    // |---------------|
    //               pivot([a:x,b:y],[c:y,a:u]) => [c:y, b: ])
    // pivot(P,D) => pivot([a:x,b:y],[c:y,a:u]) => [c:y, b: ])

    //                      A:X B:Y   A:X C:U       B:Y,C:U
    // pivot(P,D) => pivot([0:1,1:4],[0:1,2:3]) => [1:4,2:3])
    // 
    //         1              2              3
    // |---------------|---------------|---------------|
    // | .  .  .  A  . | .  .  .  A  . | .  .  .  .  . |
    // | .  .  .  B  . | .  .  .  B  . | .     .  .  . |
    // | .  .  .  C  . | .  .  .  C  . | .     .  .  . |   0
    // | .  .  .  D  . | .  .  .  D  . | .     .  .  . |
    // | .  .  .  E  . | .  .  .  E  . | .    .  .   . |
    // |---------------|---------------|---------------|
    // | .  .  .  F  . | .  .  .  F  . |
    // | .  .  .  G  . | .  .  .  G  . |
    // | .  .  .  H  . | .  .  .  H  . |  3
    // | .  .  .  I  . | .  .  .  I  . |
    // | .  .  .  J  . | .  .  .  J  . |
    // |---------------|---------------|
    // | .  .  .  .  . |
    // | .  .  .  P  . |
    // | .  .  .  .  . |    2 
    // | .  .  .  .  . |
    // | .  .  .  .  . |
    // |---------------|
    //
    //         1              2              3
    // |---------------|---------------|---------------|
    // | .  .  .     . | .  .  A     . | .  A  .  .  . |
    // | .  .  .     . | .  .  B     . | .  B  .  .  . |
    // | .  .  .     . | .  .  C     . | .  C  .  .  . |   0
    // | .  .  .     . | .  .  D     . | .  D  .  .  . |
    // | .  .  .     . | .  .  E     . | .  E .  .   . |
    // |---------------|---------------|---------------|
    // | .  .  .     . | .  .  .     . |
    // | G  H  I  J  H | .  .  P     . |
    // | .  .  .     . | .  .  .     . |  3
    // | .  .  .     . | .  .  .     . |
    // | .  .  .     . | .  .  .     . |
    // |---------------|---------------|
    // | .  .  .  .  . |
    // | .  .  .     . |
    // | G. H. I .J  H |    2 
    // | .  .  .  .  . |
    // | .  .  .  .  . |
    // |---------------|
    //               pivot([a:x,b:y],[c:y,a:u]) => [c:y, b: ])
    // pivot(P,D) => pivot([a:x,b:y],[c:y,a:u]) => [c:y, b: ])

    // pivot(P,D) => pivot([2:2,3:1],[0:3,2:2]) => [3:1, 0:3 ])
  */
    orthogonalCell(pivotCell: LogigramCell, cell: LogigramCell) {

        //xx console.log("Ortjo ",pivotCell.getLongInfo(),cell.getLongInfo());
            if (pivotCell.seriesIndex1 === cell.seriesIndex1 && pivotCell.index1 === cell.index1) {
            //xx console.log("ss",pivotCell.seriesIndex2, pivotCell.index2, cell.seriesIndex2, cell.index2);
            return this.getCell(pivotCell.seriesIndex2, pivotCell.index2, cell.seriesIndex2, cell.index2);

        }
        else if (pivotCell.seriesIndex1 === cell.seriesIndex2 && pivotCell.index1 === cell.index2) {
            return this.getCell(pivotCell.seriesIndex2, pivotCell.index2, cell.seriesIndex1, cell.index1);

        }
        else if (pivotCell.seriesIndex2 === cell.seriesIndex1 && pivotCell.index2 === cell.index1) {
            return this.getCell(pivotCell.seriesIndex1, pivotCell.index1, cell.seriesIndex2, cell.index2);
        }
        else if (pivotCell.seriesIndex2 === cell.seriesIndex2 && pivotCell.index2 === cell.index2) {
            return this.getCell(pivotCell.seriesIndex1, pivotCell.index1, cell.seriesIndex1, cell.index1);
        }
        else {
            throw new Error("Incoherent case " + pivotCell.getLongInfo() + " " + cell.getLongInfo());
        }
    }

    makeDeductions(): void {
        const self = this;


        function doPivoting(yesCell: LogigramCell,fixSeriesIndex: number) {
            
            for (let cell of self.band(yesCell, fixSeriesIndex)) {
            
                const orthoCell = self.orthogonalCell(yesCell, cell);
            
                if (cell.isFalse() && orthoCell.isUnknown()) {
                    orthoCell.setDeduction("n");
                }
                if (orthoCell.isFalse() && cell.isUnknown()) {
                    cell.setDeduction("n");
                }
            }
        }
        // do pivoting
        // for all yes ... find no'es on other band
        for (let yesCell of this.yesCellIterator()) {
            doPivoting(yesCell,yesCell.seriesIndex1);
            doPivoting(yesCell,yesCell.seriesIndex2);
        }
        // any row/col with 4 n will have a Y in the remaining cell
        this.makeDeductionOnColumns();
    }
    
    getSquareRowCount() : number {
        return this.series.length - 1;
    }
    private _squareRow: Array<Array<Square>>;
    
    *squareIterator() {
        for (let s1 = 0; s1 < this.series.length; s1++) {
            for (let s2 = s1 + 1; s2 < this.series.length; s2++) {
                yield this.getSquare(s1,s2);
            }
        }
    }

    private __squares: Array<Square>;
    private computeSquareKey(s1:number,s2:number): number {
        return s1 * this.series.length + s2;
    }
    private _buildSquares(): void {
        this.__squares = new Array();
        for (let s1 = 0; s1 < this.series.length; s1++) {
            for (let s2 = s1 + 1; s2 < this.series.length; s2++) {
                const key = this.computeSquareKey(s1,s2);
                this.__squares[key] = new Square(s1,s2);
            }        
        }
    }
    getSquare(seriesIndex1: number, seriesIndex2: number): Square {
        if (seriesIndex1>seriesIndex2)  {
            return this.getSquare(seriesIndex2,seriesIndex1);
        }
        assert(seriesIndex1 !== seriesIndex2);
        if (!this.__squares) {
            this._buildSquares();
        }
        return this.__squares[this.computeSquareKey(seriesIndex1,seriesIndex2)];
    }
    
    getSquareRow(rowIndex: number): Array<Square> {
        if (!this._squareRow) {
         
            this._squareRow = new Array(this.getSquareRowCount());

            const n = this.series.length;

            for (let i =0; i< n -1; i++) {
                const seriesIndex1 = (n -i )%n; // 0 3 2 
                const row = [];
                for (let j =1; j< n-i; j++) {
                    const seriesIndex2 = j;
                    row.push(this.getSquare(seriesIndex1,seriesIndex2));
                }
                this._squareRow[i] = row;
            }
        }
        return this._squareRow[rowIndex];
    
    }
    
    print() {
        
        const dim = this.getDimension();
        
        function w(str:string, l:number) {
            return (str + "                  ").substr(0, l);
        }

        let line = "";
        
        for (let l = 0; l < 10; l++) {
            line = "";
            line += w(" ", 10) + "|";
            for (let z = 1; z < this.series.length; z++) {
                const series = this.series[z];
                for (let c = 0; c < dim; c++) {
                    line += " " + w(series.seriesItems[c].name, 10).substr(l, 1) + " ";
                }
                line += "|";
            }
            console.log(line);
        }

        function write_horizontal_sep(n:number) {
            let line;
            line = "";
            line += w(" ", 10) + "|";
            for (let z = 0; z < n; z++) {
                for (let c = 0; c < dim; c++) {
                    line += "---"; // + w(series.seriesItems[c].name,10).substr(l,1) + " ";
                }
                line += "|";
            }
            console.log(line);
        }
        write_horizontal_sep(this.series.length - 1);

        let rr = this.series.length + 1;

        for (let s = 0; s < this.series.length - 1; s++) {

            rr -= 1;
            const r = rr % this.series.length;
            const seriesRow = this.series[r];

            for (let l = 0; l < dim; l++) {
                let line = "";
                line += w(seriesRow.seriesItems[l].name, 10);
                line += "|";

                for (let w = s + 1; w < this.series.length; w++) {
                    const seriesCol = this.series[w];
                    for (let c = 0; c < dim; c++) {
                        const cell = this.getCell(s, l, w, c);
                        // line += ""+s + cell.getInfo() + "" + w;
                        line += " " + cell.getInfo() + " ";
                    }
                    line += "|";
                }
                console.log(line);

            }
            write_horizontal_sep(this.series.length - 1 - s);
        }
    }
}
