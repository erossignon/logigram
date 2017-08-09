const solver = require("../index");
require("should");

describe("Logigram solver", function() {


    
    it("should create a solver", function() {

        const game = new solver.Logigram(3, 5);

        game.series[0].title = "Witness";
        game.series[0].names[0] = "Alison";
        game.series[0].names[1] = "Dougal";
        game.series[0].names[2] = "Fred";
        game.series[0].names[3] = "Gina";
        game.series[0].names[4] = "Joseph";

        game.series[1].title = "Feature";
        game.series[1].names[0] = "Black Hair";
        game.series[1].names[1] = "Blue Eye";
        game.series[1].names[2] = "Moustache";
        game.series[1].names[3] = "Scar";
        game.series[1].names[4] = "Tall";

        game.series[2].title = "Clothing";
        game.series[2].names[0] = "Blue Cap";
        game.series[2].names[1] = "Brown Scarf";
        game.series[2].names[2] = "Grey Jacket";
        game.series[2].names[3] = "Red Sweater";
        game.series[2].names[4] = "Torn Jeans";


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
        game.setFalse({ Witness: "Double" }, { Clothing: "Red Sweater" });
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
        game.series[0].names[0] = "A1";
        game.series[0].names[1] = "B1";
        game.series[0].names[2] = "C1";
        game.series[0].names[3] = "D1";

        game.series[1].title = "T2";
        game.series[1].names[0] = "A2";
        game.series[1].names[1] = "B2";
        game.series[1].names[2] = "C2";
        game.series[1].names[3] = "D2";

        game.series[2].title = "T3";
        game.series[2].names[0] = "A3";
        game.series[2].names[1] = "B3";
        game.series[2].names[2] = "C3";
        game.series[2].names[3] = "D3";

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
});