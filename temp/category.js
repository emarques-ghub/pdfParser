// const extrato = [
//     { memo: 'INTIMISSIMI 04/04', payee: '', category: '' },
//     { memo: 'ZARA-SH.VILLA LOBO04/05', payee: '', category: '' },
//     { memo: 'RAIA DROGASIL 547 CENT', payee: '', category: '' }
//   ];

const fs = require('fs');

function parseCategoriesFile() {
  const categories = [];

  // Read the file and split it into an array of lines
  const lines = fs.readFileSync('categ.txt', 'utf-8').split('\n');

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

function parseExtratoFile() {
    const extrato = [];
  
    // Read the file and split it into an array of lines
    const lines = fs.readFileSync('extrato.txt', 'utf-8').split('\n');
  
    // Iterate over each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
  
      // Split the line into fields using the '|' separator
      const fields = line.split('|');
  
      // Create a new object with the category, payee, and texto properties
      if(fields[1] != undefined) {        
          const transaction = {
          num: fields[0].trim(),
          date: fields[1].trim(),
          parc: fields[2].trim(),
          date2: fields[3].trim(),
          memo: fields[4].trim(),
          amount: fields[5].trim(),
          total: fields[6].trim(),
          control: fields[7].trim()
          };
          
      // Add the new object to the categories array
      extrato.push(transaction);
      }
    }

  // Return the categories array
  return extrato;
}
 
const categorizeExtrato = (extrato, categories) => {
extrato.forEach((transaction) => {
    const matchingCategory = categories.find((category) => transaction.memo.includes(category.texto));
    if (matchingCategory) {
    transaction.payee = matchingCategory.payee;
    transaction.category = matchingCategory.category;
    } else {
    transaction.payee = '';
    transaction.category = 'Other';
    }
});
};

const categories = parseCategoriesFile();
console.log(categories); // or do something else with the categories array

const extrato = parseExtratoFile();
console.log(extrato); // or do something else with the categories array

categorizeExtrato(extrato, categories);
console.log(extrato);
// Output: [{ memo: "Grocery Store ABC", payee: "ABC Supermarkets", category: "Food" }, { memo: "Gas Station XYZ", payee: "XYZ Fuel Corp", category: "Transportation" }, { memo: "Restaurant DEF", payee: "DEF Restaurants Inc", category: "Food" }]
