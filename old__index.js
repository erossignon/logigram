"use strict";
const assert = require("assert");

class LogigramSeries {

    constructor(dimension) {
        this.title = "";
        this.names = new Array(dimension);
    }
    getIndex(name) {
        return this.names.findIndex(n => n === name);
    }
}

class LogigramCell {

    constructor(seriesIndex1, i1, seriesIndex2, i2) {
        this.seriesIndex1 = seriesIndex1;
        this.index1 = i1;
        this.seriesIndex2 = seriesIndex2;
        this.index2 = i2;
        this.fact = null;
        this.deduction = null;
    }
    hasFact() {
        return this.fact !== null;
    }
    setFact(factType, clue) {
        this.fact = factType;
    }
    setDeduction(factType) {
        this.deduction = factType;
    }
    getInfo() {
        if (!this.fact) {
            return this.deduction ? this.deduction : ".";
        }
        return this.fact === "True" ? "Y" : "N";
    }
    isUnknown() {
        return !this.fact && !this.deduction;
    }
    isTrue() {
        return this.getInfo().toUpperCase() === "Y";
    }
    isFalse() {
        return this.getInfo().toUpperCase() === "N";
    }
    
    getKey() {
        return "" +this.seriesIndex1 + ":" + this.index1 + "," + this.seriesIndex2 + ":" + this.index2 ;
    }
    getLongInfo() {
        return this.getKey()+"(" + this.getInfo() + ")";
    }

}
class LogigramRow {
    constructor(row) {
        this.row = row;
    }
    hasTrue() {
        return this.row.filter(x => x.isTrue()).length >= 1;
    }
    countFalse() {
        return this.row.reduce((c, x) => c += x.isFalse() ? 1 : 0, 0);
    }
    unknownCells() {
        return this.row.filter(x=>x.isUnknown());
    }
}
class Square {
    constructor(seriesIndex1, seriesIndex2) {
        assert(seriesIndex1 < seriesIndex2);
        this.seriesIndex1 = seriesIndex1;
        this.seriesIndex2 = seriesIndex2;
    }
}


class Logigram {
    constructor(nbSeries, dimension) {

        this.series = new Array(nbSeries);
        for (let i = 0; i < nbSeries; i++) {
            this.series[i] = new LogigramSeries(dimension);
            this.series[i].index = i;
        }
        this.facts = [];
        this.cells = {};
    }

    getSeriesByName(title) {
        return this.series.filter(s => s.title === title)[0];
    }
    getSeriesIndex(title) {
        const series = this.getSeriesByName(title);
        if (!series) {
            throw new Error("Cannot find series with name : " + title);
        }
        return series.index;
    }
    /**
     * @param halfFact {Object} 
     */
    findHalfFact(halfFact) {

        const title = Object.keys(halfFact)[0];
        const name = halfFact[title];
        const series = this.getSeriesByName(title);
        if (!series) {
            throw new Error("Cannot find series with name " + title);
        }
        const index = series.getIndex(name);

        return {
            series: series,
            index: index
        };
    }
    setFalse(halfFact1, halfFact2) {
        this.setFact("False", halfFact1, halfFact2);
    }
    setTrue(halfFact1, halfFact2) {
        this.setFact("True", halfFact1, halfFact2);
    }
    getDimension() {
        return this.series[0].names.length;
    }
    
    setCellFact(factType,cell,fact) {
        
        assert(cell.isUnknown());
        
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
    setFact(factType, halfFact1, halfFact2) {
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

    getCell(seriesIndex1, index1, seriesIndex2, index2) {
        if (arguments.length === 2) {
            console.log(arguments);
            const cell1 = this.findHalfFact(arguments[0]);
            const cell2 = this.findHalfFact(arguments[1]);
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

    printFact(fact) {
        console.log(fact.fact, ":",
            fact.c1.series.title, "-", fact.c1.series.names[fact.c1.index], " ==> ",
            fact.c2.series.title, "-", fact.c2.series.names[fact.c2.index]);
    }

    getBandFromIndex(seriesIndex1, index1, seriesIndex2) {
        const row = [];
        for (let i = 0; i < this.getDimension(); i++) {
            row.push(this.getCell(seriesIndex1, index1, seriesIndex2, i));
        }
        return new LogigramRow(row);
    }

    getBand(halfFact, seriesTitle) {
        const h = this.findHalfFact(halfFact);
        const seriesIndex2 = this.getSeriesIndex(seriesTitle);
        return this.getBandFromIndex(h.series.index, h.index, seriesIndex2);
    }

    makeDeductionOnColumns() {

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

    * othersIterator(cell) {
        function checkIsIn(v,ar) {
            return ar.indexOf(v) >=0;
        }
        //xx console.log("cell ",cell);
        const indexes = [cell.seriesIndex1, cell.seriesIndex2];
        //xx console.log("indexes = ",indexes);
        for (let sq of this.squareIt()) {
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
    * band(cell, refSeriesIndex) {

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

    * squareIt() {
            for (let s1 = 0; s1 < this.series.length; s1++) {
                for (let s2 = s1 + 1; s2 < this.series.length; s2++) {
                    yield new Square(s1, s2);
                }
            }
    }

    * cellIt() {
        const dim = this.getDimension();
        for (let sq of this.squareIt()) {
            for (let r = 0; r < dim; r++) {
                for (let c = 0; c < dim; c++) {
                    yield this.getCell(sq.seriesIndex1, r, sq.seriesIndex2, c);
                }
            }
        }
    }

    // iterator through the yes cells
    * yes() {
        for (let c of this.cellIt()) {
            if (c.isTrue()) yield c;
        }
        // [ ... this.cellIt()].filter(x=> x.isTrue());
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
    orthogonalCell(pivotCell, cell) {

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

    makeDeductions() {
        const self = this;


        function doPivoting(yesCell,fixSeriesIndex) {
            
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
        for (let yesCell of this.yes()) {
            doPivoting(yesCell,yesCell.seriesIndex1);
            doPivoting(yesCell,yesCell.seriesIndex2);
        }
        // any row/col with 4 n will have a Y in the remaining cell
        this.makeDeductionOnColumns();
    }
    print() {
        const dim = this.series[0].names.length;

        function w(str, l) {
            return (str + "                  ").substr(0, l);
        }

        let line = "";
        for (let l = 0; l < 10; l++) {
            line = "";
            line += w(" ", 10) + "|";
            for (let z = 1; z < this.series.length; z++) {
                const series = this.series[z];
                for (let c = 0; c < dim; c++) {
                    line += " " + w(series.names[c], 10).substr(l, 1) + " ";
                }
                line += "|";
            }
            console.log(line);
        }

        function write_horizontal_sep(n) {
            let line;
            line = "";
            line += w(" ", 10) + "|";
            for (let z = 0; z < n; z++) {
                for (let c = 0; c < dim; c++) {
                    line += "---"; // + w(series.names[c],10).substr(l,1) + " ";
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
                line += w(seriesRow.names[l], 10);
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

module.exports = {
    Logigram: Logigram
};
