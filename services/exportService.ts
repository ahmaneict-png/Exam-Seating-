
import type { GeneratedReport, RoomArrangement } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as docx from 'docx';
import saveAs from 'file-saver';

/**
 * PDF मध्ये मराठी अक्षरे डब्यासारखी दिसू नयेत म्हणून इंग्रजी मॅपिंग
 */
const getPdfExamTitle = (marathiName: string): string => {
  const mapping: Record<string, string> = {
    'प्रथम चाचणी परीक्षा': 'FIRST UNIT TEST',
    'प्रथम सत्र परीक्षा': 'FIRST SEMESTER EXAM',
    'द्वितीय चाचणी परीक्षा': 'SECOND UNIT TEST',
    'द्वितीय सत्र/वार्षिक परीक्षा': 'ANNUAL EXAMINATION'
  };
  return mapping[marathiName] || marathiName.toUpperCase();
};

const drawCompactHeader = (doc: jsPDF, title: string, report: GeneratedReport, y: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pdfExamName = getPdfExamTitle(report.examName);
    
    // School Name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('YASHWANTRAO CHAVAN VIDYALAYA', pageWidth / 2, y, { align: 'center' });
    
    // Exam Details Line (English for clarity in PDF)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94);
    doc.text(`${pdfExamName} - ${report.academicYear}`, pageWidth / 2, y + 7, { align: 'center' });
    
    // Page Title (e.g., Room No. 1)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(title, pageWidth / 2, y + 13, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y + 16, pageWidth - 15, y + 16);
    
    return y + 22; 
};

/**
 * प्रश्नपत्रिका वितरण तक्ता (Distribution Table)
 */
const addDistributionTablePage = (doc: jsPDF, report: GeneratedReport) => {
  doc.addPage();
  const startY = drawCompactHeader(doc, 'QUESTION PAPER DISTRIBUTION SUMMARY', report, 15);
  const standards = ['10th', '9th', '8th', '7th', '6th', '5th'];
  
  const head = [['Room', ...standards, 'Total']];
  const body = report.summary.map(room => {
    return [
      room.roomNumber.toString(),
      ...standards.map(std => (room.counts[std] || 0).toString()),
      room.total.toString()
    ];
  });

  const totalRow = ['TOTAL'];
  let grandTotal = 0;
  standards.forEach(std => {
    const stdTotal = report.summary.reduce((acc, room) => acc + (room.counts[std] || 0), 0);
    totalRow.push(stdTotal.toString());
    grandTotal += stdTotal;
  });
  totalRow.push(grandTotal.toString());
  body.push(totalRow);

  autoTable(doc, {
    head: head,
    body: body,
    startY: startY + 2,
    theme: 'grid',
    styles: { fontSize: 9, halign: 'center', cellPadding: 2.5 },
    headStyles: { fillColor: [44, 62, 80] },
    didParseCell: (data) => {
      if (data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [236, 240, 241];
      }
    }
  });
};

