const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function gerarPdfRelatorio(temperatura, umidade, analiseIA) {
  console.log('[PDF] Criando o documento...');

  return new Promise((resolve, reject) => {
    // Garante que a pasta temp existe
    const dirTemp = path.join(__dirname, '../../temp');
    if (!fs.existsSync(dirTemp)) {
      fs.mkdirSync(dirTemp, { recursive: true });
    }

    const caminhoPDF = path.join(dirTemp, `Laudo_Climatico_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(caminhoPDF);

    doc.pipe(stream);

    // Cabeçalho
    doc.fontSize(18).font('Helvetica-Bold').text('Laudo Climatológico - Smart Weather', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
    doc.text(`Temperatura Atual: ${temperatura} °C`);
    doc.text(`Umidade Atual: ${umidade} %`);
    doc.moveDown(1.5);

    // Corpo com análise da IA
    doc.fontSize(14).font('Helvetica-Bold').text('Análise da Inteligência Artificial:');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(analiseIA, { align: 'justify' });

    doc.end();

    stream.on('finish', () => resolve(caminhoPDF));
    stream.on('error', (err) => reject(err));
  });
}

module.exports = { gerarPdfRelatorio };