const { PDFDocument, StandardFonts } = require('pdf-lib');
const { uploadBuffer } = require('./blobStorage');

async function generateAndStoreContractPdf(formalContract) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 750;

  page.drawText(`Contract: ${formalContract.title}`, { x: 50, y, size: 18, font });
  y -= 30;
  page.drawText(`Client: ${formalContract.parties.client}`, { x: 50, y, size: 12, font });
  y -= 20;
  page.drawText(`Freelancer: ${formalContract.parties.freelancer}`, { x: 50, y, size: 12, font });
  y -= 30;

  for (const section of formalContract.sections) {
    if (y < 100) { page = pdfDoc.addPage([600, 800]); y = 750; }
    page.drawText(`${section.title}:`, { x: 50, y, size: 12, font });
    y -= 16;
    const text = section.formattedContent ?? section.content;
    const lines = text.match(/.{1,80}/g) || [];
    for (const line of lines) {
      if (y < 50) { page = pdfDoc.addPage([600, 800]); y = 750; }
      page.drawText(line, { x: 60, y, size: 10, font });
      y -= 14;
    }
    y -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  const blobName = `contracts/${formalContract.id}.pdf`;
  return await uploadBuffer(pdfBytes, blobName, 'application/pdf');
}

module.exports = { generateAndStoreContractPdf };