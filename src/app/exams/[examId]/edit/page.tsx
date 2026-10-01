'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExamStore } from '@/stores/examStore';
import { ExamForm } from '@/components/exam/ExamForm';
import { Exam } from '@/types/exam';

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { activeExam, getExamById, updateExam } = useExamStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (examId) {
        setIsLoading(true);
        await getExamById(examId);
        setIsLoading(false);
      }
    }
    load();
  }, [examId]);

  if (isLoading || !activeExam) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  const handleUpdate = async (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    await updateExam(examId, data);
    router.push(`/exams/${examId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ExamForm
        initialData={activeExam}
        onSubmit={handleUpdate}
        title={`Chỉnh sửa: ${activeExam.name}`}
        submitLabel="Cập nhật đề thi"
      />
    </div>
  );
}
