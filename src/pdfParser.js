const pdfParse = require('pdf-parse');
const pdfText = require('pdf-text');
const fs = require('fs');

// Get the PDF file name from the command line arguments
const args = process.argv.slice(2);
const categoryFileName = args[0];
const pdfFileName = args[1];

// Check if a PDF file name was provided
if (!pdfFileName || !categoryFileName) {
  console.log('Please provide the name of the category text file followed by the PDF file.');
} else {
  // Load the PDF file
  const pdfData = fs.readFileSync(pdfFileName);

  // Parse the PDF file and extract text
  pdfParse(pdfData).then(function (pdf) {
    pdfText(pdfData, function(err, chunks) {
      if (err) {
        console.log(err);
      } else {
        const textArray = chunks;

        // textArray.forEach(element => {
        //    console.log(element);
        // });

        // Parse transactions to a new Array
        transactions = parseTransactions(textArray); 
        transactions = transformTransactions(transactions);

        //Load categories and Categorize
        const categories = parseCategoriesFile(categoryFileName);
        transactions = categorizeTransactions(transactions, categories);

        sortByDate(transactions);

        let total = 0;
        let i=0;
        transactions.forEach(element => {
          const { date, originalDate, offset, memo, amount, payee, category, proximaFaturaFlag } = element;
          // console.log(`{ date: ${date.toLocaleDateString("pt-BR")}, originalDate: ${originalDate.toLocaleDateString("pt-BR")}, offset: ${offset}, memo: ${memo}, payee: ${payee}, category: ${category}, amount: ${amount.toFixed(2)} } `);

          let formattedAmount = (amount.toFixed(2) * -1).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          total += formattedAmount;
          console.log(`${date.toLocaleDateString("pt-BR")}|${originalDate.toLocaleDateString("pt-BR")}|${offset.toString().padStart(2, '0')}|${formattedAmount.padStart(8, ' ')}|${memo}|${payee}|${category}|${proximaFaturaFlag}`);
          
        });
        console.log('Emissão: ', transactions.dtEmissaoFatura);
        console.log('Total Fatura: ',transactions.totalFatura.toFixed(2));
        console.log('Soma: ',transactions.somaTransacoes.toFixed(2));

        exportTransactions(transactions);
      }
    });
  });
}

// Define a new method called "addMonths" on the Date object's prototype
Date.prototype.addMonths = function (value) {
  // Create a new Date object with the same value as the original Date object
  const newDate = new Date(this.valueOf());
  // Add the specified number of months to the new Date object
  newDate.setMonth(newDate.getMonth() + value);
  // If the new month has fewer days than the original month, set the date to the last day of the new month
  if (newDate.getDate() < this.getDate()) {
      newDate.setDate(0);
  }
  // Return the new Date object
  return newDate;
};

