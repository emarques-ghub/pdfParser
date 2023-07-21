const  fs = require('fs');
const PdfParse = require('pdf-parse');
var pdfText = require('pdf-text');

//const pdfFile = fs.readFileSync("./test/sample.pdf");

//date addMonths function
Date.isLeapYear = function (year) { 
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () { 
    return Date.isLeapYear(this.getFullYear()); 
};

Date.prototype.getDaysInMonth = function () { 
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    var n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};


//get file
var filename = process.argv[2];
if (!filename) {
  console.error("please provide the name of a PDF file");
} else {
    var pdfFile = fs.readFileSync(filename);
}

//var pathToPdf = __dirname + "/info.pdf"

const Extrato = new Array;
const rg_data = /^([0-3][0-9]\/[0-1][0-9])$/
const rg_parcela = /([0-3][0-9]\/[0-1][0-9])/
const rg_emissao = /Emissão: ([0-3][0-9]\/[0-1][0-9]\/[2][0][0-2][0-9])/
const rg_proximas = /Compras parceladas - próximas faturas/
const rg_total = /Total dos lançamentos atuais/
const rg_anuidade = /ANUIDADE DIF/
const rg_protocolo = /^202\d.\d{3}.\d{6}.\d{4}/

pdfText(filename, function(err, chunks) {
    let bFlagProximaFatura = false;
    for (let index = 0; index < chunks.length; index++) {
        const element = chunks[index];
        //console.log(element);
        if(rg_total.test(element)) {
            Extrato.totalFatura = parseFloat(chunks[index+1].replace("- ", "-").replace("." , "").replace("," , "."))
        }
        if(rg_protocolo.test(chunks[index+1])) {
            continue;
        }
        if (rg_anuidade.test(chunks[index+1])) { 
            continue;
        }
        if(rg_proximas.test(chunks[index+1])) {
            bFlagProximaFatura = true;
        }
        if(rg_emissao.test(element)) {
            Extrato.dtEmissao = new Date(element.substring(15,19), Number(element.substring(12,14) - 1), element.substring(9,11));
        }
        if(rg_data.test(element)) {
            dtTransaction = new Date(Extrato.dtEmissao.getFullYear(), Number(element.substring(3,5))-1, element.substring(0,2))
            if (dtTransaction > Extrato.dtEmissao) {
                dtTransaction.setFullYear(Extrato.dtEmissao.getFullYear() - 1);
            }
            nParcela = (rg_parcela.test(chunks[index+1])? rg_parcela.exec(chunks[index+1])[1] : "01/01").substring(0,2)-1
            nValor = parseFloat(chunks[index+2].replace("- ", "-").replace("." , "").replace("," , "."))

            Extrato.push({ 
                data: new Date(dtTransaction),
                memo: chunks[index+1], 
                parcela: (rg_parcela.test(chunks[index+1])? rg_parcela.exec(chunks[index+1])[1] : "01/01"), 
                valor: nValor,
                dtParcela: (new Date(dtTransaction.getTime())).addMonths(nParcela),
                proximaFatura: bFlagProximaFatura
            })
        }    
    }

    Number.prototype.pad = function(size) {
        var s = String(this);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    function compare( a, b ) {
        if ( a.dtParcela < b.dtParcela ){
          return -1;
        }
        if ( a.dtParcela > b.dtParcela ){
          return 1;
        }
        return 0;
      }

    Extrato.sort( compare )

    //print extrato
    let soma = 0;
    console.log("Data de Emissao = " + Extrato.dtEmissao);
    for (let index = 0; index < Extrato.length; index++) {
        console.log(index.pad(3) + "|" + Extrato[index].data.toLocaleDateString("pt-BR") + "|" + Extrato[index].parcela + "|" + Extrato[index].dtParcela.toLocaleDateString("pt-BR") + "|" + Extrato[index].memo + "|" + Extrato[index].valor.toFixed(2).toString().replace("." , ",") + "|" + soma.toFixed(2) + "|" + ((Extrato[index].proximaFatura)? "*" : "") );

        if (Extrato[index].dtParcela > Extrato.dtEmissao ) {

        } else {
            if (!Extrato[index].proximaFatura) {
                soma = soma + Extrato[index].valor;
            }
        }

    }        
    console.log(soma.toFixed(2));
    console.log(Extrato.totalFatura.toFixed(2));
})


