
import * as solver from "../index2";
// const solver = require("../index2");
import "mocha";
import "should"; 
//const pr = should;
//require("should");

describe("Logigram solver", function() {

    it("should create a solver", function() {

        const game = new solver.Logigram(3, 5);

        game.series[0].title = "Witness";
        game.series[0].seriesItems[0].name = "Alison";
        game.series[0].seriesItems[1].name = "Dougal";
        game.series[0].seriesItems[2].name = "Fred";
        game.series[0].seriesItems[3].name = "Gina";
        game.series[0].seriesItems[4].name = "Joseph";

        game.series[1].title = "Feature";
        game.series[1].seriesItems[0].name = "Black Hair";
        game.series[1].seriesItems[1].name = "Blue Eye";
        game.series[1].seriesItems[2].name = "Moustache";
        game.series[1].seriesItems[3].name = "Scar";
        game.series[1].seriesItems[4].name = "Tall";

        game.series[2].title = "Clothing";
        game.series[2].seriesItems[0].name = "Blue Cap";
        game.series[2].seriesItems[1].name = "Brown Scarf";
        game.series[2].seriesItems[2].name = "Grey Jacket";
        game.series[2].seriesItems[3].name = "Red Sweater";
        game.series[2].seriesItems[4].name = "Torn Jeans";


        // clue 1

        // neither fred nor the witness who noticed that the robber has a small
        // scar on the bridge of his nose had notice the color of its jacket
        game.setFalse({ Witness: "Fred" }, { Clothing: "Grey Jacket" });
        game.setFalse({ Feature: "Scar" }, { Clothing: "Grey Jacket" });
        game.setFalse({ Witness: "Fred" }, { Feature: "Scar" });


        // clue 2
        // Alison reported that the robber was very tall and Joseph noticed
        // that the man's hair was black.
        game.setTrue({ Witness: "Alison" }, { Feature: "Tall" });
        game.setTrue({ Witness: "Joseph" }, { Feature: "Black Hair" });

        // clue 3:
        // one of the witness noticed that the robber had piercing blue eyes and
        // wore a fader red sweater. This witness was standing between Dougal
        //ad Fred at the time of the robbery
        game.setTrue({ Clothing: "Red Sweater" }, { Feature: "Blue Eye" });
        game.setFalse({ Witness: "Fred" }, { Clothing: "Red Sweater" });
        game.setFalse({ Witness: "Dougal" }, { Clothing: "Red Sweater" });
        game.setFalse({ Witness: "Fred" }, { Feature: "Blue Eye" });
        game.setFalse({ Witness: "Dougal" }, { Feature: "Blue Eye" });

        // clue 4:
        // the witness who recalled that the robber had a moustache didn't mentionned
        // his cap or jeans. Nor did Alison recall the robber's jacket or his jeans
        game.setFalse({ Feature: "Moustache" }, { Clothing: "Blue Cap" });
        game.setFalse({ Feature: "Moustache" }, { Clothing: "Torn Jeans" });

        game.setFalse({ Witness: "Alison" }, { Clothing: "Grey Jacket" });
        game.setFalse({ Witness: "Alison" }, { Clothing: "Torn Jeans" });

        for (let i = 0; i < game.facts.length; i++) {
            game.printFact(game.facts[i]);
        }


        game.print();
        
        game.getCell(0, 0, 1, 0).getInfo().should.eql("n");

        game.getCell({ Witness: "Alison" }, { Feature: "Black Hair" }).getInfo().should.eql("n");
        game.getCell({ Witness: "Alison" }, { Feature: "Tall" }).getInfo().should.eql("Y");
        game.getCell({ Witness: "Alison" }, { Feature: "Black Hair" }).isTrue().should.eql(false);
        game.getCell({ Witness: "Alison" }, { Feature: "Tall" }).isTrue().should.eql(true);
        game.getCell({ Witness: "Alison" }, { Feature: "Black Hair" }).isFalse().should.eql(true);
        game.getCell({ Witness: "Alison" }, { Feature: "Tall" }).isFalse().should.eql(false);

        const r1 = game.getBandFromIndex(0,0,1);
        r1.countFalse().should.eql(4);
        r1.hasTrue().should.eql(true);
        
        const rr1 = game.getBand({Witness: "Alison"},"Feature");
        rr1.should.eql(r1);
        
        const rr2 = game.getBand({Clothing:"Blue Cap"},"Witness");
        rr2.countFalse().should.eql(0);
        rr2.hasTrue().should.eql(false);
        
        //xx console.log(rr2);
        
        console.log("-----------------------------------------------------")
        
        game.makeDeductions();
        game.makeDeductions();
        game.makeDeductions();
        game.makeDeductions();
        game.makeDeductions();
        
        //const r2 = game.getCol(0,0,1);
        
        game.print();

    });

    it("should provide a pivot cell",function() {
    
        const game = new solver.Logigram(3, 4);

        game.series[0].title = "T1";
        game.series[0].seriesItems[0].name = "A1";
        game.series[0].seriesItems[1].name = "B1";
        game.series[0].seriesItems[2].name = "C1";
        game.series[0].seriesItems[3].name = "D1";

        game.series[1].title = "T2";
        game.series[1].seriesItems[0].name = "A2";
        game.series[1].seriesItems[1].name = "B2";
        game.series[1].seriesItems[2].name = "C2";
        game.series[1].seriesItems[3].name = "D2";

        game.series[2].title = "T3";
        game.series[2].seriesItems[0].name = "A3";
        game.series[2].seriesItems[1].name = "B3";
        game.series[2].seriesItems[2].name = "C3";
        game.series[2].seriesItems[3].name = "D3";

        const c1 = game.getCell(0,0,1,1);
        //console.log([ ... game.squareIt()]);
        console.log([ ... game.othersIterator(c1)]);
        
        c1.getLongInfo().should.eql("0:0,1:1(.)");
        
        [ ... game.band(c1,c1.seriesIndex1)].map(x=>x.getLongInfo()).join(" ")
        .should.eql("0:0,2:0(.) 0:0,2:1(.) 0:0,2:2(.) 0:0,2:3(.)");
        
        [ ... game.band(c1,c1.seriesIndex1)].map(x=>game.orthogonalCell(c1,x).getLongInfo()).join(" ")
        .should.eql("1:1,2:0(.) 1:1,2:1(.) 1:1,2:2(.) 1:1,2:3(.)");
        
        const c2 = game.getCell(0,0,2,2);
        const c3 = game.getCell(1,1,2,2);
        game.orthogonalCell(c1,c2).should.eql(c3);
        
    });
    it("should provide a pivot cell on 4 dim Z",function() {
    
        const game = new solver.Logigram(4, 4);
    
        const c1 = game.getCell(0,3,2,1);

        c1.getLongInfo().should.eql("0:3,2:1(.)");
        
        console.log([ ... game.othersIterator(c1)]);

        [ ... game.band(c1,c1.seriesIndex1)].map(x=>x.getLongInfo()).join(" ")
        .should.eql("0:3,1:0(.) 0:3,1:1(.) 0:3,1:2(.) 0:3,1:3(.) 0:3,3:0(.) 0:3,3:1(.) 0:3,3:2(.) 0:3,3:3(.)");
        
        [ ... game.band(c1,c1.seriesIndex1)].map(x=>game.orthogonalCell(c1,x).getLongInfo()).join(" ")
        .should.eql("1:0,2:1(.) 1:1,2:1(.) 1:2,2:1(.) 1:3,2:1(.) 2:1,3:0(.) 2:1,3:1(.) 2:1,3:2(.) 2:1,3:3(.)");
     
    });
    
    it("should provide a way to access squares by row for ui - return same object",function() {
        
        const game: solver.Logigram = new solver.Logigram(4,5);
        
        game.getSquareRowCount().should.eql(3);
        
        const squareRow0 = game.getSquareRow(0);
        squareRow0.length.should.eql(3);
        
        squareRow0[0].seriesIndex1.should.eql(0);
        squareRow0[1].seriesIndex1.should.eql(0);
        squareRow0[2].seriesIndex1.should.eql(0);
        
        squareRow0[0].seriesIndex2.should.eql(1);
        squareRow0[1].seriesIndex2.should.eql(2);
        squareRow0[2].seriesIndex2.should.eql(3);
        
        
        const squareRow1 = game.getSquareRow(1);
        squareRow1.length.should.eql(2);
        squareRow1[0].seriesIndex1.should.eql(1);
        squareRow1[1].seriesIndex1.should.eql(2);
        squareRow1[0].seriesIndex2.should.eql(3);
        squareRow1[1].seriesIndex2.should.eql(3);

        const squareRow2 = game.getSquareRow(2);
        squareRow2.length.should.eql(1);
        squareRow2[0].seriesIndex1.should.eql(1);
        squareRow2[0].seriesIndex2.should.eql(2);
        
        squareRow2[0].toto = "1";
        game.getSquareRow(2)[0].toto.should.eql("1","It should always bring the same object");
    
        squareRow2.tata = "1";
        game.getSquareRow(2).tata.should.eql("1","It should always bring the same object");
        
        
    });
});