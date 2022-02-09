const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract('./test/sample.pdf', options, (err, data) => {
  if (err) return console.log(err);
  console.log(data);
});