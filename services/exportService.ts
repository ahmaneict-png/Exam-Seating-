
import type { GeneratedReport, RoomArrangement } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as docx from 'docx';
import saveAs from 'file-saver';

const drawCompactHeader = (doc: jsPDF, title: string, y: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('YASHWANTRAO CHAVAN VIDYALAYA', pageWidth / 2, y, { align: 'center' });
    doc.setFontSize(11);
    doc.text(title, pageWidth / 2, y + 6, { align: 'center' });
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y + 9, pageWidth - 15, y + 9);
    return y + 14; 
};

/**
 * प्रश्नपत्रिका वितरण तक्ता (Distribution Table)
 */
const addDistributionTablePage = (doc: jsPDF, report: GeneratedReport) => {
  doc.addPage();
  const startY = drawCompactHeader(doc, 'QUESTION PAPER DISTRIBUTION TABLE', 15);
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
    startY: startY + 5,
    theme: 'grid',
    styles: { fontSize: 9, halign: 'center', cellPadding: 2 },
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
      doc.setDrawColor(220, 220, 220);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(10, 145, pageWidth - 10, 145);
      doc.setLineDashPattern([], 0);
    }

    const headerBottomY = drawCompactHeader(doc, `Detailed Seating - Room No. ${room.roomNumber}`, sectionStartY);
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Total Students: ${room.total}`, pageWidth - margin, headerBottomY - 2, { align: 'right' });

    const commonStyles = { fontSize: 9, cellPadding: 2 };
    const commonColumnStyles = { 
        0: { fontStyle: 'bold', cellWidth: 35 }, // Class
        1: { cellWidth: 70 },                   // Roll Numbers
        2: { cellWidth: 50, textColor: [180, 0, 0] }, // Absentees
        3: { halign: 'center', cellWidth: 15 }   // Qty
    };

    // Table 1: Left Side
    autoTable(doc, {
      head: [['LEFT SIDE (1-31)', 'Roll Numbers', 'Absentees', 'Qty']],
      body: room.leftSide.map(b => [b.className, b.displayRanges.join(', '), b.absentees || '-', b.count]),
      startY: headerBottomY + 2,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: commonStyles,
      headStyles: { fillColor: [41, 128, 185], halign: 'left' },
      columnStyles: commonColumnStyles
    });

    const afterLeftY = (doc as any).lastAutoTable.finalY;

    // Table 2: Right Side
    autoTable(doc, {
      head: [['RIGHT SIDE (1-31)', 'Roll Numbers', 'Absentees', 'Qty']],
      body: room.rightSide.map(b => [b.className, b.displayRanges.join(', '), b.absentees || '-', b.count]),
      startY: afterLeftY + 2,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: commonStyles,
      headStyles: { fillColor: [39, 174, 96], halign: 'left' },
      columnStyles: commonColumnStyles
    });
  });

  addDistributionTablePage(doc, report);

  doc.save(`exam-report-${Date.now()}.pdf`);
};

export const exportToWord = (report: GeneratedReport) => {
  const docChildren: any[] = [];
  report.arrangement.forEach((room) => {
    docChildren.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: `Room No. ${room.roomNumber} | Total: ${room.total}`, size: 24, bold: true })]
    }));
    
    const rows = [
      new docx.TableRow({
        children: ['Side', 'Class', 'Roll Ranges', 'Absentees', 'Qty'].map(h => new docx.TableCell({ children: [new docx.Paragraph({ children: [new docx.TextRun({ text: h, bold: true, size: 18 })] })] }))
      })
    ];
    room.leftSide.forEach(b => rows.push(new docx.TableRow({ children: ['Left', b.className, b.displayRanges.join(', '), b.absentees || '-', String(b.count)].map(v => new docx.TableCell({ children: [new docx.Paragraph({ text: v, spacing: { before: 40, after: 40 } })] })) })));
    room.rightSide.forEach(b => rows.push(new docx.TableRow({ children: ['Right', b.className, b.displayRanges.join(', '), b.absentees || '-', String(b.count)].map(v => new docx.TableCell({ children: [new docx.Paragraph({ text: v, spacing: { before: 40, after: 40 } })] })) })));
    
    docChildren.push(new docx.Table({ rows, width: { size: 100, type: docx.WidthType.PERCENTAGE } }));
    docChildren.push(new docx.Paragraph({ text: "", spacing: { after: 200 } }));
  });
  
  const doc = new docx.Document({ sections: [{ children: docChildren }] });
  docx.Packer.toBlob(doc).then(blob => saveAs(blob, `arrangement.docx`));
};

export const exportNoticeBoardToPdf = (report: GeneratedReport) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let currentY = drawCompactHeader(doc, 'Notice Board Seating Summary', 15);
  
  report.arrangement.forEach((room) => {
    if (currentY > 260) {
        doc.addPage();
        currentY = drawCompactHeader(doc, 'Notice Board Seating Summary', 15);
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Room No. ${room.roomNumber} (Total: ${room.total})`, 15, currentY + 6);
    
    autoTable(doc, {
      head: [['Side', 'Classes', 'Roll Ranges', 'Total']],
      body: [
        ['LEFT', room.leftSide.map(b => b.className).join(', '), room.leftSide.map(b => b.displayRanges[0]).join(', '), room.leftTotal],
        ['RIGHT', room.rightSide.map(b => b.className).join(', '), room.rightSide.map(b => b.displayRanges[0]).join(', '), room.rightTotal]
      ],
      startY: currentY + 8,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;
  });

  doc.save(`notice-board-summary.pdf`);
};
