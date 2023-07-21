const fs = require('fs');

function parseFile(filename) {
  const fileContents = fs.readFileSync(filename, 'latin1');
  const lines = fileContents.split('\n');
  const transactions = [];
  let transaction = {};
  let currentField;
  lines.forEach((line) => {
    const fieldStart = line.charAt(0);
    if (fieldStart === 'D' || fieldStart === '^') {
      if (Object.keys(transaction).length > 0) {
        transactions.push(transaction);
      }
      transaction = {};
    }
    if (fieldStart !== '^') {
      switch (fieldStart) {
        case 'D':
          currentField = 'date';
          break;
        case 'M':
          currentField = 'description';
          break;
        case 'T':
          currentField = 'amount';
          break;
        case 'P':
          currentField = 'payee';
          break;
        case 'L':
          currentField = 'category';
          break;
        default:
          currentField = null;
          break;
      }
      if (currentField) {
        const fieldValue = line.slice(1).trim();
        transaction[currentField] = fieldValue.replace(/\d+\/\d+/g, '');
      }
    }
  });
  transactions.push(transaction);
  return transactions;
}

// get filename from command line arguments
const filename = process.argv[2];

if (!filename) {
  console.error('Usage: node program.js [filename]');
  process.exit(1);
}

const transactions = parseFile(filename);
//console.log(transactions);

const filteredTransactions = transactions.map(({ description, payee, category }) => ({ description, payee, category }));
const uniqueTransactions = Array.from(new Set(filteredTransactions.map(JSON.stringify))).map(JSON.parse);


uniqueTransactions.forEach( function(value) {
    if (value.category != undefined) {    
        console.log(value.category + '|' + value.payee + '|' + value.description);
    }
})


