import ExcelJS from 'exceljs';
import { Exam } from '@/types/exam';
import { StudentSubmission } from '@/types/grading';

export async function exportExamResultsToExcel(
  exam: Exam,
  submissions: StudentSubmission[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ChamAI - AI Exam Grading System';
  workbook.lastModifiedBy = 'ChamAI';
  workbook.created = new Date();
  workbook.modified = new Date();

  // -------------------------------------------------------------
  // SHEET 1: BẢNG ĐIỂM TỔNG HỢP (Overview)
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Bảng Điểm Tổng Hợp', {
    views: [{ showGridLines: true }],
  });

  // Title header
  summarySheet.mergeCells('A1:G1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `KẾT QUẢ CHẤM THI: ${exam.name.toUpperCase()}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }, // Blue-800
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 36;

  // Metadata rows
  summarySheet.getCell('A2').value = `Môn học: ${exam.subject}`;
  summarySheet.getCell('C2').value = `Số câu hỏi: ${exam.questions.length}`;
  summarySheet.getCell('E2').value = `Tổng số bài: ${submissions.length}`;
  summarySheet.getRow(2).font = { italic: true, size: 11 };

  // Headers
  const headers = [
    'STT',
    'Mã Học Sinh',
    'Họ và Tên',
    'Điểm Số',
    'Thang Điểm',
    'Tỉ Lệ Đúng (%)',
    'Trạng Thái',
  ];
  const headerRow = summarySheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // Blue-600
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add data rows
  submissions.forEach((sub, index) => {
    const score = sub.totalScore ?? 0;
    const max = sub.maxScore ?? exam.totalPoints ?? 10;
    const pct = max > 0 ? +((score / max) * 100).toFixed(1) : 0;
    const statusText =
      sub.status === 'completed'
        ? 'Hoàn thành'
        : sub.status === 'review_needed'
        ? 'Cần duyệt lại'
        : 'Đang chấm';

    const row = summarySheet.addRow([
      index + 1,
      sub.studentId || `HS${String(index + 1).padStart(3, '0')}`,
      sub.studentName || `Học sinh #${index + 1}`,
      score,
      max,
      `${pct}%`,
      statusText,
    ]);

    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).alignment = { horizontal: 'center' };
    row.getCell(4).alignment = { horizontal: 'right' };
    row.getCell(5).alignment = { horizontal: 'right' };
    row.getCell(6).alignment = { horizontal: 'right' };
    row.getCell(7).alignment = { horizontal: 'center' };

    // Highlight top / low scores
    if (pct >= 80) {
      row.getCell(4).font = { bold: true, color: { argb: 'FF047857' } }; // Green
    } else if (pct < 50) {
      row.getCell(4).font = { bold: true, color: { argb: 'FFB91C1C' } }; // Red
    }
  });

  // Auto-fit columns
  summarySheet.columns = [
    { width: 8 },
    { width: 16 },
    { width: 28 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 18 },
  ];

  // -------------------------------------------------------------
  // SHEET 2: CHI TIẾT ĐÁP ÁN TỪNG CÂU
  // -------------------------------------------------------------
  const detailsSheet = workbook.addWorksheet('Chi Tiết Từng Câu');
  const detailHeaders = [
    'STT',
    'Mã HS',
    'Họ và Tên',
    'Tổng Điểm',
    ...exam.questions.map((q) => `C${q.number} (${q.correctAnswer})`),
  ];

  const detailHeaderRow = detailsSheet.addRow(detailHeaders);
  detailHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  submissions.forEach((sub, index) => {
    const studentAnswers = exam.questions.map((q) => {
      const res = sub.results?.find((r) => r.questionNumber === q.number);
      const ans = res?.teacherOverride
        ? res.teacherOverride.correctedAnswer
        : res?.selectedAnswer || '—';
      return ans;
    });

    const row = detailsSheet.addRow([
      index + 1,
      sub.studentId || `HS${String(index + 1).padStart(3, '0')}`,
      sub.studentName || `Học sinh #${index + 1}`,
      sub.totalScore ?? 0,
      ...studentAnswers,
    ]);

    // Color code right/wrong answers
    exam.questions.forEach((q, qIdx) => {
      const cell = row.getCell(5 + qIdx);
      const ans = studentAnswers[qIdx];
      cell.alignment = { horizontal: 'center' };
      if (ans === q.correctAnswer) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDCFCE7' }, // Light green
        };
        cell.font = { color: { argb: 'FF166534' }, bold: true };
      } else if (ans !== '—') {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' }, // Light red
        };
        cell.font = { color: { argb: 'FF991B1B' } };
      }
    });
  });

  // -------------------------------------------------------------
  // DOWNLOAD TRIGGER (Browser)
  // -------------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const sanitizeName = exam.name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
  anchor.download = `ChamAI_KetQua_${sanitizeName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