export const exportToPdf = (report: GeneratedReport) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  report.arrangement.forEach((room, idx) => {
    const isTopRoom = idx % 2 === 0;
    
    if (idx > 0 && isTopRoom) {
      doc.addPage();
    }

    const sectionStartY = isTopRoom ? 10 : 150;

    if (!isTopRoom) {
      doc.setDrawColor(230, 230, 230);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(10, 145, pageWidth - 10, 145);
      doc.setLineDashPattern([], 0);
    }

    const headerBottomY = drawCompactHeader(doc, `Detailed Seating - Room No. ${room.roomNumber}`, report, sectionStartY);
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Total Strength: ${room.total}`, pageWidth - margin, headerBottomY - 3, { align: 'right' });

    const commonStyles = { fontSize: 9, cellPadding: 2, overflow: 'linebreak' };
    const commonColumnStyles = { 
        0: { fontStyle: 'bold', cellWidth: 35 }, 
        1: { cellWidth: 65 },                   
        2: { cellWidth: 55, textColor: [180, 0, 0] }, 
        3: { halign: 'center', cellWidth: 15 }   
    };

    autoTable(doc, {
      head: [['LEFT SIDE (Benches 1-31)', 'Roll Numbers', 'Absentees', 'Qty']],
      body: room.leftSide.map(b => [b.className, b.displayRanges.join(', '), b.absentees || '-', b.count]),
      startY: headerBottomY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: commonStyles,
      headStyles: { fillColor: [41, 128, 185], halign: 'left' },
      columnStyles: commonColumnStyles as any
    });

    const afterLeftY = (doc as any).lastAutoTable.finalY;

    autoTable(doc, {
      head: [['RIGHT SIDE (Benches 1-31)', 'Roll Numbers', 'Absentees', 'Qty']],
      body: room.rightSide.map(b => [b.className, b.displayRanges.join(', '), b.absentees || '-', b.count]),
      startY: afterLeftY + 3,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: commonStyles,
      headStyles: { fillColor: [39, 174, 96], halign: 'left' },
      columnStyles: commonColumnStyles as any
    });
  });

  addDistributionTablePage(doc, report);

  doc.save(`Exam_Report_${Date.now()}.pdf`);
};

export const exportToWord = (report: GeneratedReport) => {
  const docChildren: any[] = [];
  
  docChildren.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: `YASHWANTRAO CHAVAN VIDYALAYA`, size: 32, bold: true })],
    alignment: docx.AlignmentType.CENTER
  }));
  docChildren.push(new docx.Paragraph({
    children: [new docx.TextRun({ text: `${report.examName} (${report.academicYear})`, size: 24, bold: true })],
    alignment: docx.AlignmentType.CENTER,
    spacing: { after: 300 }
  }));

  report.arrangement.forEach((room) => {
    docChildren.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: `Room No. ${room.roomNumber} | Total: ${room.total}`, size: 24, bold: true })],
      spacing: { before: 200, after: 100 }
    }));
    
    const rows = [
      new docx.TableRow({
        children: ['Side', 'Class', 'Roll Ranges', 'Absentees', 'Qty'].map(h => new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: h, bold: true, size: 18 })] })] }))
      })
    ];
    room.leftSide.forEach(b => rows.push(new docx.TableRow({ children: ['Left', b.className, b.displayRanges.join(', '), b.absentees || '-', String(b.count)].map(v => new docx.TableCell({ children: [new docx.Paragraph({ text: v, spacing: { before: 40, after: 40 } })] })) })));
    room.rightSide.forEach(b => rows.push(new docx.TableRow({ children: ['Right', b.className, b.displayRanges.join(', '), b.absentees || '-', String(b.count)].map(v => new docx.TableCell({ children: [new docx.Paragraph({ text: v, spacing: { before: 40, after: 40 } })] })) })));
    
    docChildren.push(new docx.Table({ rows, width: { size: 100, type: docx.WidthType.PERCENTAGE } }));
  });
  
  const doc = new docx.Document({ sections: [{ children: docChildren }] });
  docx.Packer.toBlob(doc).then(blob => saveAs(blob, `Exam_Arrangement.docx`));
};

export const exportNoticeBoardToPdf = (report: GeneratedReport) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let currentY = drawCompactHeader(doc, 'NOTICE BOARD SUMMARY', report, 15);
  
  report.arrangement.forEach((room) => {
    if (currentY > 260) {
        doc.addPage();
        currentY = drawCompactHeader(doc, 'NOTICE BOARD SUMMARY', report, 15);
    }
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Room No. ${room.roomNumber} (Total: ${room.total})`, 15, currentY + 4);
    
    autoTable(doc, {
      head: [['Side', 'Classes', 'Roll Ranges', 'Total']],
      body: [
        ['LEFT', room.leftSide.map(b => b.className).join(', '), room.leftSide.map(b => b.displayRanges[0]).join(', '), room.leftTotal],
        ['RIGHT', room.rightSide.map(b => b.className).join(', '), room.rightSide.map(b => b.displayRanges[0]).join(', '), room.rightTotal]
      ],
      startY: currentY + 6,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  });

  doc.save(`Notice_Board_Summary.pdf`);
};
