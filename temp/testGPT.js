// const { GPT3 } = require('openai');
// const apiKey = 'YOUR_API_KEY';
// const api = new GPT3({ apiKey });

// async function categorizeTransactions() {
//   const Extrato = [
//     { Memo: 'Grocery store', Amount: 100.0, Category: '' },
//     { Memo: 'Gas station', Amount: 50.0, Category: '' },
//     { Memo: 'Restaurant', Amount: 75.0, Category: '' },
//     { Memo: 'Movie theater', Amount: 30.0, Category: '' }
//   ];

//   const Categorias = [
//     { Key: 'Grocery', Category: 'Food' },
//     { Key: 'Gas', Category: 'Transportation' },
//     { Key: 'Restaurant', Category: 'Food' },
//     { Key: 'Movie', Category: 'Entertainment' }
//   ];

//   for (let i = 0; i < Extrato.length; i++) {
//     const memo = Extrato[i].Memo.toLowerCase();
//     let matchFound = false;
//     for (let j = 0; j < Categorias.length; j++) {
//       const key = Categorias[j].Key.toLowerCase();
//       if (memo.includes(key)) {
//         Extrato[i].Category = Categorias[j].Category;
//         matchFound = true;
//         break;
//       }
//     }
//     if (!matchFound) {
//       const suggestion = await generateSuggestion(memo);
//       Extrato[i].Category = suggestion;
//       Categorias.push({ Key: suggestion.toLowerCase(), Category: suggestion });
//     }
//   }

//   console.log(Extrato);
//   console.log(Categorias);
// }

// async function generateSuggestion(memo) {
//   const prompt = `Suggest a category for the following memo: "${memo}"\nCategory:`;
//   const gptResponse = await openai.complete({
//     engine: 'text-davinci-002',
//     prompt,
//     maxTokens: 30,
//     n: 1,
//     stop: '\n'
//   });
//   return gptResponse.choices[0].text.trim();
// }

// categorizeTransactions();

const Extrato = [
    { Memo: 'McDonalds', Amount: -10.0, Category: '' },
    { Memo: 'Starbucks', Amount: -5.0, Category: '' },
    { Memo: 'Walmart', Amount: -30.0, Category: '' },
    { Memo: 'Gas Station', Amount: -20.0, Category: '' },
    { Memo: 'Target', Amount: -15.0, Category: '' },
  ];
  
  const Categorias = [
    { Key: 'McDonalds', Category: 'Restaurants' },
    { Key: 'Starbucks', Category: 'Coffee Shops' },
    { Key: 'Walmart', Category: 'Retail' },
    { Key: 'Target', Category: 'Retail' },
  ];
  
  for (let i = 0; i < Extrato.length; i++) {
    let found = false;
    for (let j = 0; j < Categorias.length; j++) {
      if (Extrato[i].Memo.toLowerCase().includes(Categorias[j].Key.toLowerCase())) {
        Extrato[i].Category = Categorias[j].Category;
        found = true;
        break;
      }
    }
    if (!found) {
      const newCategory = {
        Key: Extrato[i].Memo,
        Category: 'New Category',
      };
      Categorias.push(newCategory);
      Extrato[i].Category = newCategory.Category;
    }
  }
  
  console.log(Extrato);
  console.log(Categorias);
  
  

  