import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Award, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  Trash2, 
  Download, 
  Sparkles, 
  RefreshCcw, 
  Search, 
  Calendar,
  Layers,
  Check,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocalCompletionRecord } from '../types';

// Structured realistic mock data generator for Vietnamese classroom simulation
const PREMADE_MOCKS = [
  {
    studentName: "Nguyễn Văn An",
    studentId: "SV10293",
    studentClass: "K68-CNTT3",
    quizScore: 4,
    totalQuizQuestions: 5,
    quickChecksAnswered: 4,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 3,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 3,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 1.5 days ago
    bloomBreakdown: {
      rememberUnderstand: { correct: 2, total: 2 },
      apply: { correct: 1, total: 2 },
      evaluate: { correct: 1, total: 1 }
    }
  },
  {
    studentName: "Trần Thị Mai Anh",
    studentId: "SV10344",
    studentClass: "K68-MKT1",
    quizScore: 5,
    totalQuizQuestions: 5,
    quickChecksAnswered: 4,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 3,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 3,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(), // 1 day ago
    bloomBreakdown: {
      rememberUnderstand: { correct: 2, total: 2 },
      apply: { correct: 2, total: 2 },
      evaluate: { correct: 1, total: 1 }
    }
  },
  {
    studentName: "Lê Minh Đức",
    studentId: "SV11382",
    studentClass: "K68-CNTT3",
    quizScore: 3,
    totalQuizQuestions: 5,
    quickChecksAnswered: 2,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 2,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 1,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), // hours ago
    bloomBreakdown: {
      rememberUnderstand: { correct: 1, total: 2 },
      apply: { correct: 1, total: 2 },
      evaluate: { correct: 1, total: 1 }
    }
  },
  {
    studentName: "Phạm Thu Hương",
    studentId: "SV10211",
    studentClass: "K68-PTĐT",
    quizScore: 2,
    totalQuizQuestions: 5,
    quickChecksAnswered: 3,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 1,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 2,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // today
    bloomBreakdown: {
      rememberUnderstand: { correct: 1, total: 2 },
      apply: { correct: 1, total: 2 },
      evaluate: { correct: 0, total: 1 }
    }
  },
  {
    studentName: "Phan Hoàng Long",
    studentId: "SV11401",
    studentClass: "K68-CNTT1",
    quizScore: 5,
    totalQuizQuestions: 5,
    quickChecksAnswered: 4,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 3,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 3,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    bloomBreakdown: {
      rememberUnderstand: { correct: 2, total: 2 },
      apply: { correct: 2, total: 2 },
      evaluate: { correct: 1, total: 1 }
    }
  },
  {
    studentName: "Vũ Khánh Linh",
    studentId: "SV10222",
    studentClass: "K68-PTĐT",
    quizScore: 4,
    totalQuizQuestions: 5,
    quickChecksAnswered: 3,
    totalQuickChecks: 4,
    caseStudyTasksAnswered: 2,
    totalCaseStudyTasks: 3,
    reflectionsAnswered: 3,
    totalReflections: 3,
    completedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), // 1 hour ago
    bloomBreakdown: {
      rememberUnderstand: { correct: 2, total: 2 },
      apply: { correct: 1, total: 2 },
      evaluate: { correct: 1, total: 1 }
    }
  }
];

interface StatsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLessonTitle?: string;
  triggerRefreshStamp?: number;
}

