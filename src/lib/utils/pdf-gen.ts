import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a premium PDF for an invoice.
 */
export function generateInvoicePDF(invoice: any) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 5, 'F');

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('AIM HIGH', 20, 25);
  doc.setFontSize(8);
  doc.text('SCHOOL MANAGEMENT SYSTEM', 20, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Main Campus, Education City', 20, 32);
  doc.text('+92 (300) 123-4567', 20, 37);
  doc.text('accounts@school.edu.pk', 20, 42);

  doc.setFontSize(30);
  doc.setTextColor(226, 232, 240); // Slate 200
  doc.text('INVOICE', 140, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`#INV-${invoice.id.slice(0, 8)}`, 140, 32);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 37);

  // Billing Info
  doc.setDrawColor(241, 245, 249);
  doc.line(20, 55, 190, 55);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('BILL TO', 20, 65);
  doc.text('DATE INFO', 140, 65);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.students?.full_name || 'Student', 20, 75);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Grade: ${invoice.students?.grade || 'N/A'} - ${invoice.students?.section || 'N/A'}`, 20, 80);

  doc.setTextColor(...primaryColor);
  doc.text(`Issued: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 75);
  doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 140, 80);

  // Table
  autoTable(doc, {
    startY: 95,
    head: [['Description', 'Amount']],
    body: [
      [
        { content: `${invoice.fee_type} Fee\n${invoice.description || ''}`, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${Number(invoice.amount).toLocaleString()}`, styles: { halign: 'right' } }
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount Due:', 110, finalY);
  doc.text(`Rs. ${Number(invoice.amount).toLocaleString()}`, 190, finalY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer generated invoice and does not require a signature.', 105, 280, { align: 'center' });

  doc.save(`invoice_${invoice.id.slice(0, 8)}.pdf`);
}

/**
 * Generates a premium PDF for a payslip.
 */
export function generatePayslipPDF(entry: any) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo 600

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 5, 'F');

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('AIM HIGH - PAYSLIP', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Cycle: ${entry.month}`, 20, 32);

  doc.setFontSize(30);
  doc.setTextColor(226, 232, 240);
  doc.text('CONFIDENTIAL', 110, 25);

  // Staff Info
  doc.setDrawColor(241, 245, 249);
  doc.line(20, 45, 190, 45);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('STAFF MEMBER', 20, 55);
  doc.text('DISBURSEMENT ID', 140, 55);

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(entry.profiles?.full_name || 'Staff', 20, 65);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Role: ${entry.profiles?.role || 'Staff'}`, 20, 70);
  doc.text(`#PAY-${entry.id.slice(0, 8)}`, 140, 65);

  // Table
  autoTable(doc, {
    startY: 85,
    head: [['Earnings Detail', 'Amount']],
    body: [
      ['Basic Salary', `Rs. ${Number(entry.basic_salary).toLocaleString()}`],
      ['Allowances', 'Rs. 0'],
      ['Deductions', 'Rs. 0'],
      [{ content: 'Net Payable', styles: { fontStyle: 'bold' } }, { content: `Rs. ${Number(entry.net_salary).toLocaleString()}`, styles: { fontStyle: 'bold' } }]
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  doc.save(`payslip_${entry.profiles?.full_name.replace(' ', '_')}_${entry.month.replace(' ', '_')}.pdf`);
}
