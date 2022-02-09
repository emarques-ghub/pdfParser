const  fs = require('fs');
const PdfParse = require('pdf-parse');
var pdfText = require('pdf-text');

//const pdfFile = fs.readFileSync("./test/sample.pdf");


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

pdfText(filename, function(err, chunks) {
    for (let index = 0; index < chunks.length; index++) {
        const element = chunks[index];
        if(rg_data.test(element)) {
            Extrato.push({ 
                data: chunks[index], 
                memo: chunks[index+1], 
                parcela: (rg_parcela.test(chunks[index+1])? rg_parcela.exec(chunks[index+1])[1] : ""), 
                valor: parseFloat(chunks[index+2].replace("- ", "-").replace("." , "").replace("," , "."))
            })
        }    
    }

    //print extrato
    let soma = 0;
    for (let index = 0; index < Extrato.length; index++) {
        console.log(index + " " + Extrato[index].data + " " + Extrato[index].memo + " " + Extrato[index].parcela + " " + Extrato[index].valor);
        soma = soma + Extrato[index].valor;
    }        
    console.log(soma.toFixed(2));

})



//get info
/*
PdfParse(pdfFile).then(function(data){
    console.log(data.info);
    console.log(data.numpages);

    const rg_data = /^([0-3][0-9]\/[0-1][0-9])/
    const rg_valor = /(- )?(\d+\.)?\d+(\,\d{1,2})/
    const rg_data_memo = /([0-3][0-9]\/[0-1][0-9])/
    
    //quebra a string a cada CR LF
    //"a\nb\r\nc\r\nlala".split(/\r?\n/) 
    // ["a", "b", "c", "lala"]
    var ks = data.text.split(/\r?\n/);
    console.log(ks.length);
    const Extrato = new Array;

    for (let index = 0; index < ks.length; index++) {
        const linha = ks[index];
        const transacao = {data: "", memo: "", valor: "", parcela: ""}
        const nTrn = 0;

        if(rg_data.test(linha)) {
            transacao.data = linha.substr(0, 5);
            const memoTemp = linha.substr(5);
            if (rg_data_memo.test(memoTemp)) {
                // se tem parcela
                transacao.parcela = rg_data_memo.exec(memoTemp)[1];
                transacao.memo = memoTemp.substr(0, rg_data_memo.exec(memoTemp).index + 5);
                transacao.valor = memoTemp.substr(rg_data_memo.exec(memoTemp).index+5);
                if (isNaN( parseFloat(transacao.valor.replace("- ", "-").replace("." , "").replace("," , ".")))) {
                    console.log(index + " " + ks[index]);
                }
            } else { 
                //nao tem parcela
                transacao.parcela = "";
                transacao.memo = memoTemp.substr(0, memoTemp.length - rg_valor.exec(memoTemp)[0].length);
                transacao.valor = rg_valor.exec(memoTemp)[0];
            }
            Extrato.push(transacao);
        }    
    }

    //print extrato
    let soma = 0;
    for (let index = 0; index < Extrato.length; index++) {
        console.log(index + " " + Extrato[index].data + " " + Extrato[index].memo + " " + Extrato[index].parcela + " " + Extrato[index].valor);
        soma = soma + parseFloat(Extrato[index].valor.replace("- ", "-").replace("." , "").replace("," , "."));
    }        
    console.log(soma);

})
*/