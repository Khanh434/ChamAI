'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { StudentSubmission } from '@/types/grading';
import { BarChart3 } from 'lucide-react';

interface ScoreDistributionProps {
  submissions: StudentSubmission[];
  maxScore?: number;
}

export function ScoreDistribution({ submissions, maxScore = 10 }: ScoreDistributionProps) {
  // Create 5 score brackets: [0-2), [2-4), [4-6), [6-8), [8-10]
  const brackets = [
    { range: '0 - 2 đ', min: 0, max: 2, count: 0, color: '#f43f5e' }, // Rose
    { range: '2 - 4 đ', min: 2, max: 4, count: 0, color: '#fb923c' }, // Orange
    { range: '4 - 6 đ', min: 4, max: 6, count: 0, color: '#facc15' }, // Yellow
    { range: '6 - 8 đ', min: 6, max: 8, count: 0, color: '#38bdf8' }, // Sky
    { range: '8 - 10 đ', min: 8, max: 10.01, count: 0, color: '#10b981' }, // Emerald
  ];

  submissions.forEach((sub) => {
    const score = sub.totalScore ?? 0;
    for (const b of brackets) {
      if (score >= b.min && score < b.max) {
        b.count++;
        break;
      }
    }
  });

  const totalGraded = submissions.filter((s) => s.totalScore !== undefined).length;

  if (totalGraded === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <BarChart3 className="h-8 w-8 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">Chưa có đủ dữ liệu để vẽ biểu đồ phổ điểm</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Phổ điểm thi (Score Distribution)
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Tổng số bài: <strong className="text-blue-600">{totalGraded}</strong>
        </span>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={brackets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="range"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value} bài thi`, 'Số lượng']}
              contentStyle={{
                backgroundColor: '#1e293b',
                color: '#fff',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {brackets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
