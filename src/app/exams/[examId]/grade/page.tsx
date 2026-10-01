'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExamStore } from '@/stores/examStore';
import { useGradingStore } from '@/stores/gradingStore';
import { CameraCapture } from '@/components/grading/CameraCapture';
import { SlotManager } from '@/components/grading/SlotManager';
import { StudentQueue } from '@/components/grading/StudentQueue';
import { GradingProgress } from '@/components/grading/GradingProgress';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckSquare,
  BarChart3,
  Camera,
  Layers,
  Sparkles,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { compressImageDataUrl } from '@/lib/utils/image';

export default function GradeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { activeExam, getExamById } = useExamStore();
  const {
    submissions,
    currentStudentIndex,
    currentSlotIndex,
    isGrading,
    initSession,
    setCurrentStudentIndex,
    setCurrentSlotIndex,
    setSlotImage,
    clearSlotImage,
    updateStudentInfo,
    gradeCurrentStudent,
    addNewStudent,
    removeStudent,
  } = useGradingStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (examId) {
        setIsLoading(true);
        const exam = await getExamById(examId);
        if (exam) {
          await initSession(exam);
        }
        setIsLoading(false);
      }
    }
    load();
  }, [examId]);

  if (isLoading || !activeExam) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-16 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
      </div>
    );
  }

  const currentSubmission = submissions[currentStudentIndex] || {
    id: 'sub-temp',
    examId: activeExam.id,
    studentIndex: 1,
    studentName: 'Học sinh 1',
    studentId: 'HS001',
    slots: [{ index: 0, status: 'empty' }],
    status: 'pending',
  };

  const handleCapture = async (dataUrl: string) => {
    // Compress image before storing
    const compressed = await compressImageDataUrl(dataUrl, 1280, 1280, 0.82);
    await setSlotImage(currentStudentIndex, currentSlotIndex, compressed);
  };

  const handleGradeNow = async () => {
    const success = await gradeCurrentStudent();
    if (success) {
      // Trigger celebratory confetti if score >= 9
      const updatedSub = useGradingStore.getState().submissions[currentStudentIndex];
      if (updatedSub?.totalScore && updatedSub.maxScore && (updatedSub.totalScore / updatedSub.maxScore) >= 0.9) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas-confetti fails
        }
      }
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < submissions.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    } else {
      addNewStudent();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/exams/${activeExam.id}`}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {activeExam.subject}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {activeExam.totalPages} trang / học sinh
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Chấm thi: {activeExam.name}
            </h1>
          </div>
        </div>

        {/* Quick Review / Results Links */}
        <div className="flex items-center gap-2">
          <Link
            href={`/exams/${activeExam.id}/review`}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <CheckSquare className="h-4 w-4" />
            <span>Duyệt nghi vấn</span>
          </Link>

          <Link
            href={`/exams/${activeExam.id}/results`}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Bảng điểm</span>
          </Link>
        </div>
      </div>

      {/* Student Queue Navigator */}
      <StudentQueue
        submissions={submissions}
        currentIndex={currentStudentIndex}
        onSelectStudent={setCurrentStudentIndex}
        onAddStudent={addNewStudent}
        onRemoveStudent={removeStudent}
        onUpdateInfo={updateStudentInfo}
      />

      {/* Immediate Result Banner after Grading */}
      <GradingProgress
        submission={currentSubmission}
        examId={activeExam.id}
        onNextStudent={handleNextStudent}
        hasNextStudent={true}
      />

      {/* Main Workstation: Camera + Slot Manager */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Camera Viewfinder */}
        <div className="lg:col-span-7">
          <CameraCapture
            onCapture={handleCapture}
            activeSlotIndex={currentSlotIndex}
            totalSlots={activeExam.totalPages}
          />
        </div>

        {/* Right column: Slots & Grade Now */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <SlotManager
              slots={currentSubmission.slots}
              activeSlotIndex={currentSlotIndex}
              onSelectSlot={setCurrentSlotIndex}
              onClearSlot={(slotIdx) => clearSlotImage(currentStudentIndex, slotIdx)}
              onGradeNow={handleGradeNow}
              isGrading={isGrading}
            />
          </div>

          {/* Quick Guide tips */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              Mẹo chấm nhanh:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Giữ camera thẳng góc với phiếu thi và đủ ánh sáng để nhận diện tối ưu.</li>
              <li>Hệ thống tự động chuyển sang trang kế tiếp ngay sau khi chụp.</li>
              <li>Có thể tải ảnh trực tiếp từ thư viện nếu ảnh đã được chụp trước đó.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
