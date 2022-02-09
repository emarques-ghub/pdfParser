const  fs = require('fs'),
const PDFParser = require("pdf2json");

    let pdfParser = new PDFParser();

    /*
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        //fs.writeFile("./test/sample.json", JSON.stringify(pdfData));
        //console.log(JSON.stringify(pdfData));
        console.log(JSON.stringify(pdfParser.getRawTextContent()));
    });*/

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log(JSON.stringify(pdfParser.getAllFieldsTypes()), ()=>{console.log("Done.");});
    });

    pdfParser.loadPDF("./test/sample.pdf");