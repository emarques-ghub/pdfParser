const  fs = require('fs');
const pdfText = require('pdf-text');
const Extrato = new Array;
const rg_data = /^([0-3][0-9]\/[0-1][0-9])$/
const rg_parcela = /([0-3][0-9]\/[0-1][0-9])/
const rg_valor = /(- )?(\d+\.)?\d+(\,\d{1,2})/

//get file from command line parameter
var filename = process.argv[2];
if (!filename) {
  console.error("please provide the name of a PDF file");
} else {
    var pdfFile = fs.readFileSync(filename);
}

//parse and fill Extrato[]
pdfText(filename, function(err, chunks) {
    for (let index = 0; index < chunks.length; index++) {
        const element = chunks[index];
        if(rg_data.test(element)) {
            if (rg_valor.test(chunks[index+2]))
                Extrato.push({ 
                    data: chunks[index], 
                    memo: chunks[index+1], 
                    parcela: (rg_parcela.test(chunks[index+1])? rg_parcela.exec(chunks[index+1])[1] : ""), 
                    valor: parseFloat(chunks[index+2].replace("- ", "-").replace("." , "").replace("," , "."))
                })
            else
                console.log("Error: " + chunks[index] + ":" + chunks[index+1] + ":" + chunks[index+2])
        }    
    }

    //print Extrato & Sum
    let soma = 0;
    for (let index = 0; index < Extrato.length; index++) {
        console.log(index + " | " + Extrato[index].data + " | " + Extrato[index].memo + " | " + Extrato[index].parcela + " | " + Extrato[index].valor);
        soma = soma + Extrato[index].valor;
    }        
    console.log(soma.toFixed(2));

})
