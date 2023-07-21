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
        const current = { linha1: chunks[index], linha2: chunks[index+1], linha3:chunks[index+2] };
        
        if(rg_total.test(current.linha1)) {
            Extrato.totalFatura = parseFloat(current.linha2.replace("- ", "-").replace("." , "").replace("," , "."))
        }
        if(rg_protocolo.test(current.linha2)) {
            continue;
        }
        if (rg_anuidade.test(current.linha2)) { 
            continue;
        }
        if(rg_proximas.test(current.linha2)) {
            bFlagProximaFatura = true;
        }
        if(rg_emissao.test(current.linha1)) {
            Extrato.dtEmissao = new Date(current.linha1.substring(15,19), Number(current.linha1.substring(12,14) - 1), current.linha1.substring(9,11));
        }
        if(rg_data.test(current.linha1)) {
            dtTransaction = new Date(Extrato.dtEmissao.getFullYear(), Number(current.linha1.substring(3,5))-1, current.linha1.substring(0,2))
            if (dtTransaction > Extrato.dtEmissao) {
                dtTransaction.setFullYear(Extrato.dtEmissao.getFullYear() - 1);
            }

            Extrato.push({ 
                data: new Date(dtTransaction),
                memo: current.linha2, 
                valor: parseFloat(current.linha3.replace("- ", "-").replace("." , "").replace("," , ".")),
                get parcela() { return (rg_parcela.test(this.memo)? rg_parcela.exec(this.memo)[1] : "01/01"); }, 
                get dtParcela() { 
                    nParcela = this.parcela.substring(0,2)-1;
                    return new Date(this.data.getTime()).addMonths(nParcela); 
                },
                proximaFatura: bFlagProximaFatura,
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
    let x = 0;
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