function parseTransactions(textArray) {
  const transactions = [];
  let dtEmissaoFatura = null;
  let totalFatura = null;
  let proximaFaturaFlag = false;

  const dtEmissaoRegex = /.*?(Emissão:)\s*(\d{2})\/(\d{2})\/(\d{4})/i;
  const dateRegex = /^([0-3][0-9]\/[0-1][0-9])$/;
  //const memoRegex = /^(?!(\d+\s))(?!\s)([^\n]+)/;
  const totalFaturaRegex = /total\s+desta\s+fatura/i;
  const memoSkipRegex = /^202\d.\d{3}.\d{6}.\d{4}/; // new regex to skip certain memos
  const proximasFaturasRegex = /Compras parceladas - próximas faturas/
  const AnuidadeSkipRegex = /^(ANUIDADE DIFERENC|DESCONTO ANUIDADE) \d{2}\/\d{2}$/; // new regex to skip anuidade

  for (let i = 0; i < textArray.length; i++) {
    const line = textArray[i].trim();

    const dtEmissaoMatch = dtEmissaoRegex.exec(line);
    if (dtEmissaoMatch) {
      dtEmissaoFaturaString = `${dtEmissaoMatch[2]}/${dtEmissaoMatch[3]}/${dtEmissaoMatch[4]}`;
      const [dayEmissao, monthEmissao, yearEmissao] = dtEmissaoFaturaString.split('/');
      dtEmissaoFatura = new Date(`${monthEmissao}/${dayEmissao}/${yearEmissao}`);
    }

    const totalFaturaMatch = totalFaturaRegex.exec(line);
    if (totalFaturaMatch) {
      totalFatura = parseFloat(textArray[i + 1].replace(".", "").replace(",", "."));
      continue; // skip to the next line
    }

    // check if it is 'proxima fatura' section
    if (proximasFaturasRegex.test(line)) { proximaFaturaFlag = true; }

    if (dateRegex.test(line)) {
      //const memo = memoRegex.exec(textArray[i + 1])[0];
      const memo = textArray[i + 1];

      // skip the transaction if the memo matches the skip regex
      if (memoSkipRegex.test(memo) || AnuidadeSkipRegex.test(memo)) {
        continue;
      }

      const dateString = `${line}/${dtEmissaoFatura.getFullYear()}`; 
      const [day, month, year] = dateString.split('/');
      const originalDate = new Date(`${month}/${day}/${year}`);
      
      if (originalDate > dtEmissaoFatura) {
        originalDate.setFullYear(dtEmissaoFatura.getFullYear() - 1);
      }

      const offsetString = memo.match(/([0-3][0-9]\/[0-1][0-9])/) ? memo.match(/([0-3][0-9]\/[0-1][0-9])/)[0] : null;
      const offset = offsetString ? parseInt(offsetString.slice(0, 2)) : '';
      const amount = parseFloat(textArray[i + 2].replace(".", "").replace(",", ".").replace(/[^\d.-]/g, ""));
      transactions.push({ originalDate, memo, offset, amount, proximaFaturaFlag });
    }
  }
  transactions.dtEmissaoFatura = dtEmissaoFatura;
  transactions.totalFatura = totalFatura;

  return transactions;
}


// Define a new method called "addMonths" on the Date object's prototype
Date.prototype.addMonths = function (value) {
  // Create a new Date object with the same value as the original Date object
  const newDate = new Date(this.valueOf());
  // Add the specified number of months to the new Date object
  newDate.setMonth(newDate.getMonth() + value);
  // If the new month has fewer days than the original month, set the date to the last day of the new month
  if (newDate.getDate() < this.getDate()) {
      newDate.setDate(0);
  }
  // Return the new Date object
  return newDate;
};

function transformTransactions(transactions) {
  let somaTransacoes = 0;
  const dtCorteFatura = transactions.dtEmissaoFatura;

  transactions.forEach((transaction) => {
    const { amount, offset, originalDate } = transaction;
    if (offset) {
      const date = originalDate.addMonths(offset-1);
      transaction.date = date;
    } else {
      transaction.date = originalDate;
    }
    if (amount && (transaction.date < dtCorteFatura) ) {
      somaTransacoes += amount;
      transaction.proximaFaturaFlag = false;
    }
  });

  transactions.somaTransacoes = somaTransacoes;
  return transactions;
}

function sortByDate(transactions) {
  transactions.sort((a, b) => a.date - b.date);
}

function parseCategoriesFile(categoryFileName) {
  const categories = [];

  // Read the file and split it into an array of lines
  const lines = fs.readFileSync(categoryFileName, 'utf-8').split('\n');

  // Iterate over each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Split the line into fields using the '|' separator
    const fields = line.split('|');

    // Create a new object with the category, payee, and texto properties
    if(fields[1] != undefined) {        
        const category = {
        category: fields[0].trim(),
        payee: fields[1].trim(),
        texto: fields[2].trim()
        };
        
    // Add the new object to the categories array
    categories.push(category);
    }
  }
  // Return the categories array
  return categories;
}

