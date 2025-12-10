// ui/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateLoanStatementPDF = async (loanDetails) => {
  const { loan, schedule, payments, totals } = loanDetails;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  let yPosition = 20;

  // Header
  pdf.setFontSize(18);
  pdf.text('Loan Statement', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Loan Info
  pdf.setFontSize(12);
  pdf.text(`Loan ID: ${loan._id}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Borrower: ${loan.borrower?.firstName} ${loan.borrower?.lastName}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Phone: ${loan.borrower?.phone}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Principal: ₹${loan.principal}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Outstanding: ₹${totals?.totalOutstanding ?? loan.totalPayable}`, 20, yPosition);
  yPosition += 20;

  // Schedule Table Header
  pdf.setFontSize(14);
  pdf.text('EMI Schedule', 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  const headers = ['#', 'Due Date', 'Principal', 'Interest', 'Total', 'Status'];
  const colWidths = [15, 30, 25, 25, 25, 25];
  let xPosition = 20;

  headers.forEach((header, i) => {
    pdf.text(header, xPosition, yPosition);
    xPosition += colWidths[i];
  });
  yPosition += 10;

  // Schedule Rows
  schedule.slice(0, 20).forEach(row => { // Limit to first 20 rows
    xPosition = 20;
    const rowData = [
      row.installmentNo.toString(),
      new Date(row.dueDate).toLocaleDateString(),
      `₹${row.principalComponent ?? row.principalDue ?? '-'}`,
      `₹${row.interestComponent ?? row.interestDue ?? '-'}`,
      `₹${row.amount ?? row.totalDue}`,
      row.status
    ];

    rowData.forEach((data, i) => {
      pdf.text(data, xPosition, yPosition);
      xPosition += colWidths[i];
    });
    yPosition += 8;

    if (yPosition > 250) { // New page if needed
      pdf.addPage();
      yPosition = 20;
    }
  });

  // Save PDF
  pdf.save(`loan-statement-${loan._id}.pdf`);
};

export const captureElementToPDF = async (elementId, filename = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('PDF generation failed. Please try again.');
  }
};