export default function StatsDashboardModal({ 
  isOpen, 
  onClose, 
  currentLessonTitle,
  triggerRefreshStamp = 0
}: StatsDashboardModalProps) {
  
  const [completions, setCompletions] = useState<LocalCompletionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLessonFilter, setSelectedLessonFilter] = useState("all");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [activeTab, setActiveTab ] = useState<'overview' | 'submissions'>('overview');
  
  // Load local completion history
  const loadCompletions = () => {
    try {
      const stored = localStorage.getItem('interactflow_completions') || localStorage.getItem('teachflow_completions');
      if (stored) {
        setCompletions(JSON.parse(stored));
      } else {
        setCompletions([]);
      }
    } catch (e) {
      console.error("Failed to load completions:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCompletions();
    }
  }, [isOpen, triggerRefreshStamp]);

  // Alert/Toast controller
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Populate mock data for instant verification and demonstration
  const handleSeedMockData = () => {
    try {
      const lessonTitle = currentLessonTitle || "Khái niệm Lạm phát & Thất nghiệp trong Kinh tế Vĩ mô";
      
      const newMocks: LocalCompletionRecord[] = PREMADE_MOCKS.map((mock, idx) => ({
        id: `mock-${Date.now()}-${idx}`,
        lessonTitle: idx % 2 === 0 ? lessonTitle : "Nhập môn Câu lệnh điều kiện & Vòng lặp trong Python",
        ...mock,
      }));

      // Combine with existing
      const updated = [...completions, ...newMocks];
      localStorage.setItem('interactflow_completions', JSON.stringify(updated));
      setCompletions(updated);
      triggerToast("🎯 Đã tạo thành công 6 lượt làm bài giả lập sinh viên!");
    } catch (e) {
      console.error(e);
      triggerToast("❌ Không thể sinh dữ liệu mẫu");
    }
  };

  // Erase history
  const handleClearAllHistory = () => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa tất cả hồ sơ kết quả học tập của sinh viên tại trình duyệt này không?")) {
      try {
        localStorage.removeItem('interactflow_completions');
        localStorage.removeItem('teachflow_completions');
        setCompletions([]);
        triggerToast("🗑️ Đã xóa toàn bộ lịch sử hoàn thành!");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Delete individual record
  const handleDeleteRecord = (id: string) => {
    try {
      const updated = completions.filter(rec => rec.id !== id);
      localStorage.setItem('interactflow_completions', JSON.stringify(updated));
      setCompletions(updated);
      triggerToast("🗑️ Đã xóa bản ghi thành công.");
    } catch (e) {
      console.error(e);
    }
  };

  // Unique lists for filtering
  const distinctLessons = useMemo(() => {
    const list = new Set<string>();
    completions.forEach(c => {
      if (c.lessonTitle) list.add(c.lessonTitle);
    });
    return Array.from(list);
  }, [completions]);

  const distinctClasses = useMemo(() => {
    const list = new Set<string>();
    completions.forEach(c => {
      if (c.studentClass) list.add(c.studentClass.trim());
    });
    return Array.from(list).filter(Boolean);
  }, [completions]);

  // Filter application
  const filteredCompletions = useMemo(() => {
    return completions.filter(c => {
      const matchesSearch = 
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLesson = selectedLessonFilter === "all" || c.lessonTitle === selectedLessonFilter;
      const matchesClass = selectedClassFilter === "all" || c.studentClass.trim() === selectedClassFilter;

      return matchesSearch && matchesLesson && matchesClass;
    }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [completions, searchQuery, selectedLessonFilter, selectedClassFilter]);

  // Aggregate stats calculations
  const stats = useMemo(() => {
    const count = filteredCompletions.length;
    if (count === 0) return {
      total: 0,
      averageScore: 0,
      passingRate: 0,
      scoreCounts: [0, 0, 0, 0, 0, 0], // index corresponding to score 0 to 5
      activityCompletions: { quickCheck: 0, caseStudy: 0, reflection: 0 },
      bloomBreakdown: {
        rememberUnderstand: { correct: 0, total: 0, rate: 0 },
        apply: { correct: 0, total: 0, rate: 0 },
        evaluate: { correct: 0, total: 0, rate: 0 }
      }
    };

    let totalScore = 0;
    let passingCount = 0;
    const scoreDistribution = [0, 0, 0, 0, 0, 0];
    
    let quickCheckSum = 0;
    let caseStudySum = 0;
    let reflectionSum = 0;

    let bloomRUCorrect = 0, bloomRUTotal = 0;
    let bloomApplyCorrect = 0, bloomApplyTotal = 0;
    let bloomEvalCorrect = 0, bloomEvalTotal = 0;

    filteredCompletions.forEach(c => {
      // Scores
      totalScore += c.quizScore;
      if (c.quizScore >= 3) passingCount++;
      
      const cappedQuizScore = Math.max(0, Math.min(5, Math.round(c.quizScore)));
      scoreDistribution[cappedQuizScore]++;

      // Activities completeness percentage
      if (c.quickChecksAnswered > 0) quickCheckSum++;
      if (c.caseStudyTasksAnswered > 0) caseStudySum++;
      if (c.reflectionsAnswered > 0) reflectionSum++;

      // Bloom breakdown
      if (c.bloomBreakdown) {
        bloomRUCorrect += c.bloomBreakdown.rememberUnderstand.correct;
        bloomRUTotal += c.bloomBreakdown.rememberUnderstand.total;
        bloomApplyCorrect += c.bloomBreakdown.apply.correct;
        bloomApplyTotal += c.bloomBreakdown.apply.total;
        bloomEvalCorrect += c.bloomBreakdown.evaluate.correct;
        bloomEvalTotal += c.bloomBreakdown.evaluate.total;
      } else {
        // Approximate Bloom division based on total score (simulated logical split for default records)
        // Score: Index 0,1 -> level 1, Score 2,3 -> levels 1+2, Score 4,5 -> levels 1+2+3
        if (c.quizScore >= 1) { bloomRUCorrect += 1; bloomRUTotal += 2; }
        if (c.quizScore >= 2) { bloomRUCorrect += 1; }
        if (c.quizScore >= 3) { bloomApplyCorrect += 1; bloomApplyTotal += 2; }
        if (c.quizScore >= 4) { bloomApplyCorrect += 1; }
        if (c.quizScore >= 5) { bloomEvalCorrect += 1; bloomEvalTotal += 1; } else { bloomEvalTotal += 1; }
      }
    });

    const averageScore = Number((totalScore / count).toFixed(1));
    const passingRate = Math.round((passingCount / count) * 100);

    return {
      total: count,
      averageScore,
      passingRate,
      scoreCounts: scoreDistribution,
      activityCompletions: {
        quickCheck: Math.round((quickCheckSum / count) * 100),
        caseStudy: Math.round((caseStudySum / count) * 100),
        reflection: Math.round((reflectionSum / count) * 100)
      },
      bloomBreakdown: {
        rememberUnderstand: {
          correct: bloomRUCorrect,
          total: bloomRUTotal,
          rate: bloomRUTotal > 0 ? Math.round((bloomRUCorrect / bloomRUTotal) * 100) : 0
        },
        apply: {
          correct: bloomApplyCorrect,
          total: bloomApplyTotal,
          rate: bloomApplyTotal > 0 ? Math.round((bloomApplyCorrect / bloomApplyTotal) * 100) : 0
        },
        evaluate: {
          correct: bloomEvalCorrect,
          total: bloomEvalTotal,
          rate: bloomEvalTotal > 0 ? Math.round((bloomEvalCorrect / bloomEvalTotal) * 100) : 0
        }
      }
    };
  }, [filteredCompletions]);

  // Export UTF-8 CSV with BOM for Vietnamese compatibility inside Excel
  const handleExportCSV = () => {
    if (filteredCompletions.length === 0) {
      triggerToast("⚠️ Không có dữ liệu để xuất.");
      return;
    }

    try {
      let csvContent = "\uFEFF"; // UTF-8 BOM
      csvContent += "Tên Học Sinh,Mã Sinh Viên,Lớp,Bài Học,Điểm Trắc Nghiệm,Phản Hồi Khởi Động,Check-Hiểu (Hoàn thành),Bài tập Tình Huống (Hoàn thành),Câu Hỏi Tự Suy Ngẫm (Hoàn thành),Thời Gian Nộp Lần Cuối\n";

      filteredCompletions.forEach(c => {
        const row = [
          `"${c.studentName.replace(/"/g, '""')}"`,
          `"${c.studentId.replace(/"/g, '""')}"`,
          `"${c.studentClass.replace(/"/g, '""')}"`,
          `"${c.lessonTitle.replace(/"/g, '""')}"`,
          `"${c.quizScore}/${c.totalQuizQuestions}"`,
          c.quickChecksAnswered > 0 ? "Đã Nộp" : "Chưa làm",
          `"${c.quickChecksAnswered}/${c.totalQuickChecks}"`,
          `"${c.caseStudyTasksAnswered}/${c.totalCaseStudyTasks}"`,
          `"${c.reflectionsAnswered}/${c.totalReflections}"`,
          `"${new Date(c.completedAt).toLocaleString('vi-VN')}"`
        ];
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Diem_So_Hoc_Sinh_InteractFlow_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("📥 Đã tải xuống tệp Excel CSV!");
    } catch (e) {
      console.error(e);
      triggerToast("❌ Không thể xuất tệp CSV");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-md">
              <Award className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                Bảng Thống Kê Điểm Số & Tiến Trình Tự Học
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 py-0.5 px-2 rounded-full font-bold uppercase tracking-wider">Cục bộ</span>
              </h2>
              <p className="text-[10px] text-slate-300">Tổng hợp dữ liệu rèn luyện và mức độ thuần thục của sinh viên</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar with Filters */}
        <div className="bg-slate-50 border-b p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-center justify-between flex-shrink-0">
          {/* Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Thống kê sơ bộ
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'submissions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Users className="w-3.5 h-3.5" /> Lượt nộp bài ({filteredCompletions.length})
            </button>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Filter Lesson */}
            <select
              value={selectedLessonFilter}
              onChange={(e) => setSelectedLessonFilter(e.target.value)}
              className="bg-white border rounded-lg text-xs py-1.5 px-2.5 max-w-[180px] text-ellipsis overflow-hidden focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="all">📚 Tất cả bài học</option>
              {distinctLessons.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>

            {/* Filter Class */}
            {distinctClasses.length > 0 && (
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-white border rounded-lg text-xs py-1.5 px-2.5 max-w-[120px] text-ellipsis overflow-hidden focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">👥 Tất cả lớp</option>
                {distinctClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            )}

            {/* Simulated generation / Clear Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              {completions.length === 0 && (
                <button
                  onClick={handleSeedMockData}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all animate-bounce"
                  title="Tạo sẵn mẫu dữ liệu thực tế để xem ngay chức năng biểu đồ phân tích"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Giả lập dữ liệu
                </button>
              )}
              {completions.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  title="Xuất bảng Excel lưu lữu trữ"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất Excel
                </button>
              )}
              {completions.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 rounded-lg hover:text-rose-900 cursor-pointer transition-all"
                  title="Xóa toàn bộ kết quả"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow bg-slate-50/45 space-y-6">
          
          {/* Active Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs flex items-center gap-2 shadow-lg max-w-md mx-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{showToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zero state feedback */}
          {completions.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto border shadow-inner">
                <Award className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-700">Chưa ghi nhận bài nộp nào</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Lịch sử điểm số đang trống. Giáo án tương tác HTML sẽ lưu kết quả tại đây khi có học sinh làm bài hoặc bạn tiến hành nhấn <strong>Nộp bài</strong> dưới tab xem thử.
                </p>
              </div>
              <button
                onClick={handleSeedMockData}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" /> Giả lập nhanh 6 học sinh làm bài
              </button>
            </div>
          ) : filteredCompletions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-medium bg-white rounded-xl border">
              🔍 Không tìm thấy bản ghi nào khớp với điều kiện tìm kiếm/bộ lọc hiện bộc lộ.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW METRICS */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Bento Grid Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* KPI 1: Completions Count */}
                    <div className="bg-white border p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Lượt nộp bài</span>
                        <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">{stats.total} <span className="text-xs font-bold text-slate-400">lượt</span></div>
                        <p className="text-[9px] text-emerald-600 font-semibold">Tích lũy đầy đủ trong phiên</p>
                      </div>
                      <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shadow-inner">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                    </div>

                    {/* KPI 2: Mean Quiz score */}
                    <div className="bg-white border p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Điểm Quiz TB</span>
                        <div className="text-2xl font-black text-slate-800 font-mono tracking-tight flex items-baseline gap-1.5">
                          {stats.averageScore}
                          <span className="text-xs font-bold text-slate-400">/ 5 c.hỏi</span>
                        </div>
                        <p className="text-[9px] text-slate-500">Độ chuẩn tương đương {Math.round((stats.averageScore/5)*100)}%</p>
                      </div>
                      <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>

                    {/* KPI 3: Passing rate */}
                    <div className="bg-white border p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block">Tỷ lệ đạt (≥ 3/5)</span>
                        <div className="text-2xl font-black font-mono tracking-tight flex items-baseline gap-1">
                          <span className={stats.passingRate >= 75 ? "text-emerald-600" : stats.passingRate >= 50 ? "text-amber-600" : "text-rose-600"}>
                            {stats.passingRate}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium">Mục tiêu sư phạm đại học đề ra là 75%</p>
                      </div>
                      <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Charts & Bloom mastery breakdown widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Visual 1: Custom SVG Score Distribution Bar Chart */}
                    <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-750 flex items-center gap-1 uppercase tracking-wider">
                          <BarChart3 className="w-4 h-4 text-slate-500" /> Biểu đồ phổ điểm (Score Distribution)
                        </h4>
                        <p className="text-[9px] text-slate-400">Phân bố số lượng sinh viên đạt từ 0 đến 5 điểm</p>
                      </div>

                      {/* Score distribution SVG columns */}
                      <div className="h-44 flex items-end justify-between px-3 pt-6 border-b pb-2">
                        {stats.scoreCounts.map((countVal, scoreIdx) => {
                          const maxCount = Math.max(...stats.scoreCounts) || 1;
                          const pct = (countVal / maxCount) * 100;
                          
                          return (
                            <div key={scoreIdx} className="flex flex-col items-center flex-grow group mx-1.5 max-w-[45px]">
                              {/* Hover Tooltip showing exact quantity */}
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 mb-1 px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold absolute transform -translate-y-9 pointer-events-none shadow-md z-1">
                                {countVal} sinh viên
                              </div>
                              
                              {/* Glowing column representing the student count */}
                              <div 
                                style={{ height: `${Math.max(5, pct)}%` }}
                                className={`w-full rounded-t-lg transition-all duration-500 transform origin-bottom hover:scale-x-105 ${
                                  scoreIdx >= 4 
                                    ? "bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:shadow-[0_0_10px_rgba(20,184,166,0.3)]" 
                                    : scoreIdx >= 3 
                                    ? "bg-gradient-to-t from-indigo-500 to-blue-400 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
                                    : "bg-gradient-to-t from-orange-400 to-amber-350"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* X-axis labels indicating scores */}
                      <div className="flex justify-between px-3 text-[10px] font-black text-slate-500 font-mono">
                        {stats.scoreCounts.map((_, idx) => (
                          <div key={idx} className="flex-grow text-center max-w-[45px] mx-1.5">
                            {idx}đ
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-4 text-[10px] font-bold pt-1.5 border-t">
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Giỏi (4-5đ)
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-505 block bg-indigo-500" /> Khá/Đạt (3đ)
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 block" /> Yêu cầu rèn luyện (0-2đ)
                        </span>
                      </div>
                    </div>

                    {/* Visual 2: Cognitive Mastery Bloom Taxonomy Breakdown */}
                    <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-750 flex items-center gap-1 uppercase tracking-wider">
                          <Layers className="w-4 h-4 text-slate-500" /> Độ chín chắn học thuật (Cognitive Bloom Level)
                        </h4>
                        <p className="text-[9px] text-slate-400">Độ chuẩn xác trung bình chia theo các khía cạnh nhận thức Bloom</p>
                      </div>

                      <div className="space-y-3 flex-grow justify-center flex flex-col">
                        {/* Bloom 1: RU */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">Mức 1: Nhớ & Hiểu</span>
                            <span className="font-mono font-bold text-teal-600">{stats.bloomBreakdown.rememberUnderstand.rate}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                            <div 
                              style={{ width: `${stats.bloomBreakdown.rememberUnderstand.rate}%` }} 
                              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block">Định nghĩa phần cứng, khái niệm lõi, thuật ngữ</span>
                        </div>

                        {/* Bloom 2: Apply */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">Mức 2: Vận dụng cơ bản</span>
                            <span className="font-mono font-bold text-indigo-600">{stats.bloomBreakdown.apply.rate}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                            <div 
                              style={{ width: `${stats.bloomBreakdown.apply.rate}%` }} 
                              className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block">Viết câu lệnh mẫu, tính toán thông số cụ thể</span>
                        </div>

                        {/* Bloom 3: Evaluate */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">Mức 3: Đánh giá & Ra quyết định</span>
                            <span className="font-mono font-bold text-violet-600">{stats.bloomBreakdown.evaluate.rate}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border">
                            <div 
                              style={{ width: `${stats.bloomBreakdown.evaluate.rate}%` }} 
                              className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block">Chọn hướng biện giải trong tình huống, gỡ lỗi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual 3: Task Activity completions percentage */}
                  <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <h4 className="text-xs font-black text-slate-700 mb-3 uppercase tracking-wider">Tỷ lệ tương tác các hoạt động đi kèm (Task Engagement Rate)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Activity 1 */}
                      <div className="p-3 border rounded-xl bg-slate-50 flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400">Recall (Slide Quick-check)</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-bold font-mono text-slate-800">{stats.activityCompletions.quickCheck}%</span>
                          <span className="text-[9px] text-emerald-600 font-bold">Lượt làm</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-2">
                          <div style={{ width: `${stats.activityCompletions.quickCheck}%` }} className="bg-teal-500 h-full rounded" />
                        </div>
                      </div>

                      {/* Activity 2 */}
                      <div className="p-3 border rounded-xl bg-slate-50 flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400">Case Study Workspace</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-bold font-mono text-slate-800">{stats.activityCompletions.caseStudy}%</span>
                          <span className="text-[9px] text-indigo-600 font-bold">Lượt nộp</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-2">
                          <div style={{ width: `${stats.activityCompletions.caseStudy}%` }} className="bg-indigo-500 h-full rounded" />
                        </div>
                      </div>

                      {/* Activity 3 */}
                      <div className="p-3 border rounded-xl bg-slate-50 flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400">Self-Reflection Forms</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-bold font-mono text-slate-800">{stats.activityCompletions.reflection}%</span>
                          <span className="text-[9px] text-purple-600 font-bold">Tài liệu nộp</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded overflow-hidden mt-2">
                          <div style={{ width: `${stats.activityCompletions.reflection}%` }} className="bg-purple-500 h-full rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: MEMBERS AND DETAIL SUBMISSIONS TABLE */}
              {activeTab === 'submissions' && (
                <div className="space-y-4 animate-fade-in bg-white border rounded-xl overflow-hidden shadow-sm">
                  
                  {/* Internal Table Search filter bar */}
                  <div className="p-4 bg-slate-50 border-b flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm học sinh theo tên, MSSV, lớp..."
                        className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:inline">
                      Hiển thị {filteredCompletions.length} trên {completions.length}
                    </span>
                  </div>

                  {/* Submission Table container */}
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-black tracking-wider">
                          <th className="p-3.5 pl-4">Học sinh</th>
                          <th className="p-3.5">Mã số / lớp</th>
                          <th className="p-3.5">Bài học</th>
                          <th className="p-3.5 text-center">Quiz Score</th>
                          <th className="p-3.5 text-center">Recall check</th>
                          <th className="p-3.5 text-center">Case Study / Phản hồi</th>
                          <th className="p-3.5 text-center">Thời gian</th>
                          <th className="p-3.5 pr-4 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCompletions.map((rec) => {
                          const isHigh = rec.quizScore >= 4;
                          const isOk = rec.quizScore >= 3;
                          
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-all font-semibold">
                              {/* Student Name */}
                              <td className="p-3.5 pl-4">
                                <div className="space-y-0.5">
                                  <div className="font-black text-slate-800">{rec.studentName}</div>
                                  <div className="text-[9px] text-slate-400 font-mono">Bản ghi: #{rec.id.slice(-6)}</div>
                                </div>
                              </td>

                              {/* Student ID & Class */}
                              <td className="p-3.5">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block text-[10px] border border-slate-150">{rec.studentId || "N/A"}</div>
                                  <div className="text-[10px] text-slate-500 italic block">{rec.studentClass || "Chưa phân lớp"}</div>
                                </div>
                              </td>

                              {/* Lesson */}
                              <td className="p-3.5 max-w-[180px] truncate" title={rec.lessonTitle}>
                                <div className="text-slate-700 font-medium truncate text-xs">
                                  {rec.lessonTitle}
                                </div>
                              </td>

                              {/* Quiz assessment score */}
                              <td className="p-3.5 text-center">
                                <span className={`inline-flex items-center justify-center w-9 h-6 font-mono text-[11px] font-bold rounded-lg border ${
                                  isHigh 
                                    ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
                                    : isOk 
                                    ? "bg-blue-50 border-blue-250 text-blue-800" 
                                    : "bg-rose-50 border-rose-250 text-rose-800"
                                }`}>
                                  {rec.quizScore} / {rec.totalQuizQuestions}
                                </span>
                              </td>

                              {/* Recall check-in metrics count */}
                              <td className="p-3.5 text-center font-mono text-slate-600 text-[11px]">
                                {rec.quickChecksAnswered} / {rec.totalQuickChecks} Slide
                              </td>

                              {/* Case worksheet solved tasks count */}
                              <td className="p-3.5 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-[10px] text-slate-600 block">
                                    Case: <strong>{rec.caseStudyTasksAnswered || 0}/3</strong>
                                  </span>
                                  <span className="text-[10px] text-slate-600 block">
                                    Ngẫm: <strong>{rec.reflectionsAnswered || 0}/3</strong>
                                  </span>
                                </div>
                              </td>

                              {/* Completed at time */}
                              <td className="p-3.5 text-center text-slate-450 font-medium whitespace-nowrap text-[10px]">
                                <div className="flex items-center gap-1 justify-center">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(rec.completedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  {new Date(rec.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              {/* Action - Trash to delete */}
                              <td className="p-3.5 pr-4 text-center">
                                <button
                                  onClick={() => handleDeleteRecord(rec.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer border border-transparent hover:border-rose-100"
                                  title="Xóa lượt này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* Modal academic footer information banner */}
        <div className="bg-slate-100 flex justify-between items-center px-4 sm:px-6 py-3.5 border-t text-[11px] text-slate-500 font-medium flex-shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Thống kê này hoàn toàn khép kín và lưu trong LocalStorage trên trình duyệt của giảng viên.</span>
          </div>
          <div>
            <span><strong>Dữ liệu tổng:</strong> {completions.length} bài học sinh nộp</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