function categorizeTransactions(transactions, categories) {
  transactions.forEach((transaction) => {
    const { memo, amount } = transaction;
    const matchingCategory = categories.find((category) => memo.includes(category.texto));

    if (amount < 0 && amount > -1) {
      transaction.payee = 'Ajustes';
      transaction.category = 'B. Outras Receitas:Ajustes';
    } else {
      if (matchingCategory) {
        transaction.payee = matchingCategory.payee;
        transaction.category = matchingCategory.category;
      } else {
        transaction.payee = '';
        transaction.category = '';
      }
    }
  });
  return transactions;
}

function exportTransactions(transactions) {
  let qif = `!Type:Bank\n`;
  let csv = '';
  let fileName = transactions.dtEmissaoFatura.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace('/', '').replace('/', '');
  let counts = {};

  for (const transaction of transactions) {
    if (transaction.memo.match(/^202\d.\d{3}.\d{6}.\d{4}/)) {
      continue;
    }

    let date = transaction.date;
    let count = counts[date] || 0;
    counts[date] = count + 1;

    let transactionNumber = '';
    if (transaction.proximaFaturaFlag) {
      transactionNumber = `${date.getFullYear() % 100}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}xx`;
    } else {
      transactionNumber = `${date.getFullYear() % 100}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${count.toString().padStart(2, '0')}`;
    }

    let amountUS = (transaction.amount.toFixed(2) * -1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let amountBR = (transaction.amount.toFixed(2) * -1).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let memo = transaction.memo.replace(/(\r\n|\n|\r)/gm, ''); // remove newlines from memo
    let payee = transaction.payee ? `P${transaction.payee}\n` : '';
    let category = transaction.category ? `L${transaction.category}\n` : '';

    const qifTransaction = `N${transactionNumber}\nD${date.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' })}\nT${amountUS}\n${payee}${category}M${memo}\n^\n`;
    qif += qifTransaction;

    let payeeCSV = transaction.payee ? `${transaction.payee}` : '';
    let categoryCSV = transaction.category ? `${transaction.category}` : '';
    let proximaFaturaCSV = transaction.proximaFaturaFlag;

    const csvTransaction = `${date.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' })}|${transactionNumber}|${memo}|${amountBR}|${payeeCSV}|${categoryCSV}|${proximaFaturaCSV}\n`;
    csv += csvTransaction;

  }

  fs.writeFileSync(`${fileName}.qif`, qif, 'utf-8');
  fs.writeFileSync(`transactions.csv`, csv, 'utf-8');

}




// function exportTransactions(transactions) {
//   let qif = `!Type:Bank\n`;
//   let csv = '';
//   let fileName = transactions.dtEmissaoFatura.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace('/', '').replace('/', '');

//   for (const transaction of transactions) {
//     if (transaction.memo.match(/^202\d.\d{3}.\d{6}.\d{4}/)) {
//       continue;
//     }

//     let date = transaction.date.toLocaleDateString('pt-BR', { year: '2-digit', month: '2-digit', day: '2-digit' });
//     let amountUS = (transaction.amount.toFixed(2) * -1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     let amountBR = (transaction.amount.toFixed(2) * -1).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
//     let memo = transaction.memo.replace(/(\r\n|\n|\r)/gm, ''); // remove newlines from memo
//     let payee = transaction.payee ? `P${transaction.payee}\n` : '';
//     let category = transaction.category ? `L${transaction.category}\n` : '';

//     const qifTransaction = `D${date}\nT${amountUS}\n${payee}${category}M${memo}\n^\n`;
//     qif += qifTransaction;

//     let payeeCSV = transaction.payee ? `${transaction.payee}` : '';
//     let categoryCSV = transaction.category ? `${transaction.category}` : '';
//     let proximaFaturaCSV = transaction.proximaFaturaFlag;

//     const csvTransaction = `${date}|${memo}|${amountBR}|${payeeCSV}|${categoryCSV}|${proximaFaturaCSV}\n`;
//     csv += csvTransaction;

//   }

//   fs.writeFileSync(`${fileName}.qif`, qif, 'utf-8');
//   fs.writeFileSync(`transactions.csv`, csv, 'utf-8');

// }







