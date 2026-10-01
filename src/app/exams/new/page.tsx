'use client';

import { useRouter } from 'next/navigation';
import { useExamStore } from '@/stores/examStore';
import { ExamForm } from '@/components/exam/ExamForm';
import { Exam } from '@/types/exam';

export default function CreateExamPage() {
  const router = useRouter();
  const { createExam } = useExamStore();

  const handleCreate = async (data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await createExam(data);
    router.push(`/exams/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ExamForm
        onSubmit={handleCreate}
        title="Tạo đề thi mới"
        submitLabel="Tạo đề thi"
      />
    </div>
  );
}
