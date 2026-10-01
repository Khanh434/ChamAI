'use client';

import { useState } from 'react';
import { Exam } from '@/types/exam';
import { StudentSubmission } from '@/types/grading';
import { exportExamResultsToExcel } from '@/lib/export/excel';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';

interface ExportButtonProps {
  exam: Exam;
  submissions: StudentSubmission[];
}

export function ExportButton({ exam, submissions }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (submissions.length === 0) {
      alert('Chưa có bài chấm nào để xuất file Excel!');
      return;
    }

    setIsExporting(true);
    try {
      await exportExamResultsToExcel(exam, submissions);
    } catch (err) {
      console.error('Export error:', err);
      alert('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isExporting || submissions.length === 0}
      onClick={handleExport}
      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tạo file Excel...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          <span>Xuất Bảng Điểm (.XLSX)</span>
        </>
      )}
    </button>
  );
}
