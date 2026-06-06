import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Download, 
  Check, 
  RotateCcw, 
  FileCode, 
  HelpCircle, 
  Send, 
  Eye, 
  Layers, 
  Lightbulb, 
  BookMarked, 
  Award, 
  PenTool, 
  ChevronRight,
  AlertCircle,
  UploadCloud,
  FileText,
  X,
  Search,
  Zap,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StructuredLesson, QuizQuestion, LocalCompletionRecord } from './types';
import StatsDashboardModal from './components/StatsDashboardModal';
import { PRESET_SAMPLES, PresetSample } from './constants/presets';


export default function App() {
  // Input settings states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [objectives, setObjectives] = useState("");
  const [content, setContent] = useState("");
  
  // Interactions Selection States
  const [enableWarmUp, setEnableWarmUp] = useState(true);
  const [enableQuiz, setEnableQuiz] = useState(true);
  const [enableCaseStudy, setEnableCaseStudy] = useState(true);
  const [enableReflection, setEnableReflection] = useState(true);
  const [enableFlashcards, setEnableFlashcards] = useState(true);

  // App running states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [metadataWarning, setMetadataWarning] = useState<string | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<StructuredLesson | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html-code'>('editor');
  
  // Two-part editor step workflow states (v2.0)
  const [editorStep, setEditorStep] = useState<'generate' | 'edit'>('generate');
  const [editSectionTab, setEditSectionTab] = useState<'general' | 'slides' | 'quiz' | 'warmup' | 'casestudy' | 'reflection'>('general');
  const [editingSlideIndex, setEditingSlideIndex] = useState<number>(0);
  
  // Preview State (inside the App for Lecturer test-flight)
  const [previewTab, setPreviewTab] = useState<'intro' | 'warmup' | 'sections' | 'flashcards' | 'quiz' | 'casestudy' | 'reflection' | 'submit'>('intro');
  const [previewSectionIdx, setPreviewSectionIdx] = useState(0);
  const [previewQuizAnswers, setPreviewQuizAnswers] = useState<Record<number, string>>({});
  const [previewQuizScore, setPreviewQuizScore] = useState(0);
  const [previewFlippedFlashcards, setPreviewFlippedFlashcards] = useState<Record<number, boolean>>({});
  const [previewStudentResponses, setPreviewStudentResponses] = useState<string[]>(["", "", ""]);
  const [previewStudentName, setPreviewStudentName] = useState("");
  const [previewStudentId, setPreviewStudentId] = useState("");
  const [previewStudentClass, setPreviewStudentClass] = useState("");
  const [previewQuickCheckAnswers, setPreviewQuickCheckAnswers] = useState<Record<number, string>>({});
  const [previewCaseStudyAnswers, setPreviewCaseStudyAnswers] = useState<Record<number, string>>({});
  const [isLecturerMode, setIsLecturerMode] = useState(false);
  const [allowStudentHints, setAllowStudentHints] = useState(true);
  const [previewShowHints, setPreviewShowHints] = useState<Record<number, boolean>>({});
  const [previewShowModelAnswer, setPreviewShowModelAnswer] = useState<Record<number, boolean>>({});
  const [previewShowCaseHint, setPreviewShowCaseHint] = useState<Record<number, boolean>>({});
  const [previewShowCaseModel, setPreviewShowCaseModel] = useState<Record<number, boolean>>({});
  const [slideMode, setSlideMode] = useState(true);
  const [slideTheme, setSlideTheme] = useState<'light' | 'dark'>('light');
  const [showNotification, setShowNotification] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [googleFormUrl, setGoogleFormUrl] = useState("https://docs.google.com/forms/d/e/1FAIpQLSfD_g0qRHe9Nfndb9fR2eT3r-pE891rXclh1Cg/viewform");
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsRefreshStamp, setStatsRefreshStamp] = useState(0);


  // Global app-level live style customizer states (Emerald/Teal, Grid, Sans, Normal is the default)
  const [appTheme, setAppTheme] = useState<'emerald' | 'ocean' | 'sunset' | 'mystic' | 'rose'>('ocean');
  const [appBackground, setAppBackground] = useState<'grid' | 'minimal' | 'glass' | 'neon'>('glass');
  const [appFont, setAppFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [appFontSize, setAppFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Custom API Key from user (persists in localStorage, supports Vercel environments seamlessly)
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem("GEMINI_API_KEY") || "";
  });

  useEffect(() => {
    localStorage.setItem("GEMINI_API_KEY", customApiKey);
  }, [customApiKey]);

  // Selected Gemini model from user (persists in localStorage)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("GEMINI_SELECTED_MODEL") || "gemini-2.5-flash";
  });

  useEffect(() => {
    localStorage.setItem("GEMINI_SELECTED_MODEL", selectedModel);
  }, [selectedModel]);

  // helper definitions for simulated preview styling
  const themeColorsSim = {
    emerald: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'text-emerald-700',
      accentText: 'text-emerald-600',
      bgLight: 'bg-emerald-50/70 border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-800',
      text: 'text-emerald-800',
      borderActive: 'border-emerald-500',
      fill: '#059669',
      gradient: 'from-teal-500 via-emerald-500 to-indigo-500',
      accentBg: 'bg-emerald-500/10'
    },
    ocean: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      accent: 'text-blue-700',
      accentText: 'text-blue-600',
      bgLight: 'bg-blue-50/70 border-blue-100',
      badge: 'bg-blue-100 text-blue-800',
      text: 'text-blue-800',
      borderActive: 'border-blue-500',
      fill: '#2563eb',
      gradient: 'from-sky-500 via-blue-500 to-indigo-500',
      accentBg: 'bg-blue-500/10'
    },
    sunset: {
      primary: 'bg-orange-600 hover:bg-orange-700 text-white',
      accent: 'text-orange-750',
      accentText: 'text-orange-600',
      bgLight: 'bg-orange-50/70 border-orange-100',
      badge: 'bg-orange-100 text-orange-900',
      text: 'text-orange-900',
      borderActive: 'border-orange-500',
      fill: '#ea580c',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      accentBg: 'bg-orange-500/10'
    },
    mystic: {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white',
      accent: 'text-purple-750',
      accentText: 'text-purple-600',
      bgLight: 'bg-purple-50/70 border-purple-100',
      badge: 'bg-purple-100 text-purple-800',
      text: 'text-purple-800',
      borderActive: 'border-purple-500',
      fill: '#7c3aed',
      gradient: 'from-fuchsia-400 via-purple-500 to-indigo-500',
      accentBg: 'bg-purple-500/10'
    },
    rose: {
      primary: 'bg-rose-600 hover:bg-rose-700 text-white',
      accent: 'text-rose-750',
      accentText: 'text-rose-600',
      bgLight: 'bg-rose-50/70 border-rose-100',
      badge: 'bg-rose-100 text-rose-800',
      text: 'text-rose-800',
      borderActive: 'border-rose-500',
      fill: '#db2777',
      gradient: 'from-pink-400 via-rose-500 to-red-500',
      accentBg: 'bg-rose-500/10'
    }
  };

  const getSimFontSizeClass = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    if (appFontSize === 'normal') {
      if (size === 'xs') return 'text-[10px] sm:text-[11px]';
      if (size === 'sm') return 'text-xs';
      if (size === 'md') return 'text-xs sm:text-sm';
      if (size === 'lg') return 'text-sm sm:text-base';
      if (size === 'xl') return 'text-base sm:text-lg';
    } else if (appFontSize === 'large') {
      if (size === 'xs') return 'text-xs';
      if (size === 'sm') return 'text-xs sm:text-sm';
      if (size === 'md') return 'text-sm sm:text-base';
      if (size === 'lg') return 'text-base sm:text-lg';
      if (size === 'xl') return 'text-lg sm:text-xl';
    } else if (appFontSize === 'xlarge') {
      if (size === 'xs') return 'text-xs sm:text-sm';
      if (size === 'sm') return 'text-sm sm:text-base';
      if (size === 'md') return 'text-base sm:text-lg';
      if (size === 'lg') return 'text-lg sm:text-xl';
      if (size === 'xl') return 'text-xl sm:text-2xl';
    }
    return 'text-sm';
  };

  const getSimCardClass = () => {
    switch (appBackground) {
      case 'neon': return 'bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm';
      case 'glass': return 'backdrop-blur-md bg-white/70 border border-white/40 shadow-lg rounded-2xl p-4 sm:p-5';
      case 'minimal': return 'bg-white border border-slate-250 rounded-2xl p-4 sm:p-5';
      case 'grid': return 'bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm';
    }
    return 'bg-white border shadow-sm rounded-2xl p-4 sm:p-5';
  };

  // Process loading preset
  const handleLoadPreset = (preset: PresetSample) => {
    setTitle(preset.title);
    setSubject(preset.subject);
    setLevel(preset.level);
    setDuration(preset.duration);
    setObjectives(preset.objectives);
    setContent(preset.content);
    // If they load a preset, clear the uploaded file to avoid confusing state
    setUploadedFile(null);
    setSelectedSection("");
  };

  // Modern File Upload Module States & Handlers
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; mimeType: string; data: string } | null>(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [detectedSections, setDetectedSections] = useState<string[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [quickLoadTab, setQuickLoadTab] = useState<'upload' | 'samples'>('upload');

  const [aiExpertTopic, setAiExpertTopic] = useState("");
  const [isGeneratingExpertTopic, setIsGeneratingExpertTopic] = useState(false);

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt': return 'text/plain';
      case 'md': return 'text/markdown';
      case 'json': return 'application/json';
      default: return 'application/octet-stream';
    }
  };

  const parseRobustJsonClient = (text: string): any => {
    if (!text) return {};
    let cleaned = text.trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {}

    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {}

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {}
    }
    throw new Error("Dữ liệu trả về không thể phân tích thành cấu trúc JSON hợp lệ.");
  };

  const callGeminiDirectClient = async (
    apiKey: string,
    model: string,
    systemInstruction: string,
    contents: any[],
    responseSchema?: any
  ): Promise<any> => {
    let chosenModel = model || "gemini-2.5-flash";
    // models to try in case of fallback
    const modelsToTry = [chosenModel];
    if (chosenModel !== "gemini-2.5-flash") modelsToTry.push("gemini-2.5-flash");
    if (chosenModel !== "gemini-1.5-flash") modelsToTry.push("gemini-1.5-flash");

    const body: any = {
      contents: contents,
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    };

    if (responseSchema) {
      body.generationConfig.responseSchema = responseSchema;
    }

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    let lastErrorMsg = "Yêu cầu API thất bại";

    for (const m of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey.trim()}`;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          });

          if (!res.ok) {
            const errText = await res.text();
            let msg = "Yêu cầu API thất bại";
            try {
              const parsed = JSON.parse(errText);
              msg = parsed.error?.message || msg;
            } catch {
              msg = errText || msg;
            }
            
            if (res.status === 503 || msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || res.status === 429) {
              lastErrorMsg = msg;
              await new Promise(r => setTimeout(r, attempt * 2000));
              continue; // retry
            }
            throw new Error(msg);
          }

          const data = await res.json();
          const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!txt) {
            throw new Error("Không nhận được phản hồi dữ liệu từ mô hình AI.");
          }
          
          return parseRobustJsonClient(txt);
        } catch (err: any) {
          lastErrorMsg = err.message || String(err);
          // if it's transient, the inner loop would have continued.
          // Since it threw, it's not transient, or we exhausted retries.
          // Break attempt loop, try next model.
          break;
        }
      }
    }

    throw new Error(lastErrorMsg);
  };

  const fetchAndConfigureMetadata = async (mimeType: string, base64Data: string, filename: string) => {
    setIsAnalyzingFile(true);
    setGenerationError(null);
    setMetadataWarning(null);
    try {
      let meta;

      const decodeBinaryStringToUtf8 = (str: string): string => {
        try {
          const u8 = new Uint8Array(str.length);
          for (let i = 0; i < str.length; i++) {
            u8[i] = str.charCodeAt(i) & 0xFF;
          }
          return new TextDecoder("utf-8").decode(u8);
        } catch {
          return str;
        }
      };

      if (customApiKey && customApiKey.trim()) {
        const isTextExtractable = mimeType.includes("wordprocessingml") ||
                                 mimeType.includes("msword") ||
                                 mimeType.includes("presentationml") ||
                                 mimeType.includes("ms-powerpoint") ||
                                 mimeType.includes("officedocument") ||
                                 mimeType.includes("pdf") ||
                                 mimeType.includes("text") ||
                                 mimeType.includes("csv") ||
                                 mimeType.includes("json");

        const contents: any[] = [];
        
        if (isTextExtractable) {
          let extractedText = "";
          try {
            extractedText = decodeBinaryStringToUtf8(atob(base64Data));
          } catch {
            extractedText = "";
          }
          if (extractedText && extractedText.trim().length > 100) {
            if (extractedText.length > 35000) {
              extractedText = extractedText.substring(0, 35000) + "\n\n...(Nội dung bị lược bớt để phù hợp với định mức xử lý dữ liệu)...";
            }
            contents.push({
              parts: [{
                text: `NỘI DUNG TÀI LIỆU ĐÍNH KÈM (ĐÃ TRÍCH XUẤT THÀNH VĂN BẢN):\n\n${extractedText}`
              }]
            });
          } else {
            contents.push({
              parts: [{
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }]
            });
          }
        } else {
          contents.push({
            parts: [{
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }]
          });
        }

        contents.push({
          parts: [{
            text: `Bạn là trợ lý thiết kế giáo án số cao cấp hỗ trợ các nhà Sư phạm đại học Việt Nam. Hãy đọc kỹ tài liệu đính kèm này (PDF/PowerPoint/Word/Text) và phân tích tìm ra các giá trị để tự động cấu hình lại thông tin đại cương bài học hôm nay.\nHãy phản hồi CHÍNH XÁC một cấu trúc JSON sau đây phù hợp nhất với tài liệu được tải lên để tự động điều chỉnh cấu hình:\n{\n  "title": "Tiêu đề bài học hay, súc tích và bám rõ nhất vào nội dung cốt lõi của tài liệu tải lên (Ví dụ: 'Cấu trúc mảng trong C++' thay vì chỉ 'Mảng')",\n  "subject": "Tên môn học hoặc lĩnh vực học thuật tổng quát bao quát tài liệu tương thích nhất",\n  "level": "Trình độ sinh viên đề xuất của môn học này. Phải khớp chính xác với 1 trong các chuỗi sau đây: 'Sinh viên Năm 1-2' hoặc 'Sinh viên Năm 3-4' hoặc 'Giảng viên & Học viên Cao học' hoặc 'Phát triển năng lực nghề nghiệp'",\n  "duration": "Thời lượng tự học đề xuất ước tính bằng phút. Phải khớp chính xác với 1 trong các chuỗi sau đây: '30 phút', '45 phút', '60 phút', '90 phút' hoặc tự chọn phù hợp",\n  "objectives": "Các mục tiêu học tập bám sát thang đo Bloom sư phạm xuất sắc (mỗi mục tiêu viết gạch đầu dòng dòng mới, có từ 2-3 gạch đầu dòng dòng mới, viết thật chi tiết và chuyên nghiệp)",\n  "sections": ["Danh sách chứa từ 3 đến 6 tiêu đề chương, tiểu mục nhỏ hoặc slide có học liệu chi tiết thực tế tìm thấy trong tài liệu để giảng viên có thể click chọn dạy trong ngày (Ví dụ: 'Phần 3.2: Quy trình...', 'Chương 2:...'). Trích xuất trực tiếp từ các tiêu đề hiển thị trong file."]\n}`
          }]
        });

        meta = await callGeminiDirectClient(
          customApiKey,
          selectedModel,
          "Bạn là một học giả, giảng viên đại học xuất sắc, phân tích sâu các đề cương tài liệu học tập của Việt Nam để chuyển thành metadata đại cương trực tuyến dưới dạng JSON hợp lệ hoàn toàn.",
          contents,
          {
            type: "object",
            properties: {
              title: { type: "string" },
              subject: { type: "string" },
              level: { type: "string" },
              duration: { type: "string" },
              objectives: { type: "string" },
              sections: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["title", "subject", "level", "duration", "objectives", "sections"]
          }
        );
      } else {
        const response = await fetch("/api/analyze-metadata", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            file: { mimeType, data: base64Data },
            model: selectedModel
          })
        });

        if (!response.ok) {
          let errMsg = "Không thể phân tích tự động";
          try {
            const text = await response.text();
            try {
              const errJson = JSON.parse(text);
              errMsg = errJson.error || errMsg;
            } catch {
              if (response.status === 413 || text.toLowerCase().includes("too large") || text.toLowerCase().includes("payload too large")) {
                errMsg = "Dung lượng tệp quá lớn để gửi qua máy chủ trung gian (Vercel giới hạn tối đa 4.5MB). Vui lòng thử tệp nhỏ hơn hoặc dán trực tiếp nội dung bài học.";
              } else {
                errMsg = `${response.status} - ${text.substring(0, 100)}`;
              }
            }
          } catch {
            errMsg = `Lỗi hệ thống (${response.status})`;
          }
          throw new Error(errMsg);
        }

        meta = await response.json();
      }
      
      if (meta.fallback) {
        setMetadataWarning("⚠️ Giới hạn lượt gọi API Gemini hiện tại đã vượt quá (429 Quota Exceeded). Hệ thống đã tự chọn tiêu đề theo tên tệp để bạn có thể chỉnh sửa thủ công mà không bị gián đoạn.");
        const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        setDetectedSections([]);
        return;
      }

      if (meta.title) setTitle(meta.title);
      if (meta.subject) setSubject(meta.subject);
      if (meta.level) setLevel(meta.level);
      if (meta.duration) setDuration(meta.duration);
      if (meta.objectives) setObjectives(meta.objectives);
      if (meta.sections && Array.isArray(meta.sections)) {
        setDetectedSections(meta.sections);
      } else {
        setDetectedSections([]);
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      console.warn("Auto analyze metadata warning:", errMsg);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        setMetadataWarning("⚠️ Giới hạn lượt gọi API Gemini hiện tại đã vượt quá (429 Quota Exceeded). Hệ thống đã tự chọn tiêu đề theo tên tệp để bạn có thể chỉnh sửa thủ công mà không bị gián đoạn.");
      } else {
        setMetadataWarning("⚠️ AI không thể tự động nhận dạng chương mục bài viết (Lỗi: " + (errMsg.length > 100 ? errMsg.substring(0, 100) + "..." : errMsg) + "). Tiêu đề đã được thiết lập theo tên tệp.");
      }
      // Fallback: Use file name to guess title if analyze fails
      const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      setDetectedSections([]);
    } finally {
      setIsAnalyzingFile(false);
    }
  };



  const processFile = async (file: File) => {
    setIsFileLoading(true);
    setGenerationError(null);

    // Limit direct upload payload base64 size to prevent Vercel 4.5MB crashes
    const MAX_UPLOAD_SIZE = 3.0 * 1024 * 1024; // 3.0 MB

    if (file.size > MAX_UPLOAD_SIZE) {
      setGenerationError(
        `Kích thước tệp tin (${(file.size / (1024 * 1024)).toFixed(1)}MB) quá lớn so với giới hạn tải lên trực tiếp của hạ tầng (tối đa 3.0MB). ` +
        `Bạn có thể: 1) Giảm dung lượng tệp; 2) Chia nhỏ tệp; hoặc 3) Sao chép văn bản và dán trực tiếp vào khung nhập liệu.`
      );
      setIsFileLoading(false);
      return;
    }

    const mime = file.type || getMimeType(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsFileLoading(false);
        return;
      }

      const base64Data = result.split(',')[1];
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        mimeType: mime,
        data: base64Data
      });

      // Clear manually typed content, AI will stick to uploaded documents
      setContent("");
      setIsFileLoading(false);
      fetchAndConfigureMetadata(mime, base64Data, file.name);
    };

    reader.onerror = () => {
      setGenerationError("Không thể đọc tệp tin. Vui lòng thử lại.");
      setIsFileLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Convert markdown strings to HTML elegantly for client-side display with ReactMarkdown
  const renderMarkdown = (text: string) => {
    if (!text) return "";
    return (
      <div className="markdown-body text-slate-700 leading-relaxed text-sm">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-xl sm:text-2xl font-black text-emerald-800 mt-6 mb-3 font-serif tracking-tight border-b-2 border-emerald-100 pb-1.5" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-5 mb-2.5 font-serif border-l-4 border-emerald-500 pl-3 py-0.5" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-4 mb-2 font-serif" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-sm sm:text-base font-bold text-slate-700 mt-3 mb-1" {...props} />,
            p: ({ node, ...props }) => <p className="mt-2.5 mb-2.5 text-slate-650 leading-relaxed text-xs sm:text-sm font-medium whitespace-pre-line" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-3 space-y-1 text-slate-650 text-xs sm:text-sm font-medium" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-3 space-y-1 text-slate-650 text-xs sm:text-sm font-medium" {...props} />,
            li: ({ node, ...props }) => <li className="text-slate-650 text-xs sm:text-sm font-medium whitespace-pre-line" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-extrabold text-slate-900 bg-emerald-50/50 px-1 py-0.5 rounded" {...props} />,
            em: ({ node, ...props }) => <em className="italic text-slate-800" {...props} />,
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-4 py-1.5 my-3 bg-slate-50 italic rounded-r-lg text-slate-600 text-xs sm:text-sm font-medium" {...props} />,
            code: ({ node, ...props }) => (
              <code className="bg-slate-100 text-red-600 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-3 my-3 rounded-xl overflow-x-auto border border-slate-800" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm max-w-full">
                <table className="w-full text-left border-collapse" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-slate-100 border-b border-slate-200" {...props} />,
            tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-100 bg-white" {...props} />,
            tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/80 transition-all even:bg-slate-50/30" {...props} />,
            th: ({ node, ...props }) => <th className="px-3.5 py-2 text-slate-800 text-xs font-black uppercase tracking-wider border-r border-slate-200 last:border-r-0" {...props} />,
            td: ({ node, ...props }) => <td className="px-3.5 py-2.5 text-slate-655 text-xs font-semibold leading-relaxed border-r border-slate-100 last:border-r-0 whitespace-pre-line" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  // Interface for Parsed Bento details
  interface ParsedBentoContent {
    hero: string;
    layoutType: 'grid' | 'timeline' | 'twocolumn' | 'hero-only' | 'comparison' | 'list-block';
    points: { title: string; body: string }[];
    takeaway: string;
  }

  // Pre-process and parse Markdown from section contents to avoid cutoffs
  const parseSlideMarkdown = (title: string, contentText: string): ParsedBentoContent => {
    let preparedText = String(contentText || "").trim();
    
    // Fix literal string \n that might be returned by the model
    if (preparedText.includes('\\n')) {
      preparedText = preparedText.replace(/\\n/g, '\n');
    }

    // Help handle inline-bullet single line styles if any
    if (!preparedText.includes('\n')) {
      if (preparedText.includes('; *')) {
        preparedText = preparedText.replace(/;\s*\*/g, '\n- *');
      } else if (preparedText.includes('; -')) {
        preparedText = preparedText.replace(/;\s*-/g, '\n-');
      }
      // Handle inline dash plus bold asterisks: " - **"
      preparedText = preparedText.replace(/\s?-\s\*\*/g, '\n- **');
    }

    const lines = preparedText.split('\n').map(l => l.trim()).filter(Boolean);
    const points: { title: string; body: string }[] = [];
    const introParagraphs: string[] = [];
    let detectedTakeaway = "";

    // Identify layout type based on slide title
    const tLower = title.toLowerCase();
    let layoutType: 'grid' | 'timeline' | 'twocolumn' | 'hero-only' | 'comparison' | 'list-block' = 'grid';
    if (tLower.includes('quy trình') || tLower.includes('các bước') || tLower.includes('tiến trình') || tLower.includes('vòng đời') || tLower.includes('bước')) {
      layoutType = 'timeline';
    } else if (tLower.includes('so sánh') || tLower.includes('khác biệt') || tLower.includes('đối chiếu') || tLower.includes('phân biệt')) {
      layoutType = 'comparison';
    }

    lines.forEach(line => {
      // Check if line is specifically a takeaway indicator
      if (line.startsWith('*') && line.endsWith('*') && line.length > 15) {
        if (!detectedTakeaway) detectedTakeaway = line.slice(1, -1).trim();
        return;
      }
      if (line.toLowerCase().startsWith('chốt ý:') || line.toLowerCase().startsWith('kết luận:')) {
        detectedTakeaway = line.substring(line.indexOf(':') + 1).trim();
        return;
      }

      // Check bullet list item
      const listMatch = line.match(/^\s*[-*+•]\s*(.*)/);
      const numMatch = line.match(/^\s*(\d+)\.\s*(.*)/);

      if (listMatch) {
        const rest = listMatch[1].trim();
        const boldMatch = rest.match(/^\*\*([^*]+)\*\*([\s\S]*)/);
        if (boldMatch) {
          points.push({
            title: boldMatch[1].trim(),
            body: boldMatch[2].trim().replace(/^[\s:：\-–—]+/, '').trim()
          });
        } else {
          const colonIdx = rest.indexOf(':');
          if (colonIdx > 0 && colonIdx < 40) {
            points.push({
              title: rest.substring(0, colonIdx).trim(),
              body: rest.substring(colonIdx + 1).replace(/^[\s\-–—]+/, '').trim()
            });
          } else {
            points.push({
              title: "",
              body: rest
            });
          }
        }
      } else if (numMatch) {
        const rest = numMatch[2].trim();
        const boldMatch = rest.match(/^\*\*([^*]+)\*\*([\s\S]*)/);
        if (boldMatch) {
          points.push({
            title: boldMatch[1].trim(),
            body: boldMatch[2].trim().replace(/^[\s:：\-–—]+/, '').trim()
          });
        } else {
          const colonIdx = rest.indexOf(':');
          if (colonIdx > 0 && colonIdx < 40) {
            points.push({
              title: rest.substring(0, colonIdx).trim(),
              body: rest.substring(colonIdx + 1).replace(/^[\s\-–—]+/, '').trim()
            });
          } else {
            points.push({
              title: "",
              body: rest
            });
          }
        }
      } else {
        // Just normal text or starts with bold **Title**
        const boldStartMatch = line.match(/^\*\*([^*]{3,40})\*\*([\s\S]*)/);
        if (boldStartMatch) {
          points.push({
            title: boldStartMatch[1].trim(),
            body: boldStartMatch[2].trim().replace(/^[\s:：\-–—]+/, '').trim()
          });
        } else {
          introParagraphs.push(line);
        }
      }
    });

    let hero = introParagraphs.join('\n\n').trim();

    // If points are zero but paragraphs are abundant
    if (points.length === 0 && introParagraphs.length > 1) {
      hero = introParagraphs[0];
      introParagraphs.slice(1).forEach((para) => {
        const boldMatch = para.match(/^\*\*([^*]{3,45})\*\*([\s\S]*)/);
        if (boldMatch) {
          points.push({
            title: boldMatch[1].trim(),
            body: boldMatch[2].trim().replace(/^[\s:：\-–—]+/, '').trim()
          });
        } else {
          const colonIdx = para.indexOf(':');
          if (colonIdx > 0 && colonIdx < 40) {
            points.push({
              title: para.substring(0, colonIdx).trim(),
              body: para.substring(colonIdx + 1).replace(/^[\s\-–—]+/, '').trim()
            });
          } else {
            // Cut clean short title if possible, or leave it blank
            const words = para.split(' ').filter(Boolean);
            let pTitle = "";
            let pBody = para;
            if (words.length >= 2 && words.length <= 6) {
              pTitle = para;
              pBody = "";
            } else if (words.length > 6) {
              pTitle = words.slice(0, Math.min(3, words.length)).join(' ').replace(/[,.:;:-]$/, '');
              pTitle = pTitle.charAt(0).toUpperCase() + pTitle.slice(1) + "...";
            }
            points.push({
              title: pTitle,
              body: pBody
            });
          }
        }
      });
      layoutType = 'twocolumn';
    } else if (points.length === 0) {
      layoutType = 'hero-only';
    } else if (points.length >= 5) {
      layoutType = 'list-block';
    }

    if (!detectedTakeaway) {
      const italicMatch = contentText.match(/\*(?!\*)([^*]{15,220})\*(?!\*)/);
      if (italicMatch) {
        detectedTakeaway = italicMatch[1].trim();
      }
    }

    return { hero, layoutType, points, takeaway: detectedTakeaway };
  };

  // Split slide content into modern Canva/Gamma layout, with dynamic thematic styling
  const renderBentoSlide = (title: string, contentText: string, index: number) => {
    const { hero, layoutType, points, takeaway } = parseSlideMarkdown(title, contentText);

    // Theme categorizer based on slide title
    const tLower = title.toLowerCase();
    let kicker: React.ReactNode = <><BookOpen className="w-3.5 h-3.5" /> Kiến thức cốt lõi</>;
    
    if (tLower.includes('khái niệm') || tLower.includes('định nghĩa') || tLower.includes('là gì') || tLower.includes('tổng quan') || tLower.includes('giới thiệu') || tLower.includes('lý thuyết')) {
      kicker = <><Search className="w-3.5 h-3.5" /> Định nghĩa & Khái niệm</>;
    } else if (tLower.includes('quy trình') || tLower.includes('các bước') || tLower.includes('tiến trình') || tLower.includes('vòng đời') || tLower.includes('thuật toán') || tLower.includes('workflow') || tLower.includes('bước')) {
      kicker = <><RotateCcw className="w-3.5 h-3.5" /> Quy trình & Các bước</>;
    } else if (tLower.includes('lợi ích') || tLower.includes('ưu điểm') || tLower.includes('u việt') || tLower.includes('giá trị') || tLower.includes('cơ hội') || tLower.includes('vai trò')) {
      kicker = <><Sparkles className="w-3.5 h-3.5" /> Giá trị & Lợi thế</>;
    } else if (tLower.includes('hạn chế') || tLower.includes('nhược điểm') || tLower.includes('thử thách') || tLower.includes('lưu ý') || tLower.includes('rủi ro') || tLower.includes('cảnh báo') || tLower.includes('bảo mật') || tLower.includes('thận trọng')) {
      kicker = <><AlertCircle className="w-3.5 h-3.5" /> Lưu ý & Rủi ro</>;
    } else if (tLower.includes('ứng dụng') || tLower.includes('thực tế') || tLower.includes('thực tiễn') || tLower.includes('áp dụng') || tLower.includes('thực hành') || tLower.includes('ví dụ')) {
      kicker = <><PenTool className="w-3.5 h-3.5" /> Ứng dụng thực tiễn</>;
    }

    // Dynamic theme classes matching user selected appTheme perfectly
    const getSlideThemeClasses = (theme: typeof appTheme, mode: 'light' | 'dark') => {
      if (theme === 'emerald') {
        return {
          hero: mode === 'light' 
            ? 'bg-gradient-to-br from-white to-emerald-50/10 border-emerald-150 shadow-md shadow-emerald-500/5'
            : 'bg-slate-900/60 border-emerald-950/60 shadow shadow-black/40',
          pointCard: mode === 'light' ? 'bg-white border-emerald-100 shadow-sm' : 'bg-slate-900/40 border-emerald-900/40 shadow shadow-black/20',
          pointIndex: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow shadow-emerald-500/10',
          takeaway: mode === 'light'
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
            : 'bg-gradient-to-br from-emerald-900/80 to-teal-900/80 text-emerald-100 border-emerald-800/40',
          badge: mode === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-extrabold' : 'bg-emerald-950/40 border-emerald-900 text-emerald-300 font-extrabold',
          textAccent: mode === 'light' ? 'text-emerald-700 font-sans' : 'text-emerald-400 font-sans',
          strongHighlight: mode === 'light' ? 'text-emerald-800 bg-emerald-50/70' : 'text-emerald-300 bg-emerald-950/50'
        };
      }
      if (theme === 'sunset') {
        return {
          hero: mode === 'light' 
            ? 'bg-gradient-to-br from-white to-orange-50/10 border-orange-150 shadow-md shadow-orange-500/5'
            : 'bg-slate-900/60 border-orange-950/60 shadow shadow-black/40',
          pointCard: mode === 'light' ? 'bg-white border-orange-100 shadow-sm' : 'bg-slate-900/40 border-orange-900/40 shadow shadow-black/20',
          pointIndex: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow shadow-orange-500/10',
          takeaway: mode === 'light'
            ? 'bg-gradient-to-br from-orange-600 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-500/10'
            : 'bg-gradient-to-br from-orange-900/80 to-amber-900/80 text-orange-100 border-orange-800/40',
          badge: mode === 'light' ? 'bg-orange-50 border-orange-200 text-orange-850 font-extrabold' : 'bg-orange-950/40 border-orange-900 text-orange-300 font-extrabold',
          textAccent: mode === 'light' ? 'text-orange-750 font-sans' : 'text-orange-400 font-sans',
          strongHighlight: mode === 'light' ? 'text-orange-850 bg-orange-50/70' : 'text-orange-300 bg-orange-950/50'
        };
      }
      if (theme === 'mystic') {
        return {
          hero: mode === 'light' 
            ? 'bg-gradient-to-br from-white to-purple-50/10 border-purple-150 shadow-md shadow-purple-500/5'
            : 'bg-slate-900/60 border-purple-950/60 shadow shadow-black/40',
          pointCard: mode === 'light' ? 'bg-white border-purple-100 shadow-sm' : 'bg-slate-900/40 border-purple-900/40 shadow shadow-black/20',
          pointIndex: 'bg-gradient-to-br from-purple-500 to-indigo-505 text-white shadow shadow-purple-500/10',
          takeaway: mode === 'light'
            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/10'
            : 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80 text-purple-100 border-purple-800/40',
          badge: mode === 'light' ? 'bg-purple-50 border-purple-200 text-purple-800 font-extrabold' : 'bg-purple-950/40 border-purple-900 text-purple-300 font-extrabold',
          textAccent: mode === 'light' ? 'text-purple-700 font-sans' : 'text-purple-400 font-sans',
          strongHighlight: mode === 'light' ? 'text-purple-800 bg-purple-50/70' : 'text-purple-300 bg-purple-950/50'
        };
      }
      if (theme === 'rose') {
        return {
          hero: mode === 'light' 
            ? 'bg-gradient-to-br from-white to-rose-50/10 border-rose-150 shadow-md shadow-rose-500/5'
            : 'bg-slate-900/60 border-rose-950/60 shadow shadow-black/40',
          pointCard: mode === 'light' ? 'bg-white border-rose-100 shadow-sm' : 'bg-slate-900/40 border-rose-900/40 shadow shadow-black/20',
          pointIndex: 'bg-gradient-to-br from-rose-500 to-pink-550 text-white shadow shadow-rose-500/10',
          takeaway: mode === 'light'
            ? 'bg-gradient-to-br from-rose-600 to-pink-600 text-white border-rose-500 shadow-md shadow-rose-500/10'
            : 'bg-gradient-to-br from-rose-900/80 to-pink-900/80 text-rose-100 border-rose-800/40',
          badge: mode === 'light' ? 'bg-rose-50 border-rose-200 text-rose-800 font-extrabold' : 'bg-rose-950/40 border-rose-900 text-rose-300 font-extrabold',
          textAccent: mode === 'light' ? 'text-rose-700 font-sans' : 'text-rose-400 font-sans',
          strongHighlight: mode === 'light' ? 'text-rose-800 bg-rose-50/70' : 'text-rose-300 bg-rose-950/50'
        };
      }
      // default: ocean
      return {
        hero: mode === 'light' 
          ? 'bg-gradient-to-br from-white to-blue-50/10 border-blue-150 shadow-md shadow-blue-500/5'
          : 'bg-slate-900/60 border-blue-950/60 shadow shadow-black/40',
        pointCard: mode === 'light' ? 'bg-white border-blue-100 shadow-sm' : 'bg-slate-900/40 border-blue-900/40 shadow shadow-black/20',
        pointIndex: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow shadow-blue-500/10',
        takeaway: mode === 'light'
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
          : 'bg-gradient-to-br from-blue-900/80 to-indigo-900/80 text-blue-100 border-blue-800/40',
        badge: mode === 'light' ? 'bg-blue-50 border-blue-200 text-blue-805 font-extrabold' : 'bg-blue-950/40 border-blue-900 text-blue-300 font-extrabold',
        textAccent: mode === 'light' ? 'text-blue-700 font-sans' : 'text-blue-400 font-sans',
        strongHighlight: mode === 'light' ? 'text-blue-800 bg-blue-50/70' : 'text-blue-300 bg-blue-950/50'
      };
    };

    const themeClasses = getSlideThemeClasses(appTheme, slideTheme);

    const inlineCoreMarkdown = (val: string) => {
      const parts = val.split(/\*\*([^*]+)\*\*/g);
      return (
        <span>
          {parts.map((chunk, i) => i % 2 === 1 ? (
            <strong key={i} className={`font-extrabold px-1.5 py-0.5 rounded-md ${themeClasses.strongHighlight}`}>
              {chunk}
            </strong>
          ) : chunk)}
        </span>
      );
    };

    const renderPointsLayout = () => {
      if (points.length === 0) return null;

      if (layoutType === 'timeline') {
        return (
          <section className="core-slide-timeline flex flex-col md:flex-row items-stretch gap-4 my-2">
            {points.map((pt, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-stretch relative">
                <article className={`h-full p-4 md:p-5 rounded-2xl border flex flex-col justify-start gap-2.5 transition-all shadow-sm ${themeClasses.pointCard} relative z-10`}>
                  <div className="flex items-center justify-between">
                    <span className={`point-index px-2.5 py-1 rounded-lg flex items-center justify-center text-[9px] font-black tracking-wider shadow ${themeClasses.pointIndex}`}>
                      BƯỚC {idx + 1}
                    </span>
                    {idx < points.length - 1 && (
                      <span className="hidden md:inline text-lg text-slate-350 animate-pulse">➔</span>
                    )}
                  </div>
                  {pt.title && (
                    <strong className={`font-black text-xs sm:text-[13px] tracking-tight block ${themeClasses.textAccent}`}>
                      {inlineCoreMarkdown(pt.title)}
                    </strong>
                  )}
                  <span className={`text-[11px] sm:text-xs font-semibold leading-relaxed block ${slideTheme === 'light' ? 'text-slate-650' : 'text-slate-300'}`}>
                    {inlineCoreMarkdown(pt.body)}
                  </span>
                </article>
              </div>
            ))}
          </section>
        );
      }

      if (layoutType === 'comparison') {
        return (
          <section className="core-slide-comparison grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {points.slice(0, 2).map((pt, idx) => {
              const contrBg = idx === 0 
                ? (slideTheme === 'light' ? 'bg-gradient-to-b from-white to-emerald-50/10 border-emerald-200' : 'bg-emerald-950/20 border-emerald-900/60') 
                : (slideTheme === 'light' ? 'bg-gradient-to-b from-white to-rose-50/10 border-rose-200' : 'bg-rose-950/20 border-rose-900/60');
              const contrIndexBg = idx === 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
              const contrText = idx === 0 
                ? (slideTheme === 'light' ? 'text-emerald-800' : 'text-emerald-400') 
                : (slideTheme === 'light' ? 'text-rose-800' : 'text-rose-400');
              return (
                <article key={idx} className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all ${contrBg} shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-[10px] font-black ${contrIndexBg}`}>
                      {idx === 0 ? "✓" : "✗"}
                    </span>
                    <strong className={`font-black text-xs sm:text-[13px] uppercase tracking-wider block ${contrText}`}>
                      {pt.title ? inlineCoreMarkdown(pt.title) : (idx === 0 ? "Khía cạnh tích cực" : "Khía cạnh thận trọng")}
                    </strong>
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold leading-relaxed block ${slideTheme === 'light' ? 'text-slate-650' : 'text-slate-300'}`}>
                    {inlineCoreMarkdown(pt.body)}
                  </span>
                </article>
              );
            })}
          </section>
        );
      }

      if (layoutType === 'list-block') {
        return (
          <section className={`core-slide-hero p-5 rounded-2xl border transition-all duration-300 ${themeClasses.hero}`}>
            <ul className="space-y-4">
              {points.map((pt, idx) => (
                <li key={idx} className={`leading-relaxed ${slideTheme === 'light' ? 'text-slate-800' : 'text-slate-100'} flex items-start gap-3`}>
                  <span className={`mt-0.5 flex-shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${themeClasses.pointIndex}`}>
                    {idx + 1}
                  </span>
                  <div>
                    {pt.title && (
                      <strong className="font-extrabold tracking-wide block mb-0.5 text-[13px]">
                        {inlineCoreMarkdown(pt.title)}
                      </strong>
                    )}
                    <span className="text-xs font-semibold leading-relaxed opacity-90">{inlineCoreMarkdown(pt.body)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      }

      if (layoutType === 'twocolumn') {
        return (
          <section className="core-slide-twocolumn grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            {points.map((pt, idx) => (
              <article key={idx} className={`p-5 rounded-2xl border flex flex-col justify-start gap-2.5 transition-all shadow-sm ${themeClasses.pointCard}`}>
                {pt.title && (
                  <strong className={`font-black text-xs sm:text-[13px] tracking-tight block border-b pb-1.5 ${themeClasses.textAccent} flex items-center gap-1.5`}>
                    <Lightbulb className="w-3.5 h-3.5" /> {inlineCoreMarkdown(pt.title)}
                  </strong>
                )}
                <span className={`text-[11px] sm:text-xs font-semibold leading-relaxed block ${slideTheme === 'light' ? 'text-slate-655' : 'text-slate-300'}`}>
                  {inlineCoreMarkdown(pt.body)}
                </span>
              </article>
            ))}
          </section>
        );
      }

      return (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 my-3 auto-rows-min">
          {points.map((pt, idx) => {
            const len = points.length;
            let colSpan = "md:col-span-4";
            if (len === 1) colSpan = "md:col-span-12";
            else if (len === 2) colSpan = "md:col-span-6 lg:col-span-6";
            else if (len === 3) {
              if (idx === 0) colSpan = "md:col-span-12 lg:col-span-12 border-b-4";
              else colSpan = "md:col-span-6 lg:col-span-6";
            }
            else if (len === 4) colSpan = "md:col-span-6 lg:col-span-6";
            else if (len === 5) {
              if (idx < 2) colSpan = "md:col-span-6 lg:col-span-6";
              else colSpan = "md:col-span-4 lg:col-span-4";
            }

            return (
              <article key={idx} className={`core-slide-point ${colSpan} p-4 md:p-5 rounded-3xl border flex flex-col justify-start gap-3 transition-all hover:-translate-y-1 hover:shadow-lg duration-300 shadow-sm relative overflow-hidden group ${themeClasses.pointCard}`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${slideTheme === 'light' ? 'from-white/40 to-transparent' : 'from-white/5 to-transparent'} pointer-events-none`} />
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`point-index w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-sm ${themeClasses.pointIndex}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {pt.title && (
                      <strong className={`font-black text-xs sm:text-[14px] tracking-tight block ${themeClasses.textAccent}`}>
                        {inlineCoreMarkdown(pt.title)}
                      </strong>
                    )}
                  </div>
                  <span className={`text-[12px] sm:text-[13px] font-medium leading-relaxed block ${slideTheme === 'light' ? 'text-slate-650' : 'text-slate-300'}`}>
                    {inlineCoreMarkdown(pt.body)}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      );
    };

    const sectionData = generatedLesson?.sections[index];
    const imageUrl = sectionData?.imageUrl;
    const imagePrompt = sectionData?.imagePrompt;
    const imagePosition = sectionData?.imagePosition || 'right';
    const hasImg = imageUrl && imagePosition !== 'hide';

    const renderMainContent = () => (
      <>
        {hero && (
          <section className={`core-slide-hero p-5 rounded-2xl border transition-all duration-300 ${themeClasses.hero}`}>
            <p className={`font-extrabold text-xs sm:text-sm leading-relaxed ${slideTheme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
              {inlineCoreMarkdown(hero)}
            </p>
          </section>
        )}

        {renderPointsLayout()}
      </>
    );

    const renderImageContent = () => (
      <div className={`p-2 rounded-2xl border flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 ${
        slideTheme === 'light' ? 'border-slate-200/60 shadow-xs' : 'border-slate-800/80 shadow shadow-black/40'
      }`}>
        <img
          src={imageUrl}
          alt="Slide Illustration"
          className="rounded-xl object-cover max-h-[180px] sm:max-h-[220px] w-full border dark:border-slate-800"
          referrerPolicy="no-referrer"
        />
        {imagePrompt && (
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 italic text-center leading-normal px-1">
            Concept: {imagePrompt}
          </p>
        )}
      </div>
    );

    return (
      <div className="core-slide-layout space-y-4.5 text-left">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${themeClasses.badge}`}>
          {kicker} {String(index + 1).padStart(2, '0')}
        </span>
        
        {hasImg ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {imagePosition === 'left' ? (
              <>
                <div className="md:col-span-4 flex flex-col justify-start">
                  {renderImageContent()}
                </div>
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  {renderMainContent()}
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  {renderMainContent()}
                </div>
                <div className="md:col-span-4 flex flex-col justify-start">
                  {renderImageContent()}
                </div>
              </>
            )}
          </div>
        ) : (
          renderMainContent()
        )}

        {takeaway && (
          <section className={`core-slide-takeaway flex gap-3 p-4.5 rounded-2xl border transition-all duration-300 ${themeClasses.takeaway}`}>
            <span className="takeaway-icon flex-shrink-0 w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-white/20 border border-white/20 text-sm shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div className="space-y-0.5 text-white">
              <strong className="text-amber-300 block text-[10px] uppercase font-black tracking-widest leading-none">Chốt ý giảng viên:</strong>
              <div className="text-xs sm:text-sm font-extrabold leading-relaxed">
                {inlineCoreMarkdown(takeaway)}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  // State reducer to update parts of the generated StructuredLesson live in v2.0
  const updateLessonField = (updater: (prev: StructuredLesson) => void) => {
    if (!generatedLesson) return;
    setGeneratedLesson((prev) => {
      if (!prev) return null;
      const next = { ...prev };
      updater(next);
      return next;
    });
  };

  // Build string representation list of interactions enabled
  const getSelectedInteractions = (): string[] => {
    const list: string[] = [];
    if (enableWarmUp) list.push("Warm-up Activity (Hoạt động khởi động)");
    if (enableQuiz) list.push("Interactive Quiz 5 questions (5 câu hỏi trắc nghiệm tự kiểm tra phản hồi tức thì)");
    if (enableCaseStudy) list.push("Real-world Case Study (Nghiên cứu tình huống ứng dụng thực tế Việt Nam)");
    if (enableReflection) list.push("3 Deep Reflection Questions (3 Câu hỏi suy ngẫm sâu liên hệ thực tiễn)");
    if (enableFlashcards) list.push("Interactive Flashcards (Thẻ ghi nhớ thuật ngữ nhanh)");
    return list;
  };

  const [generatingPromptSlideIdx, setGeneratingPromptSlideIdx] = useState<number | null>(null);

  const handleImageUpload = (file: File, slideIdx: number) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          updateLessonField(l => {
            l.sections[slideIdx].imageUrl = compressedDataUrl;
            l.sections[slideIdx].imagePosition = l.sections[slideIdx].imagePosition || 'right';
          });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };
  
  const handleGenerateExpertTopic = async () => {
    if (!aiExpertTopic.trim()) {
      alert("Vui lòng nhập chủ đề bạn muốn AI tạo nội dung.");
      return;
    }
    setIsGeneratingExpertTopic(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-expert-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customApiKey ? { "x-gemini-key": customApiKey } : {})
        },
        body: JSON.stringify({
          topic: aiExpertTopic,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Có lỗi xảy ra khi tạo nội dung chuyên gia");
      }

      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        setAiExpertTopic(""); // optionally clear
        alert("Thành công! Nội dung đã được AI soạn và điền vào ô bên dưới.");
      }
    } catch (error: any) {
      console.error(error);
      setGenerationError("Không thể tạo nội dung: " + error.message);
    } finally {
      setIsGeneratingExpertTopic(false);
    }
  };

  const handleGenerateImagePrompt = async (slideIdx: number) => {
    const slide = generatedLesson?.sections[slideIdx];
    if (!slide) return;
    
    setGeneratingPromptSlideIdx(slideIdx);
    try {
      const response = await fetch("/api/generate-image-prompt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customApiKey ? { "x-gemini-key": customApiKey } : {})
        },
        body: JSON.stringify({
          slideTitle: slide.title,
          slideContent: slide.content,
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ để tạo prompt.");
      }
      
      const data = await response.json();
      if (data.prompt) {
        const seedValue = Math.floor(Math.random() * 10000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(data.prompt)}?width=600&height=450&nologo=true&seed=${seedValue}`;
        
        updateLessonField(l => {
          l.sections[slideIdx].imagePrompt = data.prompt;
          l.sections[slideIdx].imageUrl = imageUrl;
          l.sections[slideIdx].imagePosition = l.sections[slideIdx].imagePosition || 'right';
        });
      }
    } catch (err: any) {
      alert("Yêu cầu AI không thành công: " + (err.message || String(err)));
    } finally {
      setGeneratingPromptSlideIdx(null);
    }
  };

  const handleRegenerateImage = (slideIdx: number, prompt: string) => {
    if (!prompt.trim()) return;
    const seedValue = Math.floor(Math.random() * 10000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}?width=600&height=450&nologo=true&seed=${seedValue}`;
    updateLessonField(l => {
      l.sections[slideIdx].imagePrompt = prompt.trim();
      l.sections[slideIdx].imageUrl = imageUrl;
      l.sections[slideIdx].imagePosition = l.sections[slideIdx].imagePosition || 'right';
    });
  };

  // Call the Gemini-powered server-side API
  const handleGenerateLesson = async () => {
    if (!content.trim() && !uploadedFile) {
      setGenerationError("Vui lòng nhập nội dung bài giảng cốt lõi hoặc tải lên một tệp tài liệu giáo trình (PDF, PPT, Word...) để thu hoạch.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedLesson(null);

    try {
      let lessonData: StructuredLesson;

      const decodeBinaryStringToUtf8 = (str: string): string => {
        try {
          const u8 = new Uint8Array(str.length);
          for (let i = 0; i < str.length; i++) {
            u8[i] = str.charCodeAt(i) & 0xFF;
          }
          return new TextDecoder("utf-8").decode(u8);
        } catch {
          return str;
        }
      };

      if (customApiKey && customApiKey.trim()) {
        const contents: any[] = [];

        if (uploadedFile && uploadedFile.data && uploadedFile.mimeType) {
          const isTextExtractable = uploadedFile.mimeType.includes("wordprocessingml") ||
                                   uploadedFile.mimeType.includes("msword") ||
                                   uploadedFile.mimeType.includes("presentationml") ||
                                   uploadedFile.mimeType.includes("ms-powerpoint") ||
                                   uploadedFile.mimeType.includes("officedocument") ||
                                   uploadedFile.mimeType.includes("pdf") ||
                                   uploadedFile.mimeType.includes("text") ||
                                   uploadedFile.mimeType.includes("csv") ||
                                   uploadedFile.mimeType.includes("json");

          if (isTextExtractable) {
            let extractedText = "";
            try {
              extractedText = decodeBinaryStringToUtf8(atob(uploadedFile.data));
            } catch {
              extractedText = "";
            }
            if (extractedText && extractedText.trim().length > 100) {
              if (extractedText.length > 35000) {
                extractedText = extractedText.substring(0, 35000) + "\n\n...(Nội dung bị lược bớt để phù hợp với định mức xử lý dữ liệu)...";
              }
              contents.push({
                parts: [{
                  text: `NỘI DUNG TÀI LIỆU ĐÍNH KÈM (ĐÃ TRÍCH XUẤT THÀNH VĂN BẢN):\n\n${extractedText}`
                }]
              });
            } else {
              contents.push({
                parts: [{
                  inlineData: {
                    mimeType: uploadedFile.mimeType,
                    data: uploadedFile.data
                  }
                }]
              });
            }
          } else {
            contents.push({
              parts: [{
                inlineData: {
                  mimeType: uploadedFile.mimeType,
                  data: uploadedFile.data
                }
              }]
            });
          }
        }

        const promptText = `
Bạn là một chuyên gia thiết kế bài giảng sư phạm đại học lỗi lạc của Việt Nam. Hãy chuyển đổi nội dung bài giảng dưới đây thành một giáo án bài giảng số tương tác chất lượng cao, chia nhỏ theo cấu trúc slide và hỗ trợ hoạt hóa tư duy của sinh viên đại học môn học này. 
Bài học phải được hành văn hoàn toàn bằng tiếng Việt với văn phong sư phạm truyền cảm hứng, chuẩn mực học thuật, sâu sắc nhưng dễ tiếp thu và có tính thực tế cao.

${uploadedFile ? `QUAN TRỌNG: Bạn đã có mục tiêu học tập là đọc và bám sát tài liệu đính kèm (PDF/PPT/Word) ở trên để trích xuất nội dung bài giảng, các chương sách, slide giảng dạy chính thức. Hãy phân tích kỹ tài liệu này.
${selectedSection ? `LƯU Ý ĐẶC BIỆT CỰC KỲ QUAN TRỌNG: Giảng viên yêu cầu bạn CHỈ tập trung sâu sắc và trích xuất nội dung bài học tương tác hôm nay xoay quanh phần: "${selectedSection}" trong tài liệu đính kèm. Hãy phớt lờ các phần không liên quan khác trong tài liệu để thiết kế mục tiêu học tập bám sát hoàn hảo mục tiêu dạy học của phần này.` : "Hãy phân tích toàn văn tài liệu đã nạp."}` : ""}

Thông tin thiết lập bởi Giảng viên:
- Tiêu đề dự kiến: ${title || (uploadedFile ? "Trích xuất tiêu đề hay bám sát tài liệu đính kèm" : "Chưa thiết lập")}
- Môn học / Lĩnh vực: ${subject || (uploadedFile ? "Tự động trích xuất môn học thích hợp" : "Phát triển bản thân / Chuyên ngành")}
- Đối tượng sinh viên (Trình độ): ${level || "Sinh viên Đại học"}
- Thời lượng tự học ước tính: ${duration || "45 phút"}
- Định hướng cốt lõi ban đầu (nếu có): ${objectives || "Tự động phân tách mục tiêu Bloom khoa học nhất dựa trên tài liệu"}
- Các thành phần tương tác yêu cầu tạo: Khởi động (warm-up), các slide lý thuyết chia nhỏ kèm ví dụ & Check hiểu nhanh, trắc nghiệm ôn tập theo các cấp độ Bloom, bài tập nghiên cứu tình huống (Case study) dạng worksheet, câu hỏi tự suy ngẫm bản thân (reflection questions), thẻ ghi nhớ nhanh (flashcards).

${content ? `Nội dung bài giảng giảng viên nhập thêm tay bổ sung (hoặc làm rõ tài liệu):
---------
${content}
---------` : "Giảng viên muốn trích xuất hoàn toàn kiến thức từ tệp đính kèm ở trên và tập trung vào phần được lựa chọn."}

Yêu cầu chi tiết cho từng trường thông tin trong JSON đầu ra:
1. "lessonTitle": Tiêu đề bài học sư phạm số ấn tượng, súc tích và có chiều sâu chuyên môn.
2. "introduction": Lời giới thiệu/dẫn dắt ngắn (100-150 từ) hấp dẫn, kích hoạt động cơ học tập của sinh viên.
3. "learningObjectives": Đúng 3 mục tiêu học tập được viết cực kỳ chuẩn mực bám sát thang đo Bloom sư phạm Việt Nam (Ví dụ: "Phân biệt được...", "Vận dụng được...", "Đánh giá và đề xuất được...").
4. "sections": Chia tách học liệu cốt lõi thành các slide bài giảng lý thuyết ngắn gọn. Số lượng slide cần BÁM SÁT chặt chẽ vào dung lượng và nội dung tài liệu đính kèm đã tải lên (hoặc nội dung do giáo viên nhập tay), không được tóm tắt lược bỏ kiến thức chính. ĐẶC BIỆT: Đối với mỗi phần tiểu mục cấp 3 (ví dụ các mục nhỏ dạng 1.1.1, 1.1.2, a, b...), bạn bắt buộc phải phân tách chi tiết thành từ 1 đến 2 slide riêng biệt để trình bày sâu sắc và đầy đủ nhất, tránh chồng chất nội dung hoặc lướt qua sơ sài. Số lượng slide dao động từ 4 đến 12 slide tùy theo độ dài của tài liệu. Mỗi đối tượng slide bao gồm:
   - "title": Tiêu đề slide ngắn gọn, súc tích.
   - "content": Nội dung lý thuyết cực kỳ súc tích, ngắn gọn từng câu chữ (ngôn từ tinh giản dễ hiểu nhất, tuyệt đối không viết thành đoạn văn dài dòng, thụ động). Bắt buộc phải trình bày theo định dạng danh sách (bullet list) rõ ràng từng ý bằng dấu gạch đầu dòng và bôi đậm tiêu đề như: '- **Tiêu đề ý chính 1**: Phần mô tả ngắn gọn.' hoặc phân chia bằng các dòng riêng để slide thoáng đãng, cân đối và trực quan. Tránh viết tràn lan không cấu trúc.
   - "example": Đúng 1 ví dụ thực tế cụ thể sinh động giải thích hoàn hảo cho lý thuyết của slide đó.
   - "quickCheck": Hoạt động "Check hiểu nhanh" bắt buộc ngay dưới slide để sinh viên thực hành tư duy phản hồi gồm:
       * "question": Một câu hỏi ngắn/hoạt động thực tế để kiểm tra mức độ hiểu của slide vừa đọc.
       * "hint": Gợi ý định hướng gợi mở hỗ trợ sinh viên tư duy trả lời.
       * "suggestedAnswer": Phản hồi mẫu lý tưởng/đáp án xuất sắc nhất của giảng viên để sinh viên đối chiếu.
   - "lecturerNotes": Ghi chú sư phạm nội bộ dành riêng cho giảng viên (như mẹo thu hút người học, câu hỏi thảo luận khơi mào trên lớp, hoặc điểm sinh viên dễ nhầm lẫn).
5. "warmUp": Hoạt động khởi động nhẹ trước khi vào học để thu hút sinh viên trong 2 phút đầu tiên. Gồm Title, Description (bối cảnh kích hoạt) và Task (câu hỏi khơi gợi tư duy hoặc thử thách nhỏ).
6. "quizQuestions": Đúng 5 câu hỏi trắc nghiệm kiểm định kiến thức được thiết kế chuẩn chỉnh theo 3 cấp độ Bloom tăng dần:
   - Câu 1, Câu 2: Cấp độ "Nhớ/Hiểu" (Nhận diện khái niệm, định nghĩa gốc).
   - Câu 3, Câu 4: Cấp độ "Vận dụng" (Giải quyết tình huống, bối cảnh bài tập thực tế ngắn).
   - Câu 5: Cấp độ "Ra quyết định" (Phân tích thông tin để lựa chọn phương án giải quyết tối ưu hoặc quyết định quản trị phù hợp).
   Mỗi câu hỏi có:
   - "id": Số nguyên từ 1 đến 5.
   - "question": Câu hỏi rõ ràng, không mập mờ, bám sát kiến thức.
   - "options": Đúng 4 lựa chọn bắt đầu bằng chữ cái hoa và dấu chấm (Ví dụ: "A. ...", "B. ...", "C. ...", "D. ...").
   - "correctAnswer": Chữ cái hoa duy nhất của đáp án đúng ("A", "B", "C" hoặc "D").
   - "explanation": Giải thích tường tận lý thuyết vì sao đáp án đó đúng và vì sao các đáp án khác sai để sinh viên học sâu.
   - "bloomLevel": Ghi rõ chính xác một trong các chuỗi sau đây tương ứng cấp độ Bloom: "Nhớ/Hiểu" hoặc "Vận dụng" hoặc "Ra quyết định".
7. "caseStudy": Nghiên cứu tình huống nâng cấp thành worksheet có cấu trúc chặt chẽ. Bao gồm:
   - "title": Tiêu đề tình huống hấp dẫn sâu sắc.
   - "context": Mô tả bối cảnh tình huống thực tế kinh tế doanh nghiệp, khoa học hoặc xã hội Việt Nam chân thực, phức tạp, đòi hỏi tư duy đa chiều.
   - "tasks": Đúng 3 nhiệm vụ/bài tập worksheet thiết lập liên tục theo thang cấp độ Bloom:
       * Nhiệm vụ 1: Mức "Nhớ/Hiểu" (Ví dụ: Tóm tắt các vấn đề cốt lõi, thống kê số liệu quan trọng trong tình huống).
       * Nhiệm vụ 2: Mức "Phân tích/Vận dụng" (Ví dụ: Áp dụng lý thuyết bài học để phân tích nguyên nhân/mô phỏng tiến trình trong bài).
       * Nhiệm vụ 3: Mức "Đề xuất/Sáng tạo" (Ví dụ: Hoạch định chiến lược hành động, đề xuất giải pháp bền vững kèm luận chứng thuyết phục).
       Mỗi nhiệm vụ có:
         * "bloomLevel": Khớp chính xác nhãn "Nhớ/Hiểu" hoặc "Phân tích/Vận dụng" hoặc "Đề xuất/Sáng tạo".
         * "question": Câu hỏi yêu cầu chi tiết.
         * "hint": Gợi ý/định hướng phân tích.
         * "suggestedAnswer": Hướng dẫn giải xuất sắc mong đợi từ giảng viên để đối chiếu so sánh kết quả.
   - "rubric": Đúng 3 đến 4 tiêu chí/thang đo đánh giá kết quả của sinh viên (Ví dụ: "Tiêu chí 1: Khả năng nhận diện vấn đề (3đ) - Đạt điểm tối đa khi...", "Tiêu chí 2:...").
8. "reflectionQuestions": Đúng 3 câu hỏi suy ngẫm cá sinh hóa (personal reflection) kích thích liên hệ thực tiễn bản thân sinh viên sâu sắc.
9. "summary": Tóm lược ngắn gọn, đúc kết giá trị cốt lõi và lời khuyên sư phạm truyền cảm hứng.
10. "flashcards": Đúng 4-5 flashcard ghi nhớ nhanh thuật ngữ khoa học khó (mỗi thẻ có front là tên khái niệm, back là định nghĩa cô đọng dưới 40 từ).

Đảm bảo cấu trúc JSON hợp lệ hoàn toàn, không bị khuyết thiếu hay lỗi dấu phẩy. Mọi nội dung hiển thị đều bằng tiếng Việt chuẩn mực sư phạm cao cấp.
`;

        contents.push({
          parts: [{ text: promptText }]
        });

        lessonData = await callGeminiDirectClient(
          customApiKey,
          selectedModel,
          "Bạn là một học giả và chuyên gia sư phạm đại học xuất sắc bậc nhất tại Việt Nam, sở hữu tư duy thiết kế bài giảng số tích cực chuẩn quốc tế, giúp sinh viên có trải nghiệm học tập đỉnh cao.",
          contents,
          {
            type: "object",
            properties: {
              lessonTitle: { type: "string" },
              introduction: { type: "string" },
              learningObjectives: {
                type: "array",
                items: { type: "string" },
                description: "Danh sách đúng 3 mục tiêu học tập theo Bloom"
              },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string", description: "Nội dung lý thuyết cực kỳ súc tích dưới dạng các gạch đầu dòng rõ ràng, ví dụ: '- **Tiêu đề ý 1**: Phần diễn giải ngắn dưới 20 từ.' Tuyệt đối không viết thành đoạn văn dài dòng không phân điểm." },
                    example: { type: "string", description: "1 ví dụ thực tế sinh động minh họa độc lập cho slide này." },
                    quickCheck: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        hint: { type: "string" },
                        suggestedAnswer: { type: "string" }
                      },
                      required: ["question", "hint", "suggestedAnswer"]
                    },
                    lecturerNotes: { type: "string", description: "Bí quyết sư phạm riêng tư dành cho giảng viên dạy slide này." }
                  },
                  required: ["title", "content", "example", "quickCheck", "lecturerNotes"]
                },
                description: "Danh sách từ 4 đến 12 slide lý thuyết ngắn gọn tích hợp bám sát vào tài liệu."
              },
              warmUp: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  task: { type: "string" }
                },
                required: ["title", "description", "task"]
              },
              quizQuestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" }
                    },
                    correctAnswer: { type: "string", description: "Chữ cái hoa đáp án đúng: A, B, C, hoặc D" },
                    explanation: { type: "string" },
                    bloomLevel: { type: "string", description: "Cấp độ hành vi Bloom: 'Nhớ/Hiểu', 'Vận dụng', 'Ra quyết định'" }
                  },
                  required: ["id", "question", "options", "correctAnswer", "explanation", "bloomLevel"]
                },
                description: "Đúng 5 câu hỏi trắc nghiệm tương tác"
              },
              caseStudy: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  context: { type: "string", description: "Bối cảnh tình huống thực tiễn kinh tế xã hội phong phú." },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        bloomLevel: { type: "string", description: "Có 3 cấp: 'Nhớ/Hiểu', 'Phân tích/Vận dụng', 'Đề xuất/Sáng tạo'" },
                        question: { type: "string" },
                        hint: { type: "string" },
                        suggestedAnswer: { type: "string" }
                      },
                      required: ["bloomLevel", "question", "hint", "suggestedAnswer"]
                    },
                    description: "Đúng 3 nhiệm vụ worksheet từ dễ đến khó."
                  },
                  rubric: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 tiêu chí chấm điểm và hướng dẫn đánh giá."
                  }
                },
                required: ["title", "context", "tasks", "rubric"]
              },
              reflectionQuestions: {
                type: "array",
                items: { type: "string" },
                description: "Đúng 3 câu hỏi suy ngẫm sâu liên hệ thực tiễn."
              },
              summary: { type: "string", description: "Tóm tắt đọng lại giá trị." },
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" }
                  },
                  required: ["front", "back"]
                },
                description: "4-5 tấm thẻ ghi nhớ nhanh thuật ngữ chuyên môn."
              }
            },
            required: [
              "lessonTitle", "introduction", "learningObjectives", "sections",
              "warmUp", "quizQuestions", "caseStudy", "reflectionQuestions", "summary", "flashcards"
            ]
          }
        );
      } else {
        const response = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            subject,
            level,
            duration,
            content,
            objectives,
            interactions: getSelectedInteractions(),
            file: uploadedFile ? { mimeType: uploadedFile.mimeType, data: uploadedFile.data } : undefined,
            selectedSection: uploadedFile ? selectedSection : undefined,
            model: selectedModel
          })
        });

        if (!response.ok) {
          let errMsg = "Gặp lỗi ngẫu nhiên trong quá trình kết xuất.";
          try {
            const text = await response.text();
            try {
              const errorData = JSON.parse(text);
              errMsg = errorData.error || errMsg;
            } catch {
              if (response.status === 413 || text.toLowerCase().includes("too large") || text.toLowerCase().includes("payload too large")) {
                errMsg = "Dung lượng tệp quá lớn để gửi qua cổng Vercel (Giới hạn tối đa 4.5MB). Vui lòng dán trực tiếp nội dung bài giảng cốt lõi hoặc tải tệp có dung lượng nhỏ hơn.";
              } else {
                errMsg = `Lỗi hệ thống (${response.status}): ${text.substring(0, 120)}`;
              }
            }
          } catch {
            errMsg = `Lỗi hệ thống (${response.status})`;
          }
          throw new Error(errMsg);
        }

        lessonData = await response.json();
      }

      setGeneratedLesson(lessonData);
      
      // Reset simulator states for the new lesson
      setPreviewTab("intro");
      setPreviewSectionIdx(0);
      setPreviewQuizAnswers({});
      setPreviewQuizScore(0);
      setPreviewFlippedFlashcards({});
      setPreviewStudentResponses(["", "", ""]);
      setPreviewStudentName("");
      
      // Switch view to detailed Editor in Part 2 after successful generation
      setEditorStep("edit");
      setActiveTab("editor");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "";
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        setGenerationError(
          "⚠️ Hạn mức cuộc gọi API Gemini hiện tại đã tạm hết (429 Quota Exceeded). " +
          "Bởi vì bạn đang chạy trên gói dùng thử miễn phí chung, hãy vui lòng đợi tầm 1 phút rồi ấn lại, " +
          "hoặc chèn mã cài đặt riêng của bạn bằng cách gắn GEMINI_API_KEY trong Settings > Secrets để sử dụng không giới hạn."
        );
      } else {
        setGenerationError(errMsg || "Không thể khởi tạo nội dung khóa học từ AI. Hãy đảm bảo API Key đã được cấu hình trong Secrets.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Generator: Clean HTML file creator
  const compileStudentHTML = (lesson: StructuredLesson): string => {
    const sectionsCount = lesson.sections.length;
    const quizCount = lesson.quizQuestions.length;

    const themeSetup = {
      ocean: {
        b950: '#06142f', b900: '#0b1f4d', b800: '#123a7a', b700: '#1554b7', b600: '#2563eb', b500: '#3b82f6', b400: '#60a5fa', b300: '#93c5fd',
        gradient1: 'rgba(37,99,235,.20)', gradient2: 'rgba(34,211,238,.22)', gradient3: 'rgba(29,78,216,.14)',
        bg1: '#f8fbff', bg2: '#eef6ff', bg3: '#eaf3ff', cyan: '#22d3ee', shadow: 'rgba(30,64,175,.10)'
      },
      emerald: {
        b950: '#022c22', b900: '#064e3b', b800: '#065f46', b700: '#047857', b600: '#059669', b500: '#10b981', b400: '#34d399', b300: '#6ee7b7',
        gradient1: 'rgba(5,150,105,.18)', gradient2: 'rgba(20,184,166,.20)', gradient3: 'rgba(4,120,87,.12)',
        bg1: '#fcfdfa', bg2: '#f2faf5', bg3: '#edf7f2', cyan: '#0d9488', shadow: 'rgba(4,120,87,.08)'
      },
      sunset: {
        b950: '#431407', b900: '#7c2d12', b800: '#9a3412', b700: '#c2410c', b600: '#ea580c', b500: '#f97316', b400: '#fb923c', b300: '#fdbb2d',
        gradient1: 'rgba(234,88,12,.18)', gradient2: 'rgba(245,158,11,.20)', gradient3: 'rgba(180,83,9,.12)',
        bg1: '#fdfbfa', bg2: '#faf0e6', bg3: '#f5e6d3', cyan: '#f59e0b', shadow: 'rgba(124,45,18,.08)'
      },
      mystic: {
        b950: '#2e1065', b900: '#4c1d95', b800: '#5b21b6', b700: '#6d28d9', b600: '#7c3aed', b500: '#8b5cf6', b400: '#a78bfa', b300: '#c4b5fd',
        gradient1: 'rgba(124,58,237,.18)', gradient2: 'rgba(99,102,241,.20)', gradient3: 'rgba(109,40,217,.12)',
        bg1: '#faf9fd', bg2: '#f3effa', bg3: '#ece5f8', cyan: '#6366f1', shadow: 'rgba(109,40,217,.08)'
      },
      rose: {
        b950: '#4c0519', b900: '#881337', b800: '#9d174d', b700: '#be123c', b600: '#db2777', b500: '#ec4899', b400: '#f472b6', b300: '#fbcfe8',
        gradient1: 'rgba(219,39,119,.18)', gradient2: 'rgba(244,63,94,.20)', gradient3: 'rgba(190,18,60,.12)',
        bg1: '#fffbfb', bg2: '#faf0f2', bg3: '#f8e6ea', cyan: '#e11d48', shadow: 'rgba(190,18,60,.08)'
      }
    };

    const currentThemeVals = themeSetup[appTheme] || themeSetup.ocean;

    const themeUi = {
      emerald: {
        textActive: 'text-emerald-700',
        bgBg: 'bg-emerald-500/10',
        borderActive: 'border-emerald-500',
        shadowActive: 'shadow-emerald-500/5',
        textMobile: 'text-emerald-600',
        progressText: 'text-emerald-600 bg-emerald-50/70 border border-emerald-100',
        progressBar: 'bg-emerald-500',
        buttonPrimary: 'bg-emerald-600 text-white',
        accentText: 'text-emerald-600'
      },
      ocean: {
        textActive: 'text-blue-700',
        bgBg: 'bg-blue-500/10',
        borderActive: 'border-blue-500',
        shadowActive: 'shadow-blue-500/5',
        textMobile: 'text-blue-600',
        progressText: 'text-blue-600 bg-blue-50/70 border border-blue-100',
        progressBar: 'bg-blue-500',
        buttonPrimary: 'bg-blue-600 text-white',
        accentText: 'text-blue-600'
      },
      sunset: {
        textActive: 'text-orange-850',
        bgBg: 'bg-orange-500/10',
        borderActive: 'border-orange-500',
        shadowActive: 'shadow-orange-500/5',
        textMobile: 'text-orange-600',
        progressText: 'text-orange-700 bg-orange-50/70 border border-orange-100',
        progressBar: 'bg-orange-500',
        buttonPrimary: 'bg-orange-600 text-white',
        accentText: 'text-orange-600'
      },
      mystic: {
        textActive: 'text-purple-700',
        bgBg: 'bg-purple-500/10',
        borderActive: 'border-purple-500',
        shadowActive: 'shadow-purple-500/5',
        textMobile: 'text-purple-600',
        progressText: 'text-purple-600 bg-purple-50/70 border border-purple-100',
        progressBar: 'bg-purple-500',
        buttonPrimary: 'bg-purple-600 text-white',
        accentText: 'text-purple-600'
      },
      rose: {
        textActive: 'text-rose-720',
        bgBg: 'bg-rose-500/10',
        borderActive: 'border-rose-500',
        shadowActive: 'shadow-rose-500/5',
        textMobile: 'text-rose-600',
        progressText: 'text-rose-600 bg-rose-50/70 border border-rose-100',
        progressBar: 'bg-rose-500',
        buttonPrimary: 'bg-rose-600 text-white',
        accentText: 'text-rose-600'
      }
    };

    // We generate a full responsive client-interactive static html file
    return `<!DOCTYPE html>
<html lang="vi" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lesson.lessonTitle} - Học tập tương tác</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Marked.js CDN for robust markdown parsing (tables, lists, nested lists etc) -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Google fonts (Montserrat & Inter) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            serif: ['"Playfair Display"', 'serif'],
          }
        }
      }
    }
  </script>
  <style>
    /* Flashcard beautiful flip style */
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-3d {
      transform-style: preserve-3d;
    }
    .backface-hidden {
      backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
    .lucide {
      stroke-width: 1.5;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: all 0.3s ease;
    }
    .nav-nav-btn.border-l-4 .lucide,
    .mobile-nav-btn.text-blue-600 .lucide {
      filter: drop-shadow(0 0 6px currentColor);
      stroke-width: 2;
    }
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    /* Elegant Custom Parsed Markdown Table styling for production file */
    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.8rem;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .prose thead {
      background-color: #f1f5f9;
      border-bottom: 2px solid #e2e8f0;
    }
    .prose th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      border-right: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .prose th:last-child {
      border-right: none;
    }
    .prose tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .prose tr:hover {
      background-color: #f1f5f9/60;
    }
    .prose td {
      padding: 0.875rem 1rem;
      color: #334155;
      line-height: 1.6;
      border-right: 1px solid #f1f5f9;
      font-weight: 500;
    }
    .prose td:last-child {
      border-right: none;
    }
    .prose code {
      background-color: #f1f5f9;
      color: #e11d48;
      font-family: monospace;
      font-size: 0.75rem;
      padding: 0.125rem 0.3rem;
      border-radius: 0.25rem;
      border: 1px solid #e2e8f0;
    }
    .prose blockquote {
      border-left: 4px solid #10b981;
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #475569;
      background-color: #f8fafc;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .prose strong {
      font-weight: 800;
      color: #0f172a;
      background-color: #f0fdf4;
      padding-left: 0.25rem;
      padding-right: 0.25rem;
      border-radius: 0.25rem;
    }
    .prose p, .prose li, .prose td {
      white-space: pre-line;
    }
    .prose ul, .prose ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    .prose li {
      margin: 0.375rem 0;
      list-style-type: disc;
    }
    .prose ol li {
      list-style-type: decimal;
    }

    /* MODERN BLUE GLASS & IMMERSIVE PRESENTATION SCHEMA */
    :root {
      --blue-950: ${currentThemeVals.b950};
      --blue-900: ${currentThemeVals.b900};
      --blue-800: ${currentThemeVals.b800};
      --blue-700: ${currentThemeVals.b700};
      --blue-600: ${currentThemeVals.b600};
      --blue-500: ${currentThemeVals.b500};
      --blue-400: ${currentThemeVals.b400};
      --blue-300: ${currentThemeVals.b300};
      --cyan-400: ${currentThemeVals.cyan};
      --sky-100: ${appTheme === 'emerald' ? '#e6f4ea' : appTheme === 'sunset' ? '#fdf2e9' : appTheme === 'mystic' ? '#f3e8ff' : appTheme === 'rose' ? '#ffe4e6' : '#e0f2fe'};
      --glass-bg: rgba(255,255,255,.72);
      --glass-border: rgba(147,197,253,.38);
      --glass-shadow: 0 24px 70px rgba(15, 23, 42, .14);

      --ux-primary: ${currentThemeVals.b600};
      --ux-primary-2: ${currentThemeVals.b400};
      --ux-primary-dark: ${currentThemeVals.b800};
      --ux-soft: ${appTheme === 'emerald' ? 'rgba(209, 250, 229, .78)' : appTheme === 'sunset' ? 'rgba(255, 237, 213, .78)' : appTheme === 'mystic' ? 'rgba(243, 232, 255, .78)' : appTheme === 'rose' ? 'rgba(ffe4e6, .78)' : 'rgba(219, 234, 254, .78)'};
      --ux-soft-2: ${appTheme === 'emerald' ? 'rgba(209, 250, 229, .86)' : appTheme === 'sunset' ? 'rgba(255, 237, 213, .86)' : appTheme === 'mystic' ? 'rgba(243, 232, 255, .86)' : appTheme === 'rose' ? 'rgba(ffe4e6, .86)' : 'rgba(224, 242, 254, .86)'};
      --ux-good-bg: ${appTheme === 'emerald' ? 'rgba(209, 250, 229, .96)' : appTheme === 'sunset' ? 'rgba(255, 237, 213, .96)' : appTheme === 'mystic' ? 'rgba(243, 232, 255, .96)' : appTheme === 'rose' ? 'rgba(ffe4e6, .96)' : 'rgba(219, 234, 254, .96)'};
      --ux-good-border: rgba(37, 99, 235, .72);
      --ux-good-text: #1e3a8a;
      --ux-bad-bg: rgba(254, 226, 226, .92);
      --ux-bad-border: rgba(239, 68, 68, .72);
      --ux-bad-text: #991b1b;
    }

    html { scroll-behavior: smooth; }

    body {
      background:
        radial-gradient(circle at 8% 8%, ${currentThemeVals.gradient1}, transparent 32%),
        radial-gradient(circle at 88% 12%, ${currentThemeVals.gradient2}, transparent 30%),
        radial-gradient(circle at 70% 90%, ${currentThemeVals.gradient3}, transparent 32%),
        linear-gradient(135deg, ${currentThemeVals.bg1} 0%, ${currentThemeVals.bg2} 42%, ${currentThemeVals.bg3} 100%) !important;
      color: #0f172a !important;
      position: relative;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(30,64,175,.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,64,175,.055) 1px, transparent 1px);
      background-size: 34px 34px;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,.8), transparent 78%);
      z-index: 0;
    }

    header {
      background: rgba(255,255,255,.76) !important;
      border-bottom: 1px solid rgba(147,197,253,.42) !important;
      box-shadow: 0 14px 40px ${currentThemeVals.shadow} !important;
      backdrop-filter: blur(18px) saturate(170%);
      -webkit-backdrop-filter: blur(18px) saturate(170%);
    }

    header .bg-emerald-600,
    .bg-emerald-600,
    button.bg-emerald-600 {
      background: linear-gradient(135deg, var(--blue-600), var(--cyan-400)) !important;
      box-shadow: 0 14px 35px ${currentThemeVals.shadow} !important;
    }

    .text-emerald-600,
    .text-emerald-700,
    .text-emerald-800,
    .text-emerald-850 {
      color: var(--blue-700) !important;
    }

    .border-emerald-500,
    .border-emerald-500\/20,
    .border-emerald-100,
    .border-teal-100,
    .border-indigo-100 {
      border-color: var(--blue-300) !important;
    }

    .hover\:bg-emerald-700:hover,
    button:hover.bg-emerald-600 {
      background: linear-gradient(135deg, var(--blue-700), var(--blue-500)) !important;
      transform: translateY(-1px);
    }

    .max-w-6xl > aside > div > div,
    .tab-content,
    #slide-canvas,
    .bg-white.rounded-3xl,
    .content-card,
    .problem-card,
    .vision-box,
    .identity-card,
    .role-card,
    .objective-cards > div,
    .platform-item,
    .support-item,
    .action-step,
    .nq-quote,
    .future-vision,
    .final-message,
    .quote-block {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      box-shadow: var(--glass-shadow) !important;
      backdrop-filter: blur(18px) saturate(165%);
      -webkit-backdrop-filter: blur(18px) saturate(165%);
    }

    .tab-content,
    #slide-canvas {
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }

    .tab-content::before,
    #slide-canvas::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(115deg, rgba(255,255,255,.75) 0%, transparent 18%, transparent 82%, rgba(147,197,253,.16) 100%);
      opacity: .62;
      z-index: 0;
    }

    .tab-content > *,
    #slide-canvas > * {
      position: relative;
      z-index: 1;
    }

    #slide-canvas {
      background:
        radial-gradient(circle at 20% 15%, ${currentThemeVals.gradient1}, transparent 28%),
        radial-gradient(circle at 88% 10%, ${currentThemeVals.gradient2}, transparent 26%),
        linear-gradient(145deg, rgba(255,255,255,.78), ${currentThemeVals.bg3}) !important;
      border-radius: 2rem !important;
      border-color: var(--blue-300) !important;
      box-shadow: 0 30px 90px ${currentThemeVals.shadow} !important;
    }

    #slide-accent-bar,
    #global-progress-bar {
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, var(--blue-800), var(--blue-400), var(--blue-600), var(--cyan-400)) !important;
      background-size: 260% 100% !important;
      animation: blueGradientFlow 7s linear infinite;
      box-shadow: 0 0 22px var(--blue-400), 0 0 48px var(--blue-600) !important;
    }

    #slide-accent-bar::after,
    #global-progress-bar::after {
      content: "";
      position: absolute;
      inset: 0;
      width: 42%;
      transform: translateX(-120%) skewX(-20deg);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.88), rgba(255,255,255,.25), transparent);
      animation: glassSweep 2.6s ease-in-out infinite;
      filter: blur(.2px);
    }

    .progress-bar {
      background: var(--ux-soft) !important;
      box-shadow: inset 0 0 0 1px var(--blue-300);
    }

    @keyframes glassSweep {
      0% { transform: translateX(-140%) skewX(-20deg); opacity: 0; }
      18% { opacity: .95; }
      58% { opacity: .78; }
      100% { transform: translateX(260%) skewX(-20deg); opacity: 0; }
    }

    @keyframes blueGradientFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .nav-nav-btn {
      border: 1px solid transparent !important;
      color: #334155 !important;
    }

    .nav-nav-btn:hover {
      background: var(--ux-soft) !important;
      border-color: var(--blue-350) !important;
      transform: translateX(2px);
    }

    .nav-nav-btn.border-emerald-500,
    .nav-nav-btn.bg-blue-500\/10 {
      background: var(--ux-soft-2) !important;
      color: var(--blue-700) !important;
      border-left-color: var(--blue-600) !important;
      box-shadow: 0 12px 28px ${currentThemeVals.shadow} !important;
    }

    .nav-icon-wrapper,
    .w-10.h-10.rounded-xl,
    .flex.items-center.justify-center.w-6.h-6.rounded-full,
    .step-number,
    .card-icon,
    .problem-icon,
    .obj-icon,
    .role-avatar,
    .identity-icon {
      background: linear-gradient(135deg, var(--blue-600), var(--cyan-400)) !important;
      color: white !important;
      box-shadow: 0 12px 30px ${currentThemeVals.shadow} !important;
      border-color: rgba(255,255,255,.35) !important;
    }

    h1, h2, h3,
    .slide-title,
    #slide-title,
    .font-serif {
      color: #0b1f4d !important;
    }

    #slide-title,
    .slide-title {
      text-shadow: 0 2px 20px rgba(59,130,246,.10);
    }

    .prose strong,
    strong,
    .text-accent,
    .highlight-inline {
      color: #1d4ed8 !important;
      background: linear-gradient(90deg, rgba(219,234,254,.8), rgba(224,242,254,.55)) !important;
      border-radius: .45rem;
    }

    .prose blockquote,
    .bg-amber-500\/5,
    .bg-white.border-2.border-dashed,
    .bg-slate-50,
    .bg-teal-50\/20,
    .bg-indigo-50\/10,
    .bg-slate-100 {
      background: rgba(239,246,255,.72) !important;
      border-color: rgba(147,197,253,.38) !important;
    }

    .text-orange-600,
    .text-pink-600,
    .text-indigo-700,
    .text-teal-700,
    .text-blue-600,
    .text-amber-800 {
      color: #1d4ed8 !important;
    }

    .bg-teal-600,
    button.bg-teal-600,
    .bg-pink-50,
    .bg-teal-50,
    .bg-indigo-50,
    .bg-amber-50 {
      background: linear-gradient(135deg, rgba(37,99,235,.12), rgba(34,211,238,.12)) !important;
      color: #1d4ed8 !important;
      border-color: rgba(59,130,246,.28) !important;
    }

    button.bg-teal-600,
    button.bg-emerald-600 {
      color: #fff !important;
    }

    textarea,
    input {
      background: rgba(255,255,255,.86) !important;
      border-color: rgba(147,197,253,.55) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 0 10px 30px rgba(37,99,235,.06) !important;
    }

    textarea:focus,
    input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,.18), 0 16px 35px rgba(37,99,235,.10) !important;
    }

    [class^="q-btn-"] {
      background: rgba(255,255,255,.75) !important;
      border-color: rgba(147,197,253,.38) !important;
      box-shadow: 0 12px 28px rgba(15,23,42,.05) !important;
    }

    [class^="q-btn-"]:hover {
      border-color: rgba(37,99,235,.55) !important;
      background: rgba(219,234,254,.74) !important;
      transform: translateY(-1px);
    }

    .rounded-3xl { border-radius: 1.8rem !important; }
    .rounded-2xl { border-radius: 1.35rem !important; }
    .shadow-sm, .shadow-md, .shadow-2xl { box-shadow: var(--glass-shadow) !important; }

    .border-b,
    .p-5.sm\:p-7 {
      position: relative;
      overflow: hidden;
    }

    .border-b::after,
    .p-5.sm\:p-7::after {
      content: "";
      position: absolute;
      left: -20%;
      bottom: 0;
      height: 2px;
      width: 38%;
      background: linear-gradient(90deg, transparent, rgba(59,130,246,.85), rgba(255,255,255,.95), transparent);
      animation: glassLineMove 4.2s ease-in-out infinite;
    }

    @keyframes glassLineMove {
      0% { left: -40%; opacity: 0; }
      20% { opacity: 1; }
      70% { opacity: 1; }
      100% { left: 105%; opacity: 0; }
    }

    .tab-content p,
    .tab-content li,
    #slide-body,
    #doc-section-body {
      letter-spacing: -.005em;
    }

    .tab-content:hover,
    .bg-white.rounded-3xl:hover,
    aside .bg-white.rounded-2xl:hover {
      box-shadow: 0 28px 80px rgba(30, 64, 175, .16) !important;
    }

    .perspective-1000 {
      perspective: 1400px;
    }

    .perspective-1000 > div[id^="card-inner-"] {
      min-height: 12rem;
      border: 1px solid rgba(147, 197, 253, .42) !important;
      box-shadow: 0 18px 45px rgba(15, 23, 42, .10) !important;
      transform-style: preserve-3d;
      will-change: transform;
    }

    .perspective-1000 > div[id^="card-inner-"]:hover {
      box-shadow: 0 28px 70px rgba(37, 99, 235, .18) !important;
    }

    .perspective-1000 .absolute.backface-hidden:not(.rotate-y-180) {
      background:
        radial-gradient(circle at 12% 0%, rgba(59,130,246,.12), transparent 34%),
        linear-gradient(145deg, rgba(255,255,255,.94), rgba(239,246,255,.88)) !important;
      border: 1px solid rgba(147,197,253,.36);
    }

    .perspective-1000 .absolute.backface-hidden.rotate-y-180 {
      background:
        radial-gradient(circle at 10% 15%, rgba(56,189,248,.32), transparent 34%),
        radial-gradient(circle at 90% 12%, rgba(37,99,235,.34), transparent 30%),
        linear-gradient(145deg, #0b1f4d 0%, #123a7a 52%, #075985 100%) !important;
      color: #f8fbff !important;
      border: 1px solid rgba(191,219,254,.34) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 24px 70px rgba(30,64,175,.28) !important;
      overflow: hidden;
    }

    .perspective-1000 .absolute.backface-hidden.rotate-y-180::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(115deg, rgba(255,255,255,.22), transparent 28%, transparent 72%, rgba(56,189,248,.18));
    }

    .perspective-1000 .absolute.backface-hidden.rotate-y-180 > * {
      position: relative;
      z-index: 1;
    }

    .perspective-1000 .absolute.backface-hidden.rotate-y-180 span,
    .perspective-1000 .absolute.backface-hidden.rotate-y-180 div {
      color: #eff6ff !important;
    }

    .perspective-1000 .absolute.backface-hidden.rotate-y-180 span:first-child {
      background: rgba(219,234,254,.18) !important;
      color: #bfdbfe !important;
      border: 1px solid rgba(191,219,254,.25);
    }

    [class^="q-btn-"] {
      position: relative;
      overflow: hidden;
      min-height: 76px;
    }

    [class^="q-btn-"]::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,.38) 45%, transparent 72%);
      transform: translateX(-120%);
      transition: transform .65s ease;
      pointer-events: none;
    }

    [class^="q-btn-"]:hover::after,
    [class^="q-btn-"].answer-correct::after {
      transform: translateX(120%);
    }

    [class^="q-btn-"].answer-correct {
      background: linear-gradient(135deg, var(--ux-good-bg), var(--ux-soft-2)) !important;
      border-color: var(--ux-good-border) !important;
      color: var(--ux-good-text) !important;
      box-shadow: 0 18px 45px rgba(37,99,235,.20), 0 0 0 3px rgba(59,130,246,.16) !important;
      animation: correctBluePop .42s ease both;
    }

    [class^="q-btn-"].answer-wrong {
      background: linear-gradient(135deg, var(--ux-bad-bg), rgba(255,241,242,.94)) !important;
      border-color: var(--ux-bad-border) !important;
      color: var(--ux-bad-text) !important;
      box-shadow: 0 16px 40px rgba(239,68,68,.15), 0 0 0 3px rgba(239,68,68,.10) !important;
      animation: wrongShake .36s ease both;
    }

    [class^="q-btn-"]:disabled {
      cursor: default !important;
      opacity: 1 !important;
    }

    .quiz-feedback-chip {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      margin: .25rem 0 .75rem;
      padding: .55rem .8rem;
      border-radius: 999px;
      font-size: .74rem;
      font-weight: 900;
      letter-spacing: .01em;
    }

    .quiz-feedback-chip.good {
      background: rgba(219,234,254,.92);
      color: #1e40af;
      border: 1px solid rgba(59,130,246,.32);
    }

    .quiz-feedback-chip.bad {
      background: rgba(254,226,226,.86);
      color: #991b1b;
      border: 1px solid rgba(239,68,68,.25);
    }

    #quiz-score-banner {
      background: linear-gradient(135deg, rgba(219,234,254,.92), rgba(224,242,254,.92)) !important;
      border-color: rgba(59,130,246,.38) !important;
      color: #0b1f4d !important;
      box-shadow: 0 24px 70px rgba(37,99,235,.16) !important;
    }

    .learning-coach-panel {
      background: linear-gradient(135deg, rgba(219,234,254,.86), rgba(224,242,254,.72));
      border: 1px solid rgba(59,130,246,.28);
      border-radius: 1.25rem;
      padding: 1rem;
      box-shadow: 0 16px 45px rgba(37,99,235,.10);
    }

    .learning-coach-panel .coach-pill {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .35rem .65rem;
      border-radius: 999px;
      background: rgba(255,255,255,.70);
      border: 1px solid rgba(147,197,253,.32);
      font-size: .68rem;
      font-weight: 955;
      color: #1d4ed8;
    }

    .microcopy-muted {
      color: #475569;
      font-size: .78rem;
      line-height: 1.6;
    }

    /* Core Slide Presentation structure mapping */
    #tab-sections #slide-canvas {
      min-height: 560px !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      border: 1px solid rgba(147,197,253,.46) !important;
      background:
        radial-gradient(circle at 12% 8%, rgba(59,130,246,.18), transparent 30%),
        radial-gradient(circle at 92% 12%, rgba(34,211,238,.16), transparent 28%),
        linear-gradient(145deg, rgba(255,255,255,.94), rgba(239,246,255,.86)) !important;
    }

    #tab-sections #slide-canvas .overflow-y-auto {
      max-height: none !important;
      overflow-y: auto !important;
      justify-content: flex-start !important;
      padding-top: 1.6rem !important;
      padding-bottom: 1.6rem !important;
    }

    #tab-sections #slide-title {
      font-family: "Playfair Display", serif !important;
      font-size: clamp(1.35rem, 2.1vw, 2rem) !important;
      line-height: 1.18 !important;
      color: #082f6f !important;
      border: 0 !important;
      padding-bottom: 0 !important;
      margin-bottom: .85rem !important;
      max-width: 840px;
    }

    #tab-sections #slide-body {
      font-size: .94rem !important;
      line-height: 1.64 !important;
      color: #1e293b !important;
    }

    .core-slide-layout {
      display: grid;
      gap: 1rem;
    }

    .core-slide-kicker {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: .45rem;
      padding: .4rem .72rem;
      border-radius: 999px;
      background: rgba(219,234,254,.78);
      border: 1px solid rgba(59,130,246,.28);
      color: #1d4ed8;
      font-size: .7rem;
      font-weight: 955;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .core-slide-hero {
      position: relative;
      padding: 1.05rem 1.15rem;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(255,255,255,.88), rgba(219,234,254,.70));
      border: 1px solid rgba(147,197,253,.42);
      box-shadow: 0 20px 55px rgba(37,99,235,.10);
      overflow: hidden;
    }

    .core-slide-hero::after {
      content: "";
      position: absolute;
      top: -30%;
      right: -8%;
      width: 14rem;
      height: 14rem;
      border-radius: 999px;
      background: radial-gradient(circle, rgba(56,189,248,.20), transparent 62%);
      pointer-events: none;
    }

    .core-slide-hero p {
      position: relative;
      z-index: 1;
      margin: 0 !important;
      font-size: 1rem;
      line-height: 1.62;
      color: #0f172a;
      font-weight: 650;
    }

    .core-slide-card-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1rem;
    }
    .core-bento-12 { grid-column: span 12 / span 12; }
    .core-bento-6 { grid-column: span 6 / span 6; }
    .core-bento-4 { grid-column: span 4 / span 4; }

    .core-slide-comparison {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .core-slide-timeline {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 1rem;
    }

    .core-slide-twocolumn {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .core-slide-comparison, .core-slide-twocolumn, .core-slide-card-grid {
        grid-template-columns: 1fr;
      }
      .core-bento-12, .core-bento-6, .core-bento-4 { grid-column: span 1 / span 1; }
      .core-slide-timeline {
        flex-direction: column;
      }
    }

    .core-slide-point {
      min-height: 120px;
      padding: .95rem;
      border-radius: 1.1rem;
      background: rgba(255,255,255,.78);
      border: 1px solid rgba(147,197,253,.38);
      box-shadow: 0 14px 34px rgba(15,23,42,.07);
    }

    .core-slide-point .point-index {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: .7rem;
      background: linear-gradient(135deg, #2563eb, #38bdf8);
      color: #fff;
      font-size: .72rem;
      font-weight: 955;
      box-shadow: 0 10px 24px rgba(37,99,235,.24);
      margin-bottom: .55rem;
    }

    .core-slide-point strong {
      display: block;
      margin-bottom: .28rem;
      color: #1d4ed8 !important;
      background: transparent !important;
      padding: 0 !important;
      font-weight: 955;
    }

    .core-slide-point span {
      display: block;
      color: #334155;
      font-size: .82rem;
      line-height: 1.55;
      font-weight: 600;
    }

    .core-slide-takeaway {
      display: flex;
      gap: .8rem;
      align-items: flex-start;
      padding: .9rem 1rem;
      border-radius: 1.15rem;
      background: linear-gradient(135deg, rgba(30,64,175,.94), rgba(2,132,199,.88));
      color: #eff6ff;
      box-shadow: 0 20px 46px rgba(37,99,235,.20);
    }

    .core-slide-takeaway .takeaway-icon {
      flex: 0 0 auto;
      width: 2rem;
      height: 2rem;
      border-radius: .85rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,.16);
      border: 1px solid rgba(255,255,255,.22);
    }

    .core-slide-takeaway p {
      margin: 0 !important;
      color: #eff6ff;
      font-size: .9rem;
      line-height: 1.55;
      font-weight: 720;
    }

    .core-slide-takeaway strong {
      color: #fff !important;
      background: transparent !important;
      padding: 0 !important;
    }

    #slide-example-content,
    #quickcheck-question {
      font-size: .86rem !important;
      line-height: 1.58 !important;
    }

    #slide-presentation-container > .grid {
      align-items: stretch;
    }

    #slide-presentation-container > .grid > div {
      min-height: 210px;
    }

    #tab-sections #slide-canvas.core-dark-slide {
      background:
        radial-gradient(circle at 12% 8%, rgba(56,189,248,.18), transparent 30%),
        radial-gradient(circle at 92% 12%, rgba(37,99,235,.20), transparent 28%),
        linear-gradient(145deg, #07152f 0%, #0f2754 55%, #082f49 100%) !important;
      border-color: rgba(96,165,250,.28) !important;
      color: #eff6ff !important;
    }

    #tab-sections #slide-canvas.core-dark-slide #slide-title { color: #dbeafe !important; }
    #tab-sections #slide-canvas.core-dark-slide #slide-body { color: #e0f2fe !important; }
    #tab-sections #slide-canvas.core-dark-slide .core-slide-kicker {
      background: rgba(59,130,246,.16);
      border-color: rgba(147,197,253,.25);
      color: #bfdbfe;
    }
    #tab-sections #slide-canvas.core-dark-slide .core-slide-hero,
    #tab-sections #slide-canvas.core-dark-slide .core-slide-point {
      background: rgba(15,23,42,.52);
      border-color: rgba(147,197,253,.20);
      box-shadow: 0 18px 48px rgba(0,0,0,.22);
    }
    #tab-sections #slide-canvas.core-dark-slide .core-slide-hero p,
    #tab-sections #slide-canvas.core-dark-slide .core-slide-point span { color: #e0f2fe; }

    @keyframes correctBluePop {
      0% { transform: scale(.985); }
      60% { transform: scale(1.018); }
      100% { transform: scale(1); }
    }

    @keyframes wrongShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      55% { transform: translateX(3px); }
      80% { transform: translateX(-1px); }
    }

    @media (max-width: 900px) {
      .core-slide-card-grid { grid-template-columns: 1fr; }
      #tab-sections #slide-canvas { min-height: 640px !important; }
    }

    @media (max-width: 640px) {
      #tab-sections #slide-canvas { min-height: 680px !important; border-radius: 1.35rem !important; }
      #tab-sections #slide-canvas .p-6.sm\:p-9 { padding: 1rem !important; }
      .core-slide-hero { padding: .9rem; }
      .core-slide-point { min-height: auto; }
      .core-slide-takeaway { padding: .85rem; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col antialiased">

  <!-- Header -->
  <header class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-200">
          🎓
        </div>
        <div>
          <span class="text-xs uppercase tracking-wider font-extrabold text-emerald-600">Bài Học Tương Tác Số</span>
          <h1 class="text-base sm:text-lg font-bold text-slate-800 leading-tight">${lesson.lessonTitle}</h1>
        </div>
      </div>
      
      <div class="hidden md:flex items-center gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium">
          <span>📚 <strong>Môn học:</strong> ${subject}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-full font-medium">
          <span>⏱️ <strong>Thời lượng:</strong> ${duration}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full font-bold">
          <span>👥 ${level}</span>
        </div>
      </div>
    </div>

    <!-- Active Global Progress bar -->
    <div class="w-full bg-slate-100 h-1.5">
      <div id="global-progress-bar" class="bg-gradient-to-r from-teal-500 to-emerald-600 h-1.5 transition-all duration-500 rounded-r-full" style="width: 15%"></div>
    </div>
  </header>

  <!-- Shell Layout -->
  <div class="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex-grow w-full flex flex-col lg:flex-row gap-6">
    
    <!-- Left Navigation Desktop Column (1/4 space) -->
    <aside class="hidden lg:block lg:w-1/4 flex-shrink-0">
      <div class="sticky top-24 space-y-4">
        <!-- Lộ trình học tập -->
        <div class="backdrop-blur-xl bg-white/40 border border-white/25 p-4 rounded-3xl shadow-xl shadow-slate-250/40 space-y-2">
          <p class="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider px-3 mb-2">Lộ trình học tập</p>
          
          <button id="nav-intro" onclick="showTab('intro')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-blue-700 bg-blue-500/10 border-l-4 border-blue-500 backdrop-blur-md shadow-sm shadow-blue-500/5">
            <i data-lucide="book-marked" class="w-4 h-4"></i> <span>Giới thiệu & Mục tiêu</span>
          </button>
          
          <button id="nav-warmup" onclick="showTab('warmup')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="lightbulb" class="w-4 h-4"></i> <span>Kích hoạt trí não</span>
          </button>
          
          <button id="nav-sections" onclick="showTab('sections')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="book-open" class="w-4 h-4"></i> <span>Kiến thức cốt lõi</span>
          </button>
          
          <button id="nav-flashcards" onclick="showTab('flashcards')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="layers" class="w-4 h-4"></i> <span>Thẻ thuật ngữ</span>
          </button>
          
          <button id="nav-quiz" onclick="showTab('quiz')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="help-circle" class="w-4 h-4"></i> <span>Trắc nghiệm Quiz</span>
          </button>
          
          <button id="nav-casestudy" onclick="showTab('casestudy')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="award" class="w-4 h-4"></i> <span>Tình huống thực tế</span>
          </button>
          
          <button id="nav-reflection" onclick="showTab('reflection')" class="nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm">
            <i data-lucide="pen-tool" class="w-4 h-4"></i> <span>Bản ghi thu hoạch</span>
          </button>

          <div class="mt-4 pt-4 border-t border-slate-100/50 text-center">
            <span id="global-progress-text" class="text-xs font-bold text-blue-600 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-full">15% Hoàn thành</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Right Content Column -->
    <main class="flex-grow lg:w-3/4">

      <!-- TAB 1: INTRODUCTION -->
      <section id="tab-intro" class="tab-content bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <span class="text-xs uppercase tracking-widest font-extrabold text-emerald-600">Lời mở đầu</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">Chào mừng bạn đến với bài học trực tuyến!</h2>
        </div>
        
        <div class="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
          ${lesson.introduction.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>

        <div class="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 sm:p-6 rounded-2xl border border-emerald-500/20">
          <h3 class="font-bold text-emerald-800 text-sm sm:text-base flex items-center gap-2 mb-3">
            <i data-lucide="target" class="w-5 h-5"></i> 3 Mục tiêu học tập cốt lõi (Thang Bloom)
          </h3>
          <ul class="space-y-3">
            ${lesson.learningObjectives.map((obj, i) => `
              <li class="flex items-start gap-3">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex-shrink-0 mt-0.5">${i + 1}</span>
                <span class="text-slate-700 text-sm leading-relaxed font-semibold">${obj}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="flex justify-end pt-2">
          <button onclick="showTab('warmup')" class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm flex items-center gap-2">
            Đến phần hoạt động khởi động <span class="text-lg">⚡</span>
          </button>
        </div>
      </section>

      <!-- TAB 2: WARM UP -->
      <section id="tab-warmup" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <span class="text-xs uppercase tracking-widest font-extrabold text-orange-600">Hoạt động khởi động</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">${lesson.warmUp.title}</h2>
        </div>

        <div class="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-3">
          <h3 class="font-bold text-amber-800 text-sm flex items-center gap-2">
            💡 Ý nghĩa & Bối cảnh:
          </h3>
          <p class="text-slate-600 text-sm leading-relaxed">${lesson.warmUp.description}</p>
        </div>

        <div class="bg-white border-2 border-dashed border-slate-200 p-6 rounded-2xl space-y-4">
          <span class="text-xs font-bold text-teal-600 uppercase bg-teal-50 px-2.5 py-1 rounded-full">🎯 Thử thách ngay</span>
          <h3 class="font-bold text-slate-800 text-sm sm:text-base">${lesson.warmUp.task}</h3>
          
          <textarea id="warmup-response" placeholder="Hãy viết ý kiến ngắn gọn của bạn tại đây để hoạt hóa tư duy..." rows="3" class="w-full text-sm border border-slate-250 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"></textarea>
          
          <div class="flex justify-end gap-3">
            <button onclick="saveWarm()" class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all cursor-pointer">Lưu nháp</button>
            <button onclick="submitWarm()" class="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all cursor-pointer">Gửi phản hồi khởi động</button>
          </div>
          <div id="warmup-feedback" class="hidden text-xs text-green-700 bg-green-50 border border-green-100 p-3 rounded-xl">
            🎉 Hoan hô! Bạn đã kích hoạt trạng thái tư duy thành công. Hãy cùng bước sang nội dung kiến thức chuẩn mực tiếp theo.
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <button onclick="showTab('intro')" class="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-slate-600 text-sm flex items-center gap-2 cursor-pointer">
            Quay lại phần Giới thiệu
          </button>
          <button onclick="showTab('sections')" class="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2 cursor-pointer">
            Khám phá lý thuyết <span class="text-lg">📖</span>
          </button>
        </div>
      </section>

      <!-- TAB 3: SECTIONS -->
      <section id="tab-sections" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        
        <!-- Toggle Layout Control Bar & Customization Panel -->
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm mb-2">
            <div class="space-y-0.5">
              <span class="text-[10px] uppercase font-black text-emerald-700 tracking-wider flex items-center gap-1">
                <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Kiến thức bài giảng
              </span>
              <p class="text-xs font-bold text-slate-500">Chế độ hiển thị học liệu tương tác:</p>
            </div>
            
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <div class="bg-white p-0.5 border border-slate-200 rounded-xl flex shadow-sm w-full sm:w-auto">
                <button onclick="changeSlideMode(true)" id="btn-slide-mode" class="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all bg-emerald-600 text-white shadow-sm cursor-pointer select-none">🖥️ Slide Trình Chiếu</button>
                <button onclick="changeSlideMode(false)" id="btn-doc-mode" class="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer select-none">📄 Đọc Văn Bản</button>
              </div>
              
              <button onclick="toggleSlideTheme()" id="btn-slide-theme" class="p-2 border bg-white border-slate-250 rounded-xl shadow-sm hover:bg-slate-50 text-xs text-slate-600 font-bold transition-all flex items-center gap-1 justify-center cursor-pointer select-none" title="Đổi màu nền tối/sáng cho Slide">
                🌙 Giao diện Tối
              </button>
            </div>
          </div>
        </div>

        <!-- Mode 1: DOCK VIEW presentation canvas (Slide Show Mode - BEAUTIFUL CANVAS DESIGN - EXPANDED FULL WIDTH) -->
        <div id="slide-presentation-container" class="space-y-6">
          
          <!-- Full-Width Slide Section -->
          <div class="w-full flex flex-col justify-between space-y-4">
            <div id="slide-canvas" class="relative rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-500 min-h-[360px] sm:min-h-[460px] flex flex-col justify-between bg-white border-slate-100 text-slate-850">
              <!-- Background Decorations for High fidelity slide style -->
              <div id="slide-decorations" class="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-300">
                <span id="glow-circle-1" class="absolute top-10 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></span>
                <span id="glow-circle-2" class="absolute bottom-10 right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl"></span>
                <div id="grid-pattern-overlay" class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
              </div>

              <!-- Visual highlight bar -->
              <div id="slide-accent-bar" class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 z-10 transition-all duration-500"></div>
              
              <div class="p-5 sm:p-7 flex justify-between items-center border-b border-opacity-10 border-slate-400 relative z-10">
                <div class="flex items-center gap-2">
                  <span id="slide-ping-indicator" class="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span class="text-[10px] font-black uppercase tracking-widest opacity-80 font-mono">Bài giảng số tương tác</span>
                </div>
                <span id="slide-num-indicator" class="text-[10px] font-black font-mono border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-full text-slate-600">
                  SLIDE 01 / 04
                </span>
              </div>

              <!-- Main Interactive Screen Content (Scrollable in case of heavy content) -->
              <div class="p-6 sm:p-9 flex-grow flex flex-col justify-center overflow-y-auto max-h-[500px] scrollbar-thin select-text relative z-10">
                <div class="max-w-4xl mx-auto w-full space-y-4 animate-fade-in">
                  <h3 id="slide-title" class="text-xl sm:text-2xl font-black tracking-tight font-serif text-emerald-850 border-b border-slate-150/50 pb-3 transition-all duration-300">
                    Loading...
                  </h3>
                  <div id="slide-body" class="prose max-w-none text-slate-650 leading-relaxed text-xs sm:text-sm space-y-3 transition-all duration-300">
                     <!-- Parsed Markdown HTML dynamic content goes here -->
                  </div>
                </div>
              </div>

              <div class="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100/80 flex justify-between items-center text-[10px] font-bold opacity-75 relative z-10">
                <span>InteractFlow AI v2.0 Active Learning Presentation</span>
                <span class="font-mono">Chế độ lớp học sư phạm</span>
              </div>
            </div>

            <!-- Slide navigation bar tightly-coupled at bottom of slide-canvas -->
            <div class="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-2xl gap-3">
              <button onclick="navigateSlide('prev')" id="slide-prev-btn" class="py-2.5 px-4 bg-white border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer select-none">
                ← Slide trước
              </button>
              <div class="hidden sm:block text-[10px] text-slate-500 font-semibold">
                💡 Nhấn phím mũi tên <kbd class="px-1.5 py-0.5 border bg-white rounded shadow-sm font-mono">←</kbd> <kbd class="px-1.5 py-0.5 border bg-white rounded shadow-sm font-mono">→</kbd> trên bàn phím để đổi Slide.
              </div>
              <button onclick="navigateSlide('next')" id="slide-next-btn" class="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer select-none">
                Slide tiếp theo →
              </button>
            </div>
          </div>

          <!-- Bottom Columns: Interactive Active Practice Bento (Example & Quick Check cards rendered below the slide in grid) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Box 1: Dynamic Example Card -->
            <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex-grow flex flex-col justify-center">
              <span class="text-[11px] uppercase tracking-wider font-extrabold text-indigo-700 block flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                💡 Minh họa thực tế & Ví dụ ứng dụng:
              </span>
              <div id="slide-example-content" class="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/10 text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold select-text">
                <!-- Dynamically populated example -->
              </div>
            </div>

            <!-- Box 2: Dynamic Quick Check Card -->
            <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex-grow flex flex-col justify-center">
              <span class="text-[11px] uppercase tracking-wider font-extrabold text-teal-700 block flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                ⚡ Hoạt động "Check hiểu nhanh" (Active Recall):
              </span>
              <div class="p-4 rounded-2xl border border-teal-100 bg-teal-50/20 space-y-3">
                <p id="quickcheck-question" class="text-xs font-bold text-slate-805 leading-relaxed">
                  <!-- Dynamically populated question -->
                </p>
                
                <textarea id="quickcheck-student-input" oninput="saveQuickCheckResponse(false)" placeholder="Hãy viết lập luận, phản hồi ngắn gọn của mình tại đây để tự kiểm định..." rows="2" class="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"></textarea>
                
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <button onclick="toggleQuickHint()" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg transition-all border border-amber-200 cursor-pointer select-none"><i data-lucide="lightbulb" class="inline w-3 h-3 mr-1 mb-0.5"></i> Xem gợi ý tư duy</button>
                  <button onclick="toggleQuickModel()" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg transition-all border border-emerald-200 cursor-pointer select-none"><i data-lucide="graduation-cap" class="inline w-3 h-3 mr-1 mb-0.5"></i> Đối chiếu phản hồi mẫu</button>
                </div>

                <div id="quickcheck-hint-box" class="hidden p-3 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl text-xs leading-relaxed font-semibold">
                  <!-- Dynamically populated hint -->
                </div>

                <div id="quickcheck-model-box" class="hidden p-3 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-xl text-xs leading-relaxed">
                  <!-- Dynamically populated suggested answer -->
                </div>
              </div>
            </div>
          </div>
        </div>



        <!-- Mode 2: CLASSIC LONG PAGE VIEW (For standard layout document rendering support) -->
        <div id="doc-reading-container" class="hidden space-y-4 animate-fade-in">
          <div class="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span class="text-[10px] uppercase font-black text-blue-600 tracking-wider">Tài liệu học liệu</span>
                <h3 id="doc-section-title" class="text-base sm:text-lg font-bold text-emerald-800">Tiêu đề</h3>
              </div>
              <span id="doc-section-indicator" class="text-xs bg-slate-100 py-1.5 px-3.5 font-extrabold rounded-full text-slate-600">Phần 1 / 4</span>
            </div>
            
            <div id="doc-section-body" class="prose max-w-none text-slate-650 text-sm leading-relaxed p-1">
              <!-- Parsed Markdown HTML dynamic content goes here -->
            </div>

            <!-- In Doc Mode: render boxy side-by-side or stacked grid layout for Example & Quick Check -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div class="bg-slate-50 border border-slate-200/85 p-4 rounded-2xl space-y-2">
                <span class="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 block flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                  💡 Minh họa & Ví dụ thực tiễn:
                </span>
                <p id="doc-example-content" class="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-wrap select-text"></p>
              </div>

              <div class="bg-teal-50/10 border border-teal-100 p-4 rounded-2xl space-y-3">
                <span class="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 block flex items-center gap-1.5 animate-pulse">
                  <span class="h-2 w-2 rounded-full bg-teal-500"></span>
                  ⚡ Hoạt động ôn tập nhanh (Active Recall Check):
                </span>
                <p id="doc-quickcheck-question" class="text-xs font-bold text-slate-800 leading-relaxed"></p>
                
                <textarea id="doc-quickcheck-input" oninput="saveQuickCheckResponse(true)" placeholder="Viết phản hồi ngắn vào đây để ôn tập nhanh..." rows="2" class="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"></textarea>
              </div>
            </div>

            <div class="flex justify-between items-center pt-4 border-t gap-2 mt-4">
              <button onclick="navigateSlide('prev')" id="doc-prev-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer select-none">
                ← Phần trước
              </button>
              <button onclick="navigateSlide('next')" id="doc-next-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer select-none">
                Phần tiếp theo →
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- TAB 4: FLASHCARDS -->
      <section id="tab-flashcards" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <span class="text-xs uppercase tracking-widest font-extrabold text-pink-600">Thẻ thuật ngữ ghi nhớ nhanh</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">Luyện trí nhớ thuật ngữ</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Nhấp chuột lên thẻ để lật ngược mặt và kiểm tra định nghĩa.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          ${lesson.flashcards.map((card, cIdx) => `
            <div onclick="toggleCard(${cIdx})" class="group cursor-pointer perspective-1000 h-40 w-full hover:scale-[1.01] transition-transform duration-300">
              <div id="card-inner-${cIdx}" class="relative h-full w-full transform-style-3d transition-transform duration-500 rounded-2xl shadow-sm border border-slate-200/80">
                
                <!-- Front Side -->
                <div class="absolute backface-hidden w-full h-full p-4 bg-white flex flex-col justify-between rounded-2xl">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md">Thuật ngữ ${cIdx + 1}</span>
                    <span class="text-slate-400 font-medium text-[9px] flex items-center gap-0.5">🔍 Click để lật</span>
                  </div>
                  <div class="text-center font-bold text-xs sm:text-sm text-slate-800 px-2 py-3">
                    ${card.front}
                  </div>
                  <div class="text-right text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                    InteractFlow AI v2.0 Memorizer
                  </div>
                </div>

                <!-- Back Side -->
                <div class="absolute backface-hidden rotate-y-180 w-full h-full p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex flex-col justify-between rounded-2xl shadow-inner shadow-slate-950 border border-indigo-500/10">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md">Định nghĩa chi tiết</span>
                    <span class="text-slate-455 font-medium text-[9px]">↩️ Click để quay lại</span>
                  </div>
                  <div class="text-xs sm:text-xs font-semibold leading-relaxed text-slate-200 overflow-y-auto px-1 scrollbar-thin max-h-[80px]">
                    ${card.back}
                  </div>
                  <div class="text-right text-[8px] text-emerald-400/80 font-semibold uppercase tracking-wider">
                    Kiến thức vững vàng
                  </div>
                </div>

              </div>
            </div>
          `).join('')}
        </div>

        <div class="flex justify-between items-center pt-2">
          <button onclick="showTab('sections')" class="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-slate-600 text-sm flex items-center gap-2">
            Quay lại Bài đọc
          </button>
          <button onclick="showTab('quiz')" class="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
            Bắt đầu trắc nghiệm <span class="text-lg">📝</span>
          </button>
        </div>
      </section>

      <!-- TAB 5: QUIZ -->
      <section id="tab-quiz" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span class="text-xs uppercase tracking-widest font-extrabold text-emerald-600">Kiểm tra năng lực tự đánh giá</span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">Trắc nghiệm Khách quan</h2>
          </div>
          <div class="text-right">
            <span class="text-xs bg-slate-100 text-slate-600 font-extrabold py-2 px-3.5 rounded-full">
              Đã trả lời: <span id="quiz-answered-count">0</span> / ${lesson.quizQuestions.length}
            </span>
          </div>
        </div>

        <div class="space-y-8">
          ${lesson.quizQuestions.map((q, qIndex) => `
            <div class="space-y-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div class="flex items-start gap-3">
                <span class="font-bold text-sm text-slate-800 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  C${qIndex + 1}
                </span>
                <p class="font-semibold text-slate-800 text-sm sm:text-base pt-1">${q.question}</p>
              </div>

              <!-- Store correct answer value implicitly -->
              <input type="hidden" id="correct-ans-${qIndex}" value="${q.correctAnswer}" />

              <!-- Visual Choices Options grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-11">
                ${q.options.map((opt) => {
                  const letter = opt.substring(0, 1);
                  return `
                    <button 
                      onclick="selectQuizOption(${qIndex}, '${letter}')" 
                      class="q-btn-${qIndex} w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center group cursor-pointer text-sm" 
                      data-option="${letter}"
                      data-original-text="${opt.replace(/"/g, '&quot;')}"
                    >
                      <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold mr-3 text-sm flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 select-none">
                        ${letter}
                      </span>
                      <span class="text-slate-600 font-medium">${opt.substring(3)}</span>
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Collapsible detailed explanation block -->
              <div id="explanation-${qIndex}" class="hidden pl-0 sm:pl-11 mt-3 transition-opacity">
                <div class="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1.5">
                  <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">💡 Giải thích từ Giảng viên:</span>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">${q.explanation}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Quiz finished dynamic report card banner -->
        <div id="quiz-score-banner" class="hidden mt-6 p-5 border rounded-xl flex flex-col items-center justify-center text-center">
          <h3 id="quiz-score-heading" class="font-bold text-base sm:text-lg">TỔNG ĐIỂM: 0 / ${lesson.quizQuestions.length}</h3>
          <p class="text-xs text-slate-500 mt-1">Đã kiểm tra tự động thành công. Bạn có thể nhấn thiết lập lại để trả lời lại.</p>
          <button onclick="resetQuiz()" class="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer">
            🔁 Làm lại bài trắc nghiệm
          </button>
        </div>

        <div class="flex justify-between items-center border-t border-slate-100 pt-6">
          <button onclick="showTab('flashcards')" class="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-slate-600 text-sm flex items-center gap-2">
            Quay lại Flashcards
          </button>
          <button onclick="showTab('casestudy')" class="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
            Đến Nghiên cứu tình huống <span class="text-lg">💼</span>
          </button>
        </div>
      </section>

      <!-- TAB 6: CASE STUDY -->
      <section id="tab-casestudy" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <span class="text-xs uppercase tracking-widest font-extrabold text-indigo-600">Nghiên cứu tình huống thực tiễn</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">${lesson.caseStudy.title}</h2>
        </div>

        <div class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-6 rounded-2xl ring-1 ring-slate-200/50 space-y-3">
          <span class="text-xs font-bold text-slate-500 uppercase bg-slate-200 px-2.5 py-1 rounded-full">🏢 Bối cảnh nghiên cứu:</span>
          <div class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">${lesson.caseStudy.context}</div>
        </div>

        <div class="space-y-6">
          <h3 class="font-bold text-slate-800 text-base sm:text-lg border-b border-slate-150 pb-2">🎯 Nhiệm vụ giải quyết vấn đề (Nâng cấp cấu trúc Bloom):</h3>
          
          ${lesson.caseStudy.tasks.map((task, tIdx) => {
            let bloomBadge = "Nhớ/Hiểu";
            let badgeStyle = "bg-sky-50 text-sky-800 border-sky-200";
            if (task.bloomLevel === "Phân tích/Vận dụng") {
              bloomBadge = "Phân tích / Vận dụng";
              badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
            } else if (task.bloomLevel === "Đề xuất/Sáng tạo") {
              bloomBadge = "Đề xuất / Sáng tạo";
              badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
            }
            return `
              <div class="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-150/50 pb-3">
                  <span class="text-xs font-bold text-indigo-700">Nhiệm vụ ${tIdx + 1}</span>
                  <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${badgeStyle}">${bloomBadge}</span>
                </div>

                <div class="space-y-2">
                  <p class="text-xs sm:text-sm font-bold text-slate-800">${task.question}</p>
                </div>

                <textarea id="case-student-input-${tIdx}" oninput="saveCaseResponse(${tIdx})" placeholder="Nhập câu trả lời phân tích thực thi của bạn tại đây để đối sánh..." rows="3" class="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"></textarea>

                <div class="flex flex-wrap gap-2 pt-1">
                  <button onclick="toggleCaseHint(${tIdx})" class="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition-all border border-amber-150 cursor-pointer select-none"><i data-lucide="lightbulb" class="inline w-3.5 h-3.5 mr-1 mb-0.5"></i> Xem gợi ý tư duy</button>
                  <button onclick="toggleCaseModel(${tIdx})" class="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-all border border-emerald-150 cursor-pointer select-none"><i data-lucide="graduation-cap" class="inline w-3.5 h-3.5 mr-1 mb-0.5"></i> Đối chiếu phản hồi mẫu</button>
                </div>

                <div id="case-hint-box-${tIdx}" class="hidden p-3 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl text-xs leading-relaxed font-semibold">
                  <strong><i data-lucide="lightbulb" class="inline w-4 h-4 mr-1 text-amber-600 mb-0.5"></i> Gợi ý định hướng:</strong><br/>
                  ${task.hint}
                </div>

                <div id="case-model-box-${tIdx}" class="hidden p-3 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-xl text-xs leading-relaxed">
                  <strong><i data-lucide="graduation-cap" class="inline w-4 h-4 mr-1 text-emerald-600 mb-0.5"></i> Giải pháp mẫu đề xuất:</strong><br/>
                  ${task.suggestedAnswer}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${lesson.caseStudy.rubric && lesson.caseStudy.rubric.length > 0 ? `
          <div class="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 class="font-extrabold text-xs uppercase tracking-wider text-slate-700">📋 Tiêu chí đánh giá & Thang điểm (Rubric):</h4>
            <ul class="space-y-1.5">
              ${lesson.caseStudy.rubric.map(rub => `
                <li class="text-xs text-slate-600 flex items-start gap-2">
                  <span class="text-emerald-500 mt-0.5">✔</span>
                  <span>${rub}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="flex justify-between items-center pt-2">
          <button onclick="showTab('quiz')" class="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-slate-600 text-sm flex items-center gap-2">
            Quay lại Trắc nghiệm
          </button>
          <button onclick="showTab('reflection')" class="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2">
            Ghi chép phản ngẫm <span class="text-lg">✍️</span>
          </button>
        </div>
      </section>

      <!-- TAB 7: REFLECTION -->
      <section id="tab-reflection" class="tab-content hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <span class="text-xs uppercase tracking-widest font-extrabold text-emerald-600">Ghi chép & Phản biện sâu</span>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-800 font-serif mt-1">Góc suy ngẫm cá nhân</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Câu trả lời phản biện của bạn được lưu cục bộ giúp tự rèn luyện tính độc lập tư duy.</p>
        </div>

        <!-- Student Information settings -->
        <div class="bg-slate-100/50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
          <label for="student-name-input" class="text-xs font-bold text-slate-600">Họ và tên sinh viên:</label>
          <input type="text" id="student-name-input" placeholder="Nhập tên của bạn để xuất báo cáo bài thu hoạch..." class="flex-grow w-full bg-white text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500">
        </div>

        <div class="space-y-6">
          ${lesson.reflectionQuestions.map((q, idx) => `
            <div class="space-y-3">
              <h3 class="font-bold text-slate-800 text-sm sm:text-base flex items-start gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-xs flex-shrink-0 mt-0.5">${idx + 1}</span>
                <span>${q}</span>
              </h3>
              <textarea id="reflect-text-${idx}" placeholder="Trả lời câu hỏi suy ngẫm số ${idx + 1} của bạn..." rows="3" class="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"></textarea>
            </div>
          `).join('')}
        </div>

        <!-- Float Notification -->
        <div id="toast-feedback" class="opacity-0 pointer-events-none transition-all duration-300 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <span>💾 Đã lưu câu trả lời cục bộ thành công!</span>
        </div>

        <div class="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p class="font-bold text-slate-800 text-sm">Gửi báo cáo / Lưu lại thành quả</p>
            <p class="text-xs text-slate-500">Bạn có thể tải xuống bản thu hoạch Word/Text để gửi cho Giảng viên chấm điểm.</p>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button onclick="saveNotesLocal()" class="w-1/2 sm:w-auto px-4 py-2.5 bg-white text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              📁 Lưu nội dung nháp
            </button>
            <button onclick="downloadNotes()" class="w-1/2 sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              📥 Tải tệp Thu hoạch (.txt)
            </button>
          </div>
        </div>

        <!-- Short summary of the whole lesson -->
        <div class="bg-gradient-to-r from-emerald-800 to-teal-900 text-slate-100 p-6 rounded-2xl shadow-md space-y-3.5">
          <h3 class="font-serif text-lg font-bold text-emerald-400">🏁 Đúc kết & Tóm tắt bài học</h3>
          <p class="text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">${lesson.summary}</p>
          <div class="text-center pt-2 text-[10px] text-teal-300 font-semibold tracking-wider uppercase">
            Học tập chủ động - vững tay tri thức nghề nghiệp
          </div>
        </div>

        <div class="flex justify-start">
          <button onclick="showTab('casestudy')" class="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 transition-all font-semibold rounded-xl text-slate-600 text-sm flex items-center gap-2">
            Quay lại Nghiên cứu tình huống
          </button>
        </div>
      </section>

    </main>

  </div>

  <!-- Sticky Mobile Mini Footer Panel for easy navigation -->
  <div class="lg:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 sticky bottom-0 z-40 py-2.5 px-3 grid grid-cols-7 gap-1 shadow-2xl shadow-blue-500/5">
    <button id="mobile-nav-intro" onclick="showTab('intro')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-blue-600 font-extrabold scale-105 transition-all duration-300">
      <i data-lucide="book-marked" class="w-4 h-4 mb-0.5"></i> <span>Intro</span>
    </button>
    <button id="mobile-nav-warmup" onclick="showTab('warmup')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="lightbulb" class="w-4 h-4 mb-0.5"></i> <span>Khởi động</span>
    </button>
    <button id="mobile-nav-sections" onclick="showTab('sections')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="book-open" class="w-4 h-4 mb-0.5"></i> <span>Lý thuyết</span>
    </button>
    <button id="mobile-nav-flashcards" onclick="showTab('flashcards')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="layers" class="w-4 h-4 mb-0.5"></i> <span>Thẻ</span>
    </button>
    <button id="mobile-nav-quiz" onclick="showTab('quiz')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="help-circle" class="w-4 h-4 mb-0.5"></i> <span>Quiz</span>
    </button>
    <button id="mobile-nav-casestudy" onclick="showTab('casestudy')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="award" class="w-4 h-4 mb-0.5"></i> <span>Tập sự</span>
    </button>
    <button id="mobile-nav-reflection" onclick="showTab('reflection')" class="mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300">
      <i data-lucide="pen-tool" class="w-4 h-4 mb-0.5"></i> <span>Ngẫm</span>
    </button>
  </div>

  <!-- Real Footer -->
  <footer class="bg-slate-900 border-t border-slate-800 py-6 text-center text-slate-500 text-xs mt-auto">
    <div class="max-w-6xl mx-auto px-4">
      <p>Ứng dụng bài giảng tương tác thiết kế bài bản bởi <strong>InteractFlow AI v2.0</strong></p>
      <p class="mt-1">Thiết kế sư phạm đa chiều thân thiện trên di động đem tới trải nghiệm học tập đỉnh cao.</p>
    </div>
  </footer>

  <!-- Script logics -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    let currentTab = 'intro';
    let activeSectionIdx = 0;
    let score = 0;
    let quizAnswered = {};

    let quickCheckAnswers = {};
    let caseStudyAnswers = {};

    // Dynamic raw sections data securely serialized with JSON.stringify to safely preserve special characters & tables markup
    const RAW_LESSON_DATA = ${JSON.stringify(lesson)};
    const RAW_SECTIONS_DATA = RAW_LESSON_DATA.sections;
    let totalQuestions = (RAW_LESSON_DATA && RAW_LESSON_DATA.quizQuestions) ? RAW_LESSON_DATA.quizQuestions.length : 5;
    let isSlideMode = true; 
    let slideTheme = 'light';

    function showTab(tabName) {
      if (!tabName) return;
      const chosenTab = document.getElementById('tab-' + tabName);
      if (!chosenTab) return;

      currentTab = tabName;
      // Hide all contents
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      
      // Show chosen text
      chosenTab.classList.remove('hidden');

      // Update navbar links Highlight desktop
      document.querySelectorAll('.nav-nav-btn').forEach(btn => {
        btn.className = "nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-white/50 hover:shadow-sm";
      });
      
      const activeNav = document.getElementById('nav-' + tabName);
      if (activeNav) {
        activeNav.className = "nav-nav-btn w-full text-left py-3 px-4 rounded-2xl transition-all font-bold text-xs flex items-center gap-3 text-blue-700 bg-blue-500/10 border-l-4 border-blue-500 backdrop-blur-md shadow-sm shadow-blue-500/5";
      }

      // Update mobile footer items active state
      document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.className = "mobile-nav-btn text-[10px] text-center font-bold flex flex-col items-center justify-center gap-1 text-slate-500 transition-all duration-300";
      });
      const activeMobileNav = document.getElementById('mobile-nav-' + tabName);
      if (activeMobileNav) {
        activeMobileNav.className = "mobile-nav-btn text-[10px] text-center font-extrabold flex flex-col items-center justify-center gap-1 text-blue-600 scale-105 transition-all duration-300";
      }

      if (tabName === 'sections') {
        renderActiveSection();
      }
      
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function changeSlideMode(mode) {
      isSlideMode = mode;
      const slideContainer = document.getElementById('slide-presentation-container');
      const docContainer = document.getElementById('doc-reading-container');
      const btnSlide = document.getElementById('btn-slide-mode');
      const btnDoc = document.getElementById('btn-doc-mode');
      const themeBtn = document.getElementById('btn-slide-theme');
      
      if (isSlideMode) {
        slideContainer.classList.remove('hidden');
        docContainer.classList.add('hidden');
        btnSlide.className = "flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all bg-emerald-600 text-white shadow-sm cursor-pointer select-none";
        btnDoc.className = "flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer select-none";
        if (themeBtn) themeBtn.style.display = 'flex';
      } else {
        slideContainer.classList.add('hidden');
        docContainer.classList.remove('hidden');
        btnSlide.className = "flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer select-none";
        btnDoc.className = "flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-black rounded-lg transition-all bg-emerald-600 text-white shadow-sm cursor-pointer select-none";
        if (themeBtn) themeBtn.style.display = 'none';
      }
      renderActiveSection();
    }

    function navigateSlide(direction) {
      const total = ${sectionsCount};
      let changed = false;
      if (direction === 'next') {
        if (activeSectionIdx < total - 1) {
          activeSectionIdx++;
          renderActiveSection();
          changed = true;
        } else {
          showTab('flashcards');
        }
      } else {
        if (activeSectionIdx > 0) {
          activeSectionIdx--;
          renderActiveSection();
          changed = true;
        } else {
          showTab('warmup');
        }
      }

      if (changed) {
        setTimeout(() => {
          const el = isSlideMode ? document.getElementById('slide-canvas') : document.getElementById('doc-reading-container');
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 85;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 50);
      }
    }

    function toggleSlideTheme() {
      slideTheme = slideTheme === 'light' ? 'dark' : 'light';
      const themeBtn = document.getElementById('btn-slide-theme');
      
      if (slideTheme === 'dark') {
        themeBtn.innerHTML = "☀️ Giao diện Sáng";
        themeBtn.className = "p-2 border bg-slate-800 border-slate-700 rounded-xl shadow-sm hover:bg-slate-750 text-xs text-slate-200 font-bold transition-all flex items-center gap-1 justify-center";
      } else {
        themeBtn.innerHTML = "🌙 Giao diện Tối";
        themeBtn.className = "p-2 border bg-white border-slate-250 rounded-xl shadow-sm hover:bg-slate-50 text-xs text-slate-600 font-bold transition-all flex items-center gap-1 justify-center";
      }
      renderActiveSection();
    }

    function renderActiveSection() {
      const data = RAW_SECTIONS_DATA[activeSectionIdx];
      if (!data) return;
      
      const canvas = document.getElementById('slide-canvas');
      const titleEl = document.getElementById('slide-title');
      const bodyEl = document.getElementById('slide-body');
      
      const GRADIENTS_LIGHT = ${JSON.stringify(
        appTheme === 'emerald' ? [
          "from-white via-emerald-50/15 to-slate-50/30",
          "from-white via-teal-50/15 to-slate-50/30",
          "from-white via-emerald-100/10 to-teal-100/10",
          "from-white via-emerald-50/20 to-slate-50/30",
          "from-white via-teal-50/20 to-slate-50/30",
          "from-white via-emerald-100/15 to-slate-50/20"
        ] : appTheme === 'sunset' ? [
          "from-white via-orange-50/15 to-slate-50/30",
          "from-white via-amber-50/15 to-slate-50/30",
          "from-white via-orange-100/10 to-amber-100/10",
          "from-white via-orange-50/20 to-slate-50/30",
          "from-white via-amber-50/20 to-slate-50/30",
          "from-white via-orange-100/15 to-slate-50/20"
        ] : appTheme === 'mystic' ? [
          "from-white via-purple-50/15 to-slate-50/30",
          "from-white via-indigo-50/15 to-slate-50/30",
          "from-white via-purple-100/10 to-indigo-100/10",
          "from-white via-purple-50/20 to-slate-50/30",
          "from-white via-indigo-50/20 to-slate-50/30",
          "from-white via-purple-100/15 to-slate-50/20"
        ] : appTheme === 'rose' ? [
          "from-white via-rose-50/15 to-slate-50/30",
          "from-white via-pink-50/15 to-slate-50/30",
          "from-white via-rose-100/10 to-pink-100/10",
          "from-white via-rose-50/20 to-slate-50/30",
          "from-white via-pink-50/20 to-slate-50/30",
          "from-white via-rose-100/15 to-slate-50/20"
        ] : [
          "from-white via-blue-50/15 to-slate-50/30",
          "from-white via-cyan-50/15 to-slate-50/30",
          "from-white via-blue-100/10 to-cyan-100/10",
          "from-white via-blue-50/20 to-slate-50/30",
          "from-white via-cyan-50/20 to-slate-50/30",
          "from-white via-blue-100/15 to-slate-50/20"
        ]
      )};

      const GRADIENTS_DARK = ${JSON.stringify(
        appTheme === 'emerald' ? [
          "from-slate-950 via-slate-900 to-emerald-950/30",
          "from-slate-950 via-slate-900 to-teal-950/30",
          "from-slate-950 via-slate-900 to-emerald-900/20",
          "from-slate-950 via-slate-900 to-teal-900/20",
          "from-slate-950 via-slate-900 to-emerald-950/40",
          "from-slate-950 via-slate-900 to-teal-950/40"
        ] : appTheme === 'sunset' ? [
          "from-slate-950 via-slate-900 to-orange-950/30",
          "from-slate-950 via-slate-900 to-amber-950/30",
          "from-slate-950 via-slate-900 to-orange-900/20",
          "from-slate-950 via-slate-900 to-amber-900/20",
          "from-slate-950 via-slate-900 to-orange-950/40",
          "from-slate-950 via-slate-900 to-amber-950/40"
        ] : appTheme === 'mystic' ? [
          "from-slate-950 via-slate-900 to-purple-950/30",
          "from-slate-950 via-slate-900 to-indigo-950/30",
          "from-slate-950 via-slate-900 to-purple-900/20",
          "from-slate-950 via-slate-900 to-indigo-900/20",
          "from-slate-950 via-slate-900 to-purple-950/40",
          "from-slate-950 via-slate-900 to-indigo-950/40"
        ] : appTheme === 'rose' ? [
          "from-slate-950 via-slate-900 to-rose-950/30",
          "from-slate-950 via-slate-900 to-pink-950/30",
          "from-slate-950 via-slate-900 to-rose-900/20",
          "from-slate-950 via-slate-900 to-pink-900/20",
          "from-slate-950 via-slate-900 to-rose-950/40",
          "from-slate-950 via-slate-900 to-pink-950/40"
        ] : [
          "from-slate-950 via-slate-900 to-blue-950/30",
          "from-slate-950 via-slate-900 to-cyan-950/30",
          "from-slate-950 via-slate-900 to-blue-900/20",
          "from-slate-950 via-slate-900 to-cyan-900/20",
          "from-slate-950 via-slate-900 to-blue-950/40",
          "from-slate-950 via-slate-900 to-cyan-950/40"
        ]
      )};

      const gIndex = activeSectionIdx % 6;
      
      if (slideTheme === 'dark') {
        if (canvas) canvas.className = "relative rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-500 min-h-[350px] sm:min-h-[420px] flex flex-col justify-between bg-gradient-to-b " + GRADIENTS_DARK[gIndex] + " border-slate-800 text-slate-100 shadow-slate-950/40 animate-fade-in";
        if (titleEl) {
          titleEl.className = "text-xl sm:text-2xl font-black tracking-tight font-serif";
          titleEl.style.color = "var(--blue-400)";
        }
        if (bodyEl) bodyEl.className = "prose prose-invert max-w-none text-slate-100/90 leading-relaxed text-sm sm:text-base space-y-3 mt-4";
        const c1 = document.getElementById('glow-circle-1');
        if (c1) {
          c1.className = "absolute top-10 left-1/3 w-72 h-72 rounded-full blur-3xl";
          c1.style.backgroundColor = "var(--blue-500)";
          c1.style.opacity = "0.06";
        }
        const c2 = document.getElementById('glow-circle-2');
        if (c2) {
          c2.className = "absolute bottom-10 right-10 w-48 h-48 rounded-full blur-2xl";
          c2.style.backgroundColor = "var(--cyan-400)";
          c2.style.opacity = "0.06";
        }
      } else {
        if (canvas) canvas.className = "relative rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-500 min-h-[350px] sm:min-h-[420px] flex flex-col justify-between bg-gradient-to-b " + GRADIENTS_LIGHT[gIndex] + " border-slate-100 text-slate-850 shadow-sm animate-fade-in";
        if (titleEl) {
          titleEl.className = "text-xl sm:text-2xl font-black tracking-tight font-serif";
          titleEl.style.color = "var(--blue-900)";
        }
        if (bodyEl) bodyEl.className = "prose max-w-none text-slate-650 leading-relaxed text-sm sm:text-base space-y-3 mt-4";
        const c1 = document.getElementById('glow-circle-1');
        if (c1) {
          c1.className = "absolute top-10 left-1/3 w-72 h-72 rounded-full blur-3xl";
          c1.style.backgroundColor = "var(--blue-500)";
          c1.style.opacity = "0.14";
        }
        const c2 = document.getElementById('glow-circle-2');
        if (c2) {
          c2.className = "absolute bottom-10 right-10 w-48 h-48 rounded-full blur-2xl";
          c2.style.backgroundColor = "var(--cyan-400)";
          c2.style.opacity = "0.14";
        }
      }
      
      // Update Indicators
      const slideNumInd = document.getElementById('slide-num-indicator');
      if (slideNumInd) slideNumInd.textContent = "SLIDE " + String(activeSectionIdx + 1).padStart(2, '0') + " / " + String(${sectionsCount}).padStart(2, '0');
      
      const docSecInd = document.getElementById('doc-section-indicator');
      if (docSecInd) docSecInd.textContent = "Phần " + (activeSectionIdx + 1) + " / " + ${sectionsCount};
      
      // Update Titles
      const slideTitleEl = document.getElementById('slide-title');
      if (slideTitleEl) slideTitleEl.textContent = data.title;
      
      const docSecTitleEl = document.getElementById('doc-section-title');
      if (docSecTitleEl) docSecTitleEl.textContent = data.title;
      
      // Safely parse Markdown to beautiful HTML with Marked!
      let contentHtml = "";
      if (typeof marked !== 'undefined' && marked.parse) {
        if (marked.use) {
          marked.use({ breaks: true });
        } else if (marked.setOptions) {
          marked.setOptions({ breaks: true });
        }
        contentHtml = marked.parse(data.content || "");
      } else {
        const cleanContent = (data.content || "").replace(/\\\\r\\\\n/g, '\\n').replace(/\\\\n/g, '\\n');
        const paragraphs = cleanContent.split('\\n\\n');
        contentHtml = paragraphs.map(p => {
          const trimmed = p.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const items = trimmed.split('\\n').map(li => '<li class="my-1.5">' + li.replace(/^[-*]\\s+/, '') + '</li>').join('');
            return '<ul class="list-disc pl-5 my-3">' + items + '</ul>';
          }
          return '<p class="my-3 leading-relaxed">' + p.replace(/\\n/g, '<br>') + '</p>';
        }).join('');
      }
      const slideBodyEl = document.getElementById('slide-body');
      if (slideBodyEl) {
        slideBodyEl.innerHTML = renderBentoSlideHtml(data.title, data.content || "", activeSectionIdx);
      }
      
      const docBodyEl = document.getElementById('doc-section-body');
      if (docBodyEl) docBodyEl.innerHTML = contentHtml;
      
      // Update sliding controls labels
      const prevSlideBtn = document.getElementById('slide-prev-btn');
      const prevDocBtn = document.getElementById('doc-prev-btn');
      const nextSlideBtn = document.getElementById('slide-next-btn');
      const nextDocBtn = document.getElementById('doc-next-btn');
      const totalSect = ${sectionsCount};
      
      if (prevSlideBtn) {
        if (activeSectionIdx === 0) {
          prevSlideBtn.textContent = '← Khởi động';
        } else {
          prevSlideBtn.textContent = '← Slide trước';
        }
      }
      if (prevDocBtn) {
        if (activeSectionIdx === 0) {
          prevDocBtn.textContent = '← Khởi động';
        } else {
          prevDocBtn.textContent = '← Phần trước';
        }
      }

      if (nextSlideBtn) {
        if (activeSectionIdx === totalSect - 1) {
          nextSlideBtn.textContent = 'Đến thẻ ôn tập →';
        } else {
          nextSlideBtn.textContent = 'Slide tiếp theo →';
        }
      }
      if (nextDocBtn) {
        if (activeSectionIdx === totalSect - 1) {
          nextDocBtn.textContent = 'Đến thẻ ôn tập →';
        } else {
          nextDocBtn.textContent = 'Phần tiếp theo →';
        }
      }
      
      updateProgress();
      
      // Update Example & Quick Check content dynamically on slide update (Slide and Doc versions)
      const slideExampleContent = document.getElementById('slide-example-content');
      const quickCheckQuestion = document.getElementById('quickcheck-question');
      const quickCheckInput = document.getElementById('quickcheck-student-input');
      const hintBox = document.getElementById('quickcheck-hint-box');
      const modelBox = document.getElementById('quickcheck-model-box');
      
      const docExampleContent = document.getElementById('doc-example-content');
      const docQuickCheckQuestion = document.getElementById('doc-quickcheck-question');
      const docQuickCheckInput = document.getElementById('doc-quickcheck-input');
      
      const valExample = data.example || "";
      const valQuestion = data.quickCheck ? data.quickCheck.question : "";
      const valAnswer = quickCheckAnswers[activeSectionIdx] || "";
      
      if (slideExampleContent) slideExampleContent.textContent = valExample;
      if (quickCheckQuestion) quickCheckQuestion.textContent = valQuestion;
      if (quickCheckInput) quickCheckInput.value = valAnswer;
      
      if (docExampleContent) docExampleContent.textContent = valExample;
      if (docQuickCheckQuestion) docQuickCheckQuestion.textContent = valQuestion;
      if (docQuickCheckInput) docQuickCheckInput.value = valAnswer;
      
      if (hintBox) {
        hintBox.classList.add('hidden');
        hintBox.innerHTML = '<i data-lucide="lightbulb" class="inline w-4 h-4 text-amber-600 mr-1 pb-0.5"></i> <strong>Gợi ý:</strong> ' + (data.quickCheck ? data.quickCheck.hint : "");
      }
      if (modelBox) {
        modelBox.classList.add('hidden');
        modelBox.innerHTML = '<i data-lucide="graduation-cap" class="inline w-4 h-4 text-emerald-600 mr-1 pb-0.5"></i> <strong>Phản hồi mẫu của giảng viên:</strong> ' + (data.quickCheck ? data.quickCheck.suggestedAnswer : "");
      }
      lucide.createIcons();
    }

    function saveQuickCheckResponse(isFromDoc) {
      if (isFromDoc) {
        const docInp = document.getElementById('doc-quickcheck-input');
        if (docInp) {
          quickCheckAnswers[activeSectionIdx] = docInp.value;
          const slideInp = document.getElementById('quickcheck-student-input');
          if (slideInp) slideInp.value = docInp.value;
        }
      } else {
        const slideInp = document.getElementById('quickcheck-student-input');
        if (slideInp) {
          quickCheckAnswers[activeSectionIdx] = slideInp.value;
          const docInp = document.getElementById('doc-quickcheck-input');
          if (docInp) docInp.value = slideInp.value;
        }
      }
    }

    function toggleQuickHint() {
      document.getElementById('quickcheck-hint-box').classList.toggle('hidden');
    }

    function toggleQuickModel() {
      document.getElementById('quickcheck-model-box').classList.toggle('hidden');
    }

    function saveCaseResponse(idx) {
      caseStudyAnswers[idx] = document.getElementById('case-student-input-' + idx).value;
    }

    function toggleCaseHint(idx) {
      document.getElementById('case-hint-box-' + idx).classList.toggle('hidden');
    }

    function toggleCaseModel(idx) {
      document.getElementById('case-model-box-' + idx).classList.toggle('hidden');
    }

    function toggleCard(cardIdx) {
      const inner = document.getElementById('card-inner-' + cardIdx);
      if (inner) {
        inner.classList.toggle('rotate-y-180');
      }
    }

    function selectQuizOption(qIdx, optionChar) {
      if (quizAnswered[qIdx] !== undefined) return;
      quizAnswered[qIdx] = optionChar;
      
      const correctAns = document.getElementById('correct-ans-' + qIdx).value;
      const optionBtns = document.querySelectorAll('.q-btn-' + qIdx);
      
      optionBtns.forEach(btn => {
        const optionVal = btn.getAttribute('data-option');
        // Clean default borders or group focuses
        btn.classList.remove('hover:border-emerald-300', 'hover:bg-emerald-50/30', 'border-slate-200');
        
        if (optionVal === correctAns) {
          btn.classList.add('bg-emerald-500/10', 'border-emerald-500', 'text-emerald-950', 'font-black', 'shadow-[0_0_15px_rgba(16,185,129,0.25)]', 'scale-[1.015]');
          // Update answer checkbox markup
          const badge = btn.querySelector('span');
          badge.className = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black mr-3 text-sm flex-shrink-0 shadow";
          badge.textContent = "✓";
        } else if (optionVal === optionChar) {
          btn.classList.add('bg-rose-500/10', 'border-rose-500', 'text-rose-950', 'font-black', 'shadow-[0_0_15px_rgba(244,63,94,0.25)]', 'scale-[1.015]');
          const badge = btn.querySelector('span');
          badge.className = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black mr-3 text-sm flex-shrink-0 shadow";
          badge.textContent = "✗";
        } else {
          btn.classList.add('opacity-45', 'scale-[0.98]', 'blur-[0.2px]');
        }
        btn.disabled = true;
      });

      // Show explanatory texts
      const expEl = document.getElementById('explanation-' + qIdx);
      if (expEl) expEl.classList.remove('hidden');

      if (optionChar === correctAns) {
        score++;
      }

      updateProgress();
      updateQuizScoreDisplay();
    }

    function updateQuizScoreDisplay() {
      const answeredCount = Object.keys(quizAnswered).length;
      document.getElementById('quiz-answered-count').textContent = answeredCount;
      
      if (answeredCount === totalQuestions) {
        const scoreBanner = document.getElementById('quiz-score-banner');
        if (scoreBanner) {
          scoreBanner.classList.remove('hidden');
          let textMsg = 'TỔNG ĐIỂM CỦA BẠN: ' + score + ' / ' + totalQuestions + ' ';
          let comment = '';
          if (score === totalQuestions) {
            comment = '⭐ Kinh ngạc tuyệt đối! Bạn nắm rất vững kiến thức.';
          } else if (score >= Math.ceil(totalQuestions / 2)) {
            comment = '👍 Tuyệt vời, bạn đã thông hiểu căn bản phần lý thuyết bài đọc.';
          } else {
            comment = '📚 Học thêm một chút nữa nhé, việc rèn luyện liên tục sẽ mang lại kết quả tốt.';
          }
          scoreBanner.querySelector('h3').textContent = textMsg + " - " + comment;
        }
      }
    }

    function resetQuiz() {
      quizAnswered = {};
      score = 0;
      
      const scoreBanner = document.getElementById('quiz-score-banner');
      if (scoreBanner) scoreBanner.classList.add('hidden');
      
      const answeredCount = document.getElementById('quiz-answered-count');
      if (answeredCount) answeredCount.textContent = '0';

      if (RAW_LESSON_DATA && RAW_LESSON_DATA.quizQuestions) {
        RAW_LESSON_DATA.quizQuestions.forEach((q, qIndex) => {
          const buttons = document.querySelectorAll('.q-btn-' + qIndex);
          buttons.forEach(btn => {
            btn.disabled = false;
            btn.className = "q-btn-" + qIndex + " w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 flex items-center group cursor-pointer text-sm font-medium shadow-sm hover:scale-[1.01]";
            const subspan = btn.querySelector('span');
            if (subspan) {
              subspan.className = "inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold mr-3 text-sm flex-shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 select-none shadow-sm transition-all duration-300";
              subspan.textContent = btn.getAttribute('data-option') || "";
            }
          });
          const exp = document.getElementById('explanation-' + qIndex);
          if (exp) exp.classList.add('hidden');
        });
      }

      updateProgress();
    }

    function saveWarm() {
      const el = document.getElementById('warmup-response');
      if (el) {
        localStorage.setItem('warmup_response_v', el.value);
      }
      const toast = document.getElementById('toast-feedback');
      if (toast) {
        toast.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          toast.classList.add('opacity-0', 'pointer-events-none');
        }, 2500);
      }
    }

    function submitWarm() {
      const el = document.getElementById('warmup-response');
      const val = el ? el.value.trim() : "";
      if (!val) {
        alert('Hãy viết suy nghĩ ngắn ngủi của mình để khởi động bạn nhé!');
        return;
      }
      const feedback = document.getElementById('warmup-feedback');
      if (feedback) feedback.classList.remove('hidden');
    }

    function saveNotesLocal() {
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.reflectionQuestions) {
        RAW_LESSON_DATA.reflectionQuestions.forEach((_q, idx) => {
          const el = document.getElementById('reflect-text-' + idx);
          if (el) localStorage.setItem('reflect_ans_v_' + idx, el.value);
        });
      }
      const nameEl = document.getElementById('student-name-input');
      if (nameEl) localStorage.setItem('student_name_v', nameEl.value);
      
      const toast = document.getElementById('toast-feedback');
      if (toast) {
        toast.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          toast.classList.add('opacity-0', 'pointer-events-none');
        }, 2500);
      }
    }

    function loadLocalNotes() {
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.reflectionQuestions) {
        RAW_LESSON_DATA.reflectionQuestions.forEach((_q, idx) => {
          const val_idx = localStorage.getItem('reflect_ans_v_' + idx);
          const el = document.getElementById('reflect-text-' + idx);
          if (val_idx && el) el.value = val_idx;
        });
      }
      const sName = localStorage.getItem('student_name_v');
      const nameEl = document.getElementById('student-name-input');
      if (sName && nameEl) nameEl.value = sName;

      const wResponse = localStorage.getItem('warmup_response_v');
      const wEl = document.getElementById('warmup-response');
      if (wResponse && wEl) wEl.value = wResponse;
    }

    function downloadNotes() {
      const nameEl = document.getElementById('student-name-input');
      const studentName = nameEl ? nameEl.value.trim() : 'Sinh viên';
      let text = "BẢN THU HOẠCH & BÀI LÀM TỰ HỌC - " + studentName.toUpperCase() + "\\n";
      text += "Bài học: " + (RAW_LESSON_DATA ? RAW_LESSON_DATA.lessonTitle : "") + "\\n";
      text += "Ngày hoàn thành: " + new Date().toLocaleDateString('vi-VN') + "\\n";
      text += "========================================\\n\\n";
      
      text += "I. PHẢN HỒI HOẠT ĐỘNG KHỞI ĐỘNG (WARM UP)\\n";
      text += "Câu hỏi kích hoạt: " + (RAW_LESSON_DATA && RAW_LESSON_DATA.warmUp ? RAW_LESSON_DATA.warmUp.task : "") + "\\n";
      const warmupEl = document.getElementById('warmup-response');
      text += "Trả lời của bạn:\\n" + (warmupEl ? warmupEl.value.trim() : "") + "\\n\\n";
      
      text += "========================================\\n";
      text += "II. PHẢN HỒI CHECK HIỂU NHANH THEO SLIDE (ACTIVE RECALL)\\n\\n";
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.sections) {
        RAW_LESSON_DATA.sections.forEach((sec, sIdx) => {
          text += "Slide " + (sIdx + 1) + ": " + sec.title + "\\n";
          text += "Câu hỏi: " + (sec.quickCheck ? sec.quickCheck.question : "") + "\\n";
          text += "Trả lời: " + (quickCheckAnswers[sIdx] || "(Chưa trả lời)").trim() + "\\n\\n";
        });
      }
 
      text += "========================================\\n";
      text += "III. PHÂN TÍCH NGHIÊN CỨU TÌNH HUỐNG (CASE STUDY WORKSHEET)\\n\\n";
      text += "Tình huống: " + (RAW_LESSON_DATA && RAW_LESSON_DATA.caseStudy ? RAW_LESSON_DATA.caseStudy.title : "") + "\\n\\n";
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.caseStudy && RAW_LESSON_DATA.caseStudy.tasks) {
        RAW_LESSON_DATA.caseStudy.tasks.forEach((task, tIdx) => {
          text += "Nhiệm vụ " + (tIdx + 1) + " (" + task.bloomLevel + "): " + task.question + "\\n";
          text += "Trả lời: " + (caseStudyAnswers[tIdx] || "(Chưa trả lời)").trim() + "\\n\\n";
          text += "----------------------------------------\\n\\n";
        });
      }
 
      text += "========================================\\n";
      text += "IV. CÂU HỎI SUY NGẪM PHẢN BIỆN (REFLECTIONS)\\n\\n";
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.reflectionQuestions) {
        RAW_LESSON_DATA.reflectionQuestions.forEach((q, idx) => {
          text += "Câu hỏi phản ngẫm " + (idx + 1) + ": " + q + "\\n";
          const reflectEl = document.getElementById('reflect-text-' + idx);
          text += "Trả lời của bạn:\\n" + (reflectEl ? reflectEl.value.trim() : "") + "\\n\\n";
          text += "----------------------------------------\\n\\n";
        });
      }
 
      text += "========================================\\n";
      text += "V. KẾT QUẢ TRẮC NGHIỆM KHÁCH QUAN (QUIZ ASSESSMENT)\\n\\n";
      text += "Điểm số tự đánh giá: " + score + " / " + totalQuestions + "\\n\\n";
      if (RAW_LESSON_DATA && RAW_LESSON_DATA.quizQuestions) {
        RAW_LESSON_DATA.quizQuestions.forEach((q, qIndex) => {
          const chosenOpt = quizAnswered[qIndex] || "Chưa trả lời";
          const isCorrect = chosenOpt === q.correctAnswer;
          text += "Câu hỏi " + (qIndex + 1) + ": " + q.question + "\\n";
          text += "Lựa chọn của bạn: " + chosenOpt + " (" + (isCorrect ? "ĐÚNG" : "SAI - Đáp án đúng: " + q.correctAnswer) + ")\\n";
          text += "----------------------------------------\\n\\n";
        });
      }
 
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u;
      a.download = "Bai_Lam_Tu_Hoc_" + studentName.replace(/ /g, "_") + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function updateProgress() {
      let completedSteps = 0;
      const totalSteps = 7; // Intro, Warmup, Sections, Flashcards, Quiz, CaseStudy, Reflection

      if (currentTab === 'intro') completedSteps = 1;
      else if (currentTab === 'warmup') completedSteps = 2;
      else if (currentTab === 'sections') completedSteps = 2 + (activeSectionIdx / ${sectionsCount});
      else if (currentTab === 'flashcards') completedSteps = 4;
      else if (currentTab === 'quiz') {
        const answersDone = Object.keys(quizAnswered).length;
        completedSteps = 4 + (answersDone / totalQuestions);
      }
      else if (currentTab === 'casestudy') completedSteps = 6;
      else if (currentTab === 'reflection') completedSteps = 7;

      const percent = Math.round((completedSteps / totalSteps) * 100);
      const progressBar = document.getElementById('global-progress-bar');
      if (progressBar) progressBar.style.width = percent + '%';
      
      const progressText = document.getElementById('global-progress-text');
      if (progressText) progressText.textContent = percent + '% Hoàn thành';
    }

    // Dynamic visual style customizer logic (Applied to the entire student application)
    function applyCustomStyles() {
      const theme = "${appTheme}";
      const bgStyle = "${appBackground}";
      const font = "${appFont}";
      const size = "${appFontSize}";

      const body = document.body;

      // 1. App Font Family Styles
      body.classList.remove('font-sans', 'font-serif', 'font-mono');
      if (font === 'sans') {
        body.style.fontFamily = '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif';
      } else if (font === 'serif') {
        body.style.fontFamily = 'Georgia, -apple-system-fn, serif';
      } else if (font === 'mono') {
        body.style.fontFamily = '"JetBrains Mono", ui-monospace, monospace';
      }

      // 2. Font Size Scaling
      const textElements = body.querySelectorAll('.prose, p, li, td, textarea, button.nav-nav-btn');
      textElements.forEach(el => {
        el.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl');
        if (size === 'normal') {
          if (el.tagName === 'P' || el.classList.contains('nav-nav-btn')) el.classList.add('text-sm');
          else el.classList.add('text-xs');
        } else if (size === 'large') {
          if (el.tagName === 'P' || el.classList.contains('nav-nav-btn')) el.classList.add('text-base');
          else el.classList.add('text-sm');
        } else if (size === 'xlarge') {
          if (el.tagName === 'P' || el.classList.contains('nav-nav-btn')) el.classList.add('text-lg');
          else el.classList.add('text-base');
        }
      });

      // 3. Background Styles & Card Containers Styling
      const cards = body.querySelectorAll('.bg-white, .tab-content, aside > div, header');
      
      // Clear glassmorphism or neon styles first
      cards.forEach(card => {
        card.classList.remove('backdrop-blur-md', 'bg-white/70', 'border-white/40', 'bg-slate-900', 'border-slate-800', 'text-slate-100', 'shadow-2xl');
        card.classList.add('bg-white', 'border-slate-200');
      });

      let dynamicStyle = document.getElementById('dynamic-bg-style');
      if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'dynamic-bg-style';
        document.head.appendChild(dynamicStyle);
      }
      dynamicStyle.innerHTML = '';

      if (bgStyle === 'grid') {
        body.className = "bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased";
        dynamicStyle.innerHTML = 'body { background-color: #f8fafc; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 16px 16px; }';
        const slideDecorations = document.getElementById('slide-decorations');
        if (slideDecorations) slideDecorations.style.opacity = '0.15';
      } else if (bgStyle === 'minimal') {
        body.className = "bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased";
        dynamicStyle.innerHTML = 'body { background-color: #fafbfc; }';
        cards.forEach(card => {
          card.classList.remove('shadow-sm', 'shadow-md');
        });
        const slideDecorations = document.getElementById('slide-decorations');
        if (slideDecorations) slideDecorations.style.opacity = '0';
      } else if (bgStyle === 'glass') {
        body.className = "text-slate-800 min-h-screen flex flex-col antialiased";
        dynamicStyle.innerHTML = 'body { background: linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 50%, #e0e7ff 100%); background-attachment: fixed; }';
        cards.forEach(card => {
          if (!card.classList.contains('nav-nav-btn')) {
            card.classList.remove('bg-white', 'border-slate-200');
            card.classList.add('backdrop-blur-xl', 'bg-white/75', 'border-white/30', 'shadow-xl', 'shadow-slate-200/50');
          }
        });
        const slideDecorations = document.getElementById('slide-decorations');
        if (slideDecorations) slideDecorations.style.opacity = '0.3';
      } else if (bgStyle === 'neon') {
        body.className = "bg-slate-950 text-slate-200 min-h-screen flex flex-col antialiased";
        cards.forEach(card => {
          if (!card.classList.contains('nav-nav-btn')) {
            card.classList.remove('bg-white', 'border-slate-200');
            card.classList.add('bg-slate-900', 'border-slate-800', 'text-slate-100');
          }
        });
        body.querySelectorAll('header').forEach(el => {
          el.className = "bg-slate-950 border-b border-slate-900 sticky top-0 z-40";
        });
        const slideDecorations = document.getElementById('slide-decorations');
        if (slideDecorations) slideDecorations.style.opacity = '0.35';
      }
    }

    function renderBentoSlideHtml(title, contentText, index) {
      // 1. Parsing similar to react parseSlideMarkdown
      let preparedText = String(contentText || "").trim();
      if (!preparedText.includes('\\n')) {
        if (preparedText.includes('; *')) {
          preparedText = preparedText.replace(/;\\s*\\*/g, '\\n- *');
        } else if (preparedText.includes('; -')) {
          preparedText = preparedText.replace(/;\\s*-/g, '\\n-');
        }
        preparedText = preparedText.replace(/\\s?-\\s\\*\\*/g, '\\n- **');
      }

      const lines = preparedText.split('\\n').map(l => l.trim()).filter(Boolean);
      const points = [];
      const introParagraphs = [];
      let detectedTakeaway = "";

      // Identify layout type based on slide title
      const tLower = title.toLowerCase();
      let layoutType = 'grid';
      if (tLower.includes('quy trình') || tLower.includes('các bước') || tLower.includes('tiến trình') || tLower.includes('vòng đời') || tLower.includes('bước')) {
        layoutType = 'timeline';
      } else if (tLower.includes('so sánh') || tLower.includes('khác biệt') || tLower.includes('đối chiếu') || tLower.includes('phân biệt')) {
        layoutType = 'comparison';
      }

      lines.forEach(line => {
        if (line.startsWith('*') && line.endsWith('*') && line.length > 15) {
          if (!detectedTakeaway) detectedTakeaway = line.slice(1, -1).trim();
          return;
        }
        if (line.toLowerCase().startsWith('chốt ý:') || line.toLowerCase().startsWith('kết luận:')) {
          detectedTakeaway = line.substring(line.indexOf(':') + 1).trim();
          return;
        }

        const listMatch = line.match(/^\\\\s*[-*+•]\\\\s*(.*)/);
        const numMatch = line.match(/^\\\\s*(\\\\d+)\\\\.\\\\s*(.*)/);

        if (listMatch) {
          const rest = listMatch[1].trim();
          const boldMatch = rest.match(/^\\\\*\\\\*([^*]+)\\\\*\\\\*([\\\\s\\\\S]*)/);
          if (boldMatch) {
            points.push({
              title: boldMatch[1].trim(),
              body: boldMatch[2].trim().replace(/^\\\\\s*[:：\\-–—]+/, '').trim()
            });
          } else {
            const colonIdx = rest.indexOf(':');
            if (colonIdx > 0 && colonIdx < 40) {
              points.push({
                title: rest.substring(0, colonIdx).trim(),
                body: rest.substring(colonIdx + 1).replace(/^\\\\\s*[\\-–—]+/, '').trim()
              });
            } else {
              points.push({
                title: "",
                body: rest
              });
            }
          }
        } else if (numMatch) {
          const rest = numMatch[2].trim();
          const boldMatch = rest.match(/^\\\\*\\\\*([^*]+)\\\\*\\\\*([\\\\s\\\\S]*)/);
          if (boldMatch) {
            points.push({
              title: boldMatch[1].trim(),
              body: boldMatch[2].trim().replace(/^\\\\\s*[:：\\-–—]+/, '').trim()
            });
          } else {
            const colonIdx = rest.indexOf(':');
            if (colonIdx > 0 && colonIdx < 40) {
              points.push({
                title: rest.substring(0, colonIdx).trim(),
                body: rest.substring(colonIdx + 1).replace(/^\\\\\s*[\\-–—]+/, '').trim()
              });
            } else {
              points.push({
                title: "",
                body: rest
              });
            }
          }
        } else {
          const boldStartMatch = line.match(/^\\\\*\\\\*([^*]{3,40})\\\\*\\\\*([\\\\s\\\\S]*)/);
          if (boldStartMatch) {
            points.push({
              title: boldStartMatch[1].trim(),
              body: boldStartMatch[2].trim().replace(/^\\\\\s*[:：\\-–—]+/, '').trim()
            });
          } else {
            introParagraphs.push(line);
          }
        }
      });

      let hero = introParagraphs.join('\\n\\n').trim();

      if (points.length === 0 && introParagraphs.length > 1) {
        hero = introParagraphs[0];
        introParagraphs.slice(1).forEach((para) => {
          const boldMatch = para.match(/^\\\\*\\\\*([^*]{3,45})\\\\*\\\\*([\\\\s\\\\S]*)/);
          if (boldMatch) {
            points.push({
              title: boldMatch[1].trim(),
              body: boldMatch[2].trim().replace(/^\\\\\s*[:：\\-–—]+/, '').trim()
            });
          } else {
            const colonIdx = para.indexOf(':');
            if (colonIdx > 0 && colonIdx < 40) {
              points.push({
                title: para.substring(0, colonIdx).trim(),
                body: para.substring(colonIdx + 1).replace(/^\\\\\s*[\\-–—]+/, '').trim()
              });
            } else {
              const words = para.split(' ').filter(Boolean);
              let pTitle = "";
              let pBody = para;
              if (words.length >= 2 && words.length <= 6) {
                pTitle = para;
                pBody = "";
              } else if (words.length > 6) {
                pTitle = words.slice(0, Math.min(3, words.length)).join(' ').replace(/[,.:;:\\-]$/, '');
                pTitle = pTitle.charAt(0).toUpperCase() + pTitle.slice(1) + "...";
              }
              points.push({
                title: pTitle,
                body: pBody
              });
            }
          }
        });
        layoutType = 'twocolumn';
      } else if (points.length === 0) {
        layoutType = 'hero-only';
      } else if (points.length >= 5) {
        layoutType = 'list-block';
      }

      if (!detectedTakeaway) {
        const italicMatch = contentText.match(/\\\\*(?!\\\\*)([^*]{15,220})\\\\*(?!\\\\*)/);
        if (italicMatch) {
          detectedTakeaway = italicMatch[1].trim();
        }
      }

      // Dynamic theme styling matching renderBentoSlide perfectly (appTheme interpolations)
      let kicker = '<i data-lucide="book-open" class="inline w-3 h-3 mr-1 mb-0.5"></i> Kiến thức cốt lõi';
      if (tLower.includes('khái niệm') || tLower.includes('định nghĩa') || tLower.includes('là gì') || tLower.includes('tổng quan') || tLower.includes('giới thiệu') || tLower.includes('lý thuyết')) {
        kicker = '<i data-lucide="search" class="inline w-3 h-3 mr-1 mb-0.5"></i> Định nghĩa & Khái niệm';
      } else if (tLower.includes('quy trình') || tLower.includes('các bước') || tLower.includes('tiến trình') || tLower.includes('vòng đời') || tLower.includes('thuật toán') || tLower.includes('workflow') || tLower.includes('bước')) {
        kicker = '<i data-lucide="refresh-cw" class="inline w-3 h-3 mr-1 mb-0.5"></i> Quy trình & Các bước';
      } else if (tLower.includes('lợi ích') || tLower.includes('ưu điểm') || tLower.includes('u việt') || tLower.includes('giá trị') || tLower.includes('cơ hội') || tLower.includes('vai trò')) {
        kicker = '<i data-lucide="sparkles" class="inline w-3 h-3 mr-1 mb-0.5"></i> Giá trị & Lợi thế';
      } else if (tLower.includes('hạn chế') || tLower.includes('nhược điểm') || tLower.includes('thử thách') || tLower.includes('lưu ý') || tLower.includes('rủi ro') || tLower.includes('cảnh báo') || tLower.includes('bảo mật') || tLower.includes('thận trọng')) {
        kicker = '<i data-lucide="alert-triangle" class="inline w-3 h-3 mr-1 mb-0.5"></i> Lưu ý & Rủi ro';
      } else if (tLower.includes('ứng dụng') || tLower.includes('thực tế') || tLower.includes('thực tiễn') || tLower.includes('áp dụng') || tLower.includes('thực hành') || tLower.includes('ví dụ')) {
        kicker = '<i data-lucide="tool" class="inline w-3 h-3 mr-1 mb-0.5"></i> Ứng dụng thực tiễn';
      }

      // App theme matches: emerald, sunset, mystic, rose, ocean
      let primaryColor = "${currentThemeVals.b600}"; 
      let secondaryColor = "${currentThemeVals.b400}"; 
      let kickerBg = slideTheme === 'dark' ? "${appTheme === 'emerald' ? 'rgba(16,185,129,0.16)' : appTheme === 'sunset' ? 'rgba(249,115,22,0.16)' : appTheme === 'mystic' ? 'rgba(124,58,237,0.16)' : appTheme === 'rose' ? 'rgba(219,39,119,0.16)' : 'rgba(59,130,246,0.16)'}" : "${appTheme === 'emerald' ? 'rgba(209,250,229,0.78)' : appTheme === 'sunset' ? 'rgba(255,237,213,0.78)' : appTheme === 'mystic' ? 'rgba(243,232,255,0.78)' : appTheme === 'rose' ? 'rgba(ffe4e6,0.78)' : 'rgba(219,234,254,0.78)'}";
      let kickerBorder = slideTheme === 'dark' ? "${appTheme === 'emerald' ? 'rgba(16,185,129,0.25)' : appTheme === 'sunset' ? 'rgba(249,115,22,0.25)' : appTheme === 'mystic' ? 'rgba(124,58,237,0.25)' : appTheme === 'rose' ? 'rgba(219,39,119,0.25)' : 'rgba(59,130,246,0.25)'}" : "${appTheme === 'emerald' ? 'rgba(5,150,105,0.28)' : appTheme === 'sunset' ? 'rgba(234,88,12,0.28)' : appTheme === 'mystic' ? 'rgba(124,58,237,0.28)' : appTheme === 'rose' ? 'rgba(219,39,119,0.28)' : 'rgba(59,130,246,0.28)'}";
      let kickerTextColor = slideTheme === 'dark' ? "${appTheme === 'emerald' ? '#a7f3d0' : appTheme === 'sunset' ? '#ffedd5' : appTheme === 'mystic' ? '#f3e8ff' : appTheme === 'rose' ? '#fbcfe8' : '#bfdbfe'}" : "${appTheme === 'emerald' ? '#047857' : appTheme === 'sunset' ? '#b45309' : appTheme === 'mystic' ? '#6d28d9' : appTheme === 'rose' ? '#be123c' : '#1d4ed8'}";
      let heroBg = slideTheme === 'dark' ? "rgba(15,23,42,0.52)" : "linear-gradient(135deg, rgba(255,255,255,.88), ${appTheme === 'emerald' ? 'rgba(209,250,229,0.50)' : appTheme === 'sunset' ? 'rgba(255,237,213,0.50)' : appTheme === 'mystic' ? 'rgba(243,232,255,0.50)' : appTheme === 'rose' ? 'rgba(ffe4e6,0.50)' : 'rgba(219,234,254,0.70)'})";
      let heroBorder = slideTheme === 'dark' ? "rgba(147,197,253,0.20)" : "rgba(147,197,253,0.42)";
      let takeawayBg = slideTheme === 'dark' ? "linear-gradient(135deg, ${currentThemeVals.b900}, ${currentThemeVals.b700})" : "linear-gradient(135deg, ${currentThemeVals.b700}, ${currentThemeVals.b500})";
      let pointTitleColor = "${appTheme === 'emerald' ? '#047857' : appTheme === 'sunset' ? '#b45309' : appTheme === 'mystic' ? '#6d28d9' : appTheme === 'rose' ? '#be123c' : '#1d4ed8'}";

      const kickerStyle = 'background: ' + kickerBg + ' !important; border: 1px solid ' + kickerBorder + ' !important; color: ' + kickerTextColor + ' !important;';
      const heroStyle = 'background: ' + heroBg + ' !important; border: 1px solid ' + heroBorder + ' !important;';
      const pointIndexStyle = 'background: linear-gradient(135deg, ' + primaryColor + ', ' + secondaryColor + ') !important;';
      const takeawayStyle = 'background: ' + takeawayBg + ' !important;';
      const pTitleStyle = pointTitleColor ? 'color: ' + pointTitleColor + ' !important;' : "";

      const inlineCoreMarkdown = (val) => {
        const parts = val.split(/\\*\\*([^*]+)\\*\\*/g);
        return parts.map((chunk, i) => {
          if (i % 2 === 1) {
            return '<strong class="font-black px-1.5 py-0.5 rounded-md text-[var(--blue-700)] bg-[var(--ux-soft)]">' + chunk + '</strong>';
          }
          return chunk;
        }).join('');
      };

      const renderPointsHtml = () => {
        if (points.length === 0) return "";

        if (layoutType === 'timeline') {
          let html = '<section class="core-slide-timeline my-4">';
          points.forEach((pt, idx) => {
            html += '<div class="flex-grow flex flex-col relative" style="flex: 1;">' +
              '<article class="core-slide-point flex-grow flex flex-col justify-start gap-2 max-w-none shadow-sm relative z-10">' +
              '<div class="flex items-center justify-between">' +
                '<span class="point-index" style="' + pointIndexStyle + '; padding: 0.2rem 0.5rem; border-radius: 0.5rem; width: auto; height: auto; font-size: 8px; margin-bottom: 0;">BƯỚC ' + (idx + 1) + '</span>' +
                (idx < points.length - 1 ? '<span class="hidden md:inline" style="color: #cbd5e1; font-weight: bold; font-size: 14px;">➔</span>' : '') +
              '</div>' +
              (pt.title ? '<strong style="' + pTitleStyle + '; margin-top: 0.35rem;">' + inlineCoreMarkdown(pt.title) + '</strong>' : '') +
              '<span>' + inlineCoreMarkdown(pt.body) + '</span>' +
              '</article></div>';
          });
          html += '</section>';
          return html;
        }

        if (layoutType === 'comparison') {
          let html = '<section class="core-slide-comparison my-4">';
          points.slice(0, 2).forEach((pt, idx) => {
            const isFirst = idx === 0;
            const cardBg = slideTheme === 'dark' 
              ? (isFirst ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)') 
              : (isFirst ? 'linear-gradient(135deg, #fff, rgba(209,250,229,0.25))' : 'linear-gradient(135deg, #fff, rgba(254,226,226,0.25))');
            const cardBorder = slideTheme === 'dark'
              ? (isFirst ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)')
              : (isFirst ? 'rgba(110,231,183,0.5)' : 'rgba(252,165,165,0.5)');
            const idxBg = isFirst ? '#059669' : '#e11d48';
            const tColor = isFirst ? (slideTheme === 'dark' ? '#34d399' : '#047857') : (slideTheme === 'dark' ? '#f43f5e' : '#be123c');
            
            html += '<article class="core-slide-point flex flex-col gap-2 max-w-none shadow-sm" style="background: ' + cardBg + ' !important; border-color: ' + cardBorder + ' !important;">' +
              '<div class="flex items-center gap-2">' +
                '<span class="point-index" style="background: ' + idxBg + ' !important; margin-bottom: 0;">' + (isFirst ? "✓" : "✗") + '</span>' +
                '<strong style="color: ' + tColor + ' !important; text-transform: uppercase; font-size: 11px; margin-bottom: 0; letter-spacing: 0.05em;">' + (pt.title ? inlineCoreMarkdown(pt.title) : (isFirst ? "Mặt tích cực" : "Mặt rủi ro / lưu ý")) + '</strong>' +
              '</div>' +
              '<span>' + inlineCoreMarkdown(pt.body) + '</span>' +
              '</article>';
          });
          html += '</section>';
          return html;
        }

        if (layoutType === 'list-block') {
          let html = '<section class="core-slide-hero my-4 leading-relaxed" style="' + heroStyle + '; padding: 1.25rem; border-radius: 1rem;">';
          html += '<ul style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1rem;">';
          points.forEach((pt, idx) => {
            html += '<li style="display: flex; align-items: flex-start; gap: 0.75rem;">' +
              '<span class="point-index" style="' + pointIndexStyle + '; padding: 0.1rem 0.4rem; border-radius: 0.25rem; font-size: 10px; flex-shrink: 0; margin-top: 0.15rem;">' + (idx + 1) + '</span>' +
              '<div>' +
              (pt.title ? '<strong style="display: block; font-size: 13px; font-weight: 800; margin-bottom: 0.15rem;">' + inlineCoreMarkdown(pt.title) + '</strong>' : '') +
              '<span style="font-size: 12px; font-weight: 600; opacity: 0.9;">' + inlineCoreMarkdown(pt.body) + '</span>' +
              '</div></li>';
          });
          html += '</ul></section>';
          return html;
        }

        if (layoutType === 'twocolumn') {
          let html = '<section class="core-slide-twocolumn my-4">';
          points.forEach((pt) => {
            html += '<article class="core-slide-point flex flex-col justify-start gap-2 max-w-none shadow-sm">' +
              (pt.title ? '<strong style="' + pTitleStyle + '; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.3rem;"><i data-lucide="lightbulb" class="inline w-3 h-3 mr-1 mb-0.5"></i> ' + inlineCoreMarkdown(pt.title) + '</strong>' : '') +
              '<span>' + inlineCoreMarkdown(pt.body) + '</span>' +
              '</article>';
          });
          html += '</section>';
          return html;
        }

        let html = '<section class="core-slide-card-grid my-4">';
        points.forEach((pt, idx) => {
          const len = points.length;
          let spanClass = "core-bento-4";
          if (len === 1) spanClass = "core-bento-12";
          else if (len === 2) spanClass = "core-bento-6";
          else if (len === 3) spanClass = idx === 0 ? "core-bento-12" : "core-bento-6";
          else if (len === 4) spanClass = "core-bento-6";
          else if (len === 5) spanClass = idx < 2 ? "core-bento-6" : "core-bento-4";

          html += '<article class="core-slide-point ' + spanClass + ' flex flex-col justify-start gap-2 max-w-none shadow-sm">' +
            '<span class="point-index" style="' + pointIndexStyle + '">' + String(idx + 1).padStart(2, '0') + '</span>' +
            '<strong style="' + pTitleStyle + '">' + inlineCoreMarkdown(pt.title || '') + '</strong>' +
            '<span>' + inlineCoreMarkdown(pt.body) + '</span>' +
            '</article>';
        });
        html += '</section>';
        return html;
      };

      const slideData = RAW_SECTIONS_DATA[index] || {};
      const imageUrl = slideData.imageUrl;
      const imagePrompt = slideData.imagePrompt;
      const imagePosition = slideData.imagePosition || 'right';
      const hasImg = imageUrl && imagePosition !== 'hide';

      const heroSection = hero ? '<section class="core-slide-hero leading-relaxed" style="' + heroStyle + '"><p>' + inlineCoreMarkdown(hero) + '</p></section>' : '';

      let mainContentHtml = 
        '<span class="core-slide-kicker" style="' + kickerStyle + '">' + kicker + ' ' + String(index + 1).padStart(2, '0') + '</span>' +
        heroSection +
        renderPointsHtml();

      let interactiveImgHtml = "";
      if (hasImg) {
        const borderClass = slideTheme === 'dark' ? 'border-slate-800' : 'border-slate-200/50';
        const imgBg = slideTheme === 'dark' ? 'bg-slate-900/40' : 'bg-white/40';
        
        interactiveImgHtml = 
          '<div class="flex flex-col items-center justify-center p-2 rounded-2xl border ' + imgBg + ' ' + borderClass + ' w-full">' +
            '<img src="' + imageUrl + '" alt="Slide Illustration" class="rounded-xl object-cover max-h-[180px] sm:max-h-[220px] w-full border dark:border-slate-800" referrerPolicy="no-referrer" />' +
            (imagePrompt ? '<p class="mt-1.5 italic text-center px-1 text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-medium m-0">Concept: ' + imagePrompt + '</p>' : '') +
          '</div>';
      }

      let wrapperHtml = "";
      if (hasImg) {
        if (imagePosition === 'left') {
          wrapperHtml = '<div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">' +
            '<div class="md:col-span-4 flex flex-col justify-start">' + interactiveImgHtml + '</div>' +
            '<div class="md:col-span-8 flex flex-col justify-between space-y-4">' + mainContentHtml + '</div>' +
          '</div>';
        } else {
          wrapperHtml = '<div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">' +
            '<div class="md:col-span-8 flex flex-col justify-between space-y-4">' + mainContentHtml + '</div>' +
            '<div class="md:col-span-4 flex flex-col justify-start">' + interactiveImgHtml + '</div>' +
          '</div>';
        }
      } else {
        wrapperHtml = '<div class="space-y-4">' + mainContentHtml + '</div>';
      }

      const takeawayHtml = detectedTakeaway ? 
        '<section class="core-slide-takeaway" style="' + takeawayStyle + '">' +
        '<span class="takeaway-icon"><i data-lucide="gem" class="w-4 h-4 text-white"></i></span>' +
        '<div style="color: #fff;"><strong style="color: #fcd34d !important; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.1rem;">Chốt ý giảng viên:</strong>' +
        '<p style="font-size: 13px !important; font-weight: 700; line-height: 1.5; margin: 0 !important; color: #fff !important;">' + inlineCoreMarkdown(detectedTakeaway) + '</p></div>' +
        '</section>' : '';

      return '<div class="core-slide-layout text-left w-full space-y-4">' +
        wrapperHtml + takeawayHtml + '</div>';
    }

    window.onload = function() {
      loadLocalNotes();
      renderActiveSection();
      applyCustomStyles();
      updateProgress();
      
      // Keyboard arrow keys navigation for HTML slide deck
      document.addEventListener('keydown', function(e) {
        if (currentTab === 'sections') {
          if (e.key === 'ArrowRight') {
            navigateSlide('next');
          } else if (e.key === 'ArrowLeft') {
            navigateSlide('prev');
          }
        }
      });
    };
  </script>
</body>
</html>`;
  };

  // Trigger download of the HTML file
  const handleDownloadFile = () => {
    if (!generatedLesson) return;
    const compiledCode = compileStudentHTML(generatedLesson);
    const blob = new Blob([compiledCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Clean Vietnamese filename
    const safeTitle = generatedLesson.lessonTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_');
      
    link.href = url;
    link.download = `Bai_Hoc_Tuong_Tac_${safeTitle || 'InteractFlow_AI'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy HTML string directly to Clipboard
  const handleCopyCode = () => {
    if (!generatedLesson) return;
    const compiledCode = compileStudentHTML(generatedLesson);
    navigator.clipboard.writeText(compiledCode);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helper to scroll to the top of the slide container when navigating
  const scrollToPreviewSlide = () => {
    setTimeout(() => {
      const container = document.getElementById('preview-slide-view') || document.getElementById('interactive-content-container');
      if (container) {
        const y = container.getBoundingClientRect().top + window.scrollY - 85;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  // Preview Simulator Interaction logic helpers for the Lecturer test-flight
  const handlePreviewNextSection = () => {
    if (!generatedLesson) return;
    if (previewSectionIdx < generatedLesson.sections.length - 1) {
      setPreviewSectionIdx(prev => prev + 1);
      scrollToPreviewSlide();
    } else {
      setPreviewTab("flashcards");
    }
  };

  const handlePreviewPrevSection = () => {
    if (previewSectionIdx > 0) {
      setPreviewSectionIdx(prev => prev - 1);
      scrollToPreviewSlide();
    } else {
      setPreviewTab("warmup");
    }
  };

  // Keyboard navigation for presentation slides preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'preview' && previewTab === 'sections' && slideMode) {
        if (e.key === 'ArrowRight') {
          handlePreviewNextSection();
        } else if (e.key === 'ArrowLeft') {
          handlePreviewPrevSection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, previewTab, previewSectionIdx, slideMode, generatedLesson]);

  const handlePreviewSelectOption = (qIdx: number, optionLetter: string, correctAnswer: string) => {
    if (previewQuizAnswers[qIdx] !== undefined) return;
    
    // Set score counter
    if (optionLetter === correctAnswer) {
      setPreviewQuizScore(prev => prev + 1);
    }

    setPreviewQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optionLetter
    }));
  };

  const handlePreviewResetQuiz = () => {
    setPreviewQuizAnswers({});
    setPreviewQuizScore(0);
  };

  const recordLocalCompletion = () => {
    const lessonTitle = generatedLesson?.lessonTitle || title;
    const quickChecksAnswered = Object.keys(previewQuickCheckAnswers).length;
    const totalQuickChecks = generatedLesson ? generatedLesson.sections.length : 0;
    
    let caseStudyTasksAnswered = 0;
    if (generatedLesson) {
      generatedLesson.caseStudy.tasks.forEach((task, tIdx) => {
        if ((previewCaseStudyAnswers[tIdx] || "").trim().length > 0) {
          caseStudyTasksAnswered++;
        }
      });
    }
    const totalCaseStudyTasks = generatedLesson ? generatedLesson.caseStudy.tasks.length : 0;
    
    let reflectionsAnswered = 0;
    if (generatedLesson) {
      generatedLesson.reflectionQuestions.forEach((q, idx) => {
        if ((previewStudentResponses[idx] || "").trim().length > 0) {
          reflectionsAnswered++;
        }
      });
    }
    const totalReflections = generatedLesson ? generatedLesson.reflectionQuestions.length : 3;

    let ruCorrect = 0, ruTotal = 0;
    let appCorrect = 0, appTotal = 0;
    let evCorrect = 0, evTotal = 0;

    if (generatedLesson) {
      generatedLesson.quizQuestions.forEach((q, qIndex) => {
        const chosen = previewQuizAnswers[qIndex];
        const isCorrect = chosen === q.correctAnswer;
        const bloom = q.bloomLevel || 'Nhớ/Hiểu';
        
        if (bloom === 'Nhớ/Hiểu') {
          ruTotal++;
          if (isCorrect) ruCorrect++;
        } else if (bloom === 'Vận dụng') {
          appTotal++;
          if (isCorrect) appCorrect++;
        } else {
          evTotal++;
          if (isCorrect) evCorrect++;
        }
      });
    }

    const newRecord: LocalCompletionRecord = {
      id: `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lessonTitle: lessonTitle,
      studentName: previewStudentName.trim() || 'Sinh viên ẩn danh',
      studentId: previewStudentId.trim() || `SV-${Math.floor(10000 + Math.random() * 90000)}`,
      studentClass: previewStudentClass.trim() || 'Lớp khảo thí',
      quizScore: previewQuizScore,
      totalQuizQuestions: generatedLesson ? generatedLesson.quizQuestions.length : 5,
      completedAt: new Date().toISOString(),
      quickChecksAnswered,
      totalQuickChecks,
      caseStudyTasksAnswered,
      totalCaseStudyTasks,
      reflectionsAnswered,
      totalReflections,
      bloomBreakdown: {
        rememberUnderstand: { correct: ruCorrect, total: Math.max(1, ruTotal) },
        apply: { correct: appCorrect, total: Math.max(1, appTotal) },
        evaluate: { correct: evCorrect, total: Math.max(1, evTotal) }
      }
    };

    try {
      const existing = localStorage.getItem('interactflow_completions') || localStorage.getItem('teachflow_completions');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newRecord);
      localStorage.setItem('interactflow_completions', JSON.stringify(list));
      setStatsRefreshStamp(Date.now());
    } catch (e) {
      console.error("Failed to write local completions database:", e);
    }
  };

  const handleSaveDraftLocal = () => {
    recordLocalCompletion();
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const handleSubmitAndRecordLesson = () => {
    const name = previewStudentName.trim();
    if (!name) {
      if (!window.confirm("⚠️ Bạn chưa điền Tên sinh viên để gán kết quả học tập. Hệ thống sẽ tự động đặt tên là \"Sinh viên ẩn danh\". Bạn có muốn tiếp tục nộp bài không?")) {
        return;
      }
    }
    
    recordLocalCompletion();
    setIsStatsModalOpen(true);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };


  const handleDownloadStudentReport = () => {
    if (!generatedLesson) return;
    recordLocalCompletion();
    const name = previewStudentName.trim() || 'Sinh viên';
    let text = "BẢN THU HOẠCH & BÀI LÀM TỰ HỌC - " + name.toUpperCase() + "\n";
    text += "Bài học: " + generatedLesson.lessonTitle + "\n";
    text += "Ngày hoàn thành: " + new Date().toLocaleDateString('vi-VN') + "\n";
    text += "========================================\n\n";
    
    text += "I. PHẢN HỒI HOẠT ĐỘNG KHỞI ĐỘNG (WARM UP)\n";
    text += "Câu hỏi kích hoạt: " + generatedLesson.warmUp.task + "\n";
    const warmUpInput = document.getElementById('prev-warm-ta') as HTMLTextAreaElement;
    text += "Trả lời của bạn:\n" + (warmUpInput ? warmUpInput.value.trim() || "(Chưa trả lời)" : "(Chưa trả lời)") + "\n\n";
    
    text += "========================================\n";
    text += "II. PHẢN HỒI CHECK HIỂU NHANH THEO SLIDE (ACTIVE RECALL)\n\n";
    generatedLesson.sections.forEach((sec, sIdx) => {
      text += `Slide ${sIdx + 1}: ${sec.title}\n`;
      text += `Câu hỏi: ${sec.quickCheck.question}\n`;
      text += `Trả lời: ${(previewQuickCheckAnswers[sIdx] || "").trim() || "(Chưa trả lời)"}\n\n`;
    });

    text += "========================================\n";
    text += "III. PHÂN TÍCH NGHIÊN CỨU TÌNH HUỐNG (CASE STUDY WORKSHEET)\n\n";
    text += "Tình huống: " + generatedLesson.caseStudy.title + "\n\n";
    generatedLesson.caseStudy.tasks.forEach((task, tIdx) => {
      text += `Nhiệm vụ ${tIdx + 1} (${task.bloomLevel}): ${task.question}\n`;
      text += `Trả lời: ${(previewCaseStudyAnswers[tIdx] || "").trim() || "(Chưa trả lời)"}\n\n`;
      text += "----------------------------------------\n\n";
    });

    text += "========================================\n";
    text += "IV. CÂU HỎI SUY NGẪM PHẢN BIỆN (REFLECTIONS)\n\n";
    generatedLesson.reflectionQuestions.forEach((q, idx) => {
      text += `Câu hỏi phản ngẫm ${idx + 1}: ${q}\n`;
      text += `Trả lời của bạn:\n${(previewStudentResponses[idx] || "").trim() || "(Chưa trả lời)"}\n\n`;
      text += "----------------------------------------\n\n";
    });

    text += "========================================\n";
    text += "V. KẾT QUẢ TRẮC NGHIỆM KHÁCH QUAN (QUIZ ASSESSMENT)\n\n";
    const answeredCount = Object.keys(previewQuizAnswers).length;
    text += `Điểm số tự đánh giá: ${previewQuizScore} / 5 (${answeredCount} / 5 câu đã làm)\n\n`;
    generatedLesson.quizQuestions.forEach((q, qIndex) => {
      const chosenOpt = previewQuizAnswers[qIndex] || "Chưa trả lời";
      const isCorrect = chosenOpt === q.correctAnswer;
      text += `Câu hỏi ${qIndex + 1}: ${q.question}\n`;
      text += `Lựa chọn của bạn: ${chosenOpt} (${isCorrect ? "ĐÚNG" : "SAI - Đáp án đúng: " + q.correctAnswer})\n`;
      text += "----------------------------------------\n\n";
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = "Bai_Lam_Tu_Hoc_" + name.replace(/ /g, "_") + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 antialiased flex flex-col justify-between py-0">
      
      {/* Top Brand Navbar Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-md font-bold">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                InteractFlow AI v2.0
                <span className="text-[10px] bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full font-black tracking-wide uppercase">Interactive v2.0</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Biến nội dung bài giảng thô thành học liệu số tương tác cao .HTML</p>
            </div>
          </div>

          {/* Quick tab switch buttons & Stats Dashboard Modal trigger */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                id="tab-edit"
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'editor' ? 'bg-white text-slate-800 shadow-sm cursor-pointer active-tab-btn' : 'text-slate-500 hover:text-slate-800 cursor-pointer'}`}
              >
                <PenTool className="w-3.5 h-3.5" /> Thiết lập Giáo án
              </button>
              
              {generatedLesson && (
                <>
                  <button
                    id="tab-sim"
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white text-emerald-800 shadow-sm font-black cursor-pointer active-tab-btn' : 'text-slate-500 hover:text-emerald-800 cursor-pointer'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> 1. Bản xem thử học sinh
                  </button>
                  <button
                    id="tab-source"
                    onClick={() => setActiveTab('html-code')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'html-code' ? 'bg-white text-indigo-800 shadow-sm cursor-pointer active-tab-btn' : 'text-slate-500 hover:text-indigo-800 cursor-pointer'}`}
                  >
                    <FileCode className="w-3.5 h-3.5" /> 2. Nhận mã HTML xuất bản
                  </button>
                </>
              )}
            </div>

            <button
              id="btn-open-stats-dashboard"
              onClick={() => setIsStatsModalOpen(true)}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-slate-100 text-indigo-750 hover:text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 hover:border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Xem bảng thống kê kết quả rèn luyện"
            >
              <Award className="w-4 h-4 text-indigo-550" />
              <span className="hidden sm:inline">Thống Kê Thầy Cô</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 flex-grow w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Input Configuration Form & Parameters (Takes 5/12 of widescreen) */}
        <section className={`lg:col-span-5 space-y-6 ${activeTab !== 'editor' && 'hidden lg:block'}`}>
          
          {/* Two-Part Switcher in v2.0 */}
          {generatedLesson && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
              <button
                type="button"
                onClick={() => setEditorStep('generate')}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editorStep === 'generate'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 font-bold'
                }`}
              >
                📥 Phần 1: Nạp & Tạo AI
              </button>
              <button
                type="button"
                onClick={() => setEditorStep('edit')}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editorStep === 'edit'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 font-bold'
                }`}
              >
                ✍️ Phần 2: Biên Tập Slide
              </button>
            </div>
          )}

          {editorStep === 'generate' || !generatedLesson ? (
            <>
              {/* API Key & Gemini Model Configuration Card */}
              <div className="bg-[#f0f9ff]/80 border border-[#bfe2fd] rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in text-blue-900">
                <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                  <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-1.5">
                    ⚙️ Cấu Hình API & Mô Hình Gemini
                  </label>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black">
                    Cấu hình hệ thống
                  </span>
                </div>

                {/* Model selection dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🤖 CHỌN MÔ HÌNH DỰ TRÚ:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-blue-200 bg-white focus:outline-0 focus:ring-1 focus:ring-blue-400 transition-all text-blue-955 shadow-3xs cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Đề xuất / Cực nhanh & Thông minh)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Tốc độ vượt trội)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Độ tương thích cao / Ổn định)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Siêu mạnh mẽ / Lập luận chuyên sâu)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Lý luận cao cấp)</option>
                  </select>
                </div>

                {/* API Key input line */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    🔑 GEMINI API KEY:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={customApiKey || ""}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Nhập khóa API của bạn (ví dụ: AIzaSy...)"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-blue-200 bg-white placeholder-slate-400 focus:outline-0 focus:ring-1 focus:ring-blue-400 transition-all text-blue-900 pr-10 shadow-3xs"
                    />
                    {customApiKey && (
                      <button
                        type="button"
                        onClick={() => setCustomApiKey("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-blue-700 leading-relaxed font-semibold">
                    * Nếu khóa API cá nhân của bạn cũ hoặc gặp lỗi không thể đọc/không hiểu mô hình, vui lòng chuyển tùy chọn trên thành <strong>Gemini 1.5 Flash</strong> để duy trì tính tương thích tối đa. Khóa được lưu cục bộ an toàn trong bộ nhớ trình duyệt của bạn (localStorage).
                  </p>
                </div>
              </div>

              {/* Quick Loading & File Upload Module Tabs Layout */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                {/* Tab selection buttons */}
                <div className="flex border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setQuickLoadTab('upload')}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      quickLoadTab === 'upload'
                        ? 'bg-emerald-600 text-white shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> 1. Tải lên giáo trình (PDF, PPT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickLoadTab('samples')}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      quickLoadTab === 'samples'
                        ? 'bg-emerald-600 text-white shadow-sm font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 2. AI Tự động soạn
                  </button>
                </div>

                {quickLoadTab === 'upload' ? (
                  <div className="space-y-3">
                    {/* File input area */}
                    {!uploadedFile ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                          isDragActive
                            ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                            : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/50'
                        }`}
                      >
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.json"
                            className="hidden"
                          />
                          <UploadCloud className={`w-10 h-10 mb-2 transition-all ${isDragActive ? 'text-emerald-600 scale-110 animate-pulse' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-700">Kéo thả tài liệu giáo trình vào đây</span>
                          <span className="text-[11px] text-slate-500 mt-1">hoặc <span className="text-emerald-600 underline font-extrabold">duyệt tệp từ máy tính</span></span>
                          <span className="text-[10px] text-slate-400 mt-2 block leading-normal">
                            Hỗ trợ định dạng PDF, PowerPoint (PPT/PPTX), Word (DOCX), Text (TXT, MD) lên tới 10MB
                          </span>
                        </label>
                      </div>
                    ) : (
                      /* Attached file view state */
                      <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                        {/* Background accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <div className="flex items-start gap-3">
                          {/* Left icon preview based on mime type */}
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                            uploadedFile.mimeType === 'application/pdf'
                              ? 'bg-red-50 text-red-500'
                              : uploadedFile.mimeType.includes('presentation') || uploadedFile.mimeType.includes('powerpoint')
                              ? 'bg-amber-50 text-amber-500'
                              : 'bg-indigo-50 text-indigo-500'
                          }`}>
                            <FileText className="w-6 h-6" />
                          </div>

                          {/* File Details */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                uploadedFile.mimeType === 'application/pdf'
                                  ? 'bg-red-100 text-red-750'
                                  : uploadedFile.mimeType.includes('presentation') || uploadedFile.mimeType.includes('powerpoint')
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-indigo-100 text-indigo-705'
                              }`}>
                                {uploadedFile.mimeType === 'application/pdf' ? 'PDF' : uploadedFile.mimeType.includes('presentation') ? 'PowerPoint' : 'Document'}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded-full">✓ Giáo trình đã nạp</span>
                              {isAnalyzingFile && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-amber-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  AI phân tích cấu trúc...
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 truncate" title={uploadedFile.name}>
                              {uploadedFile.name}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              Dung lượng: {formatFileSize(uploadedFile.size)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setContent("");
                              setDetectedSections([]);
                              setSelectedSection("");
                            }}
                            className="p-1 px-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {metadataWarning && (
                          <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-normal font-semibold animate-fade-in flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>{metadataWarning}</div>
                          </div>
                        )}

                        {/* Choose teaching section segment */}
                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2.5">
                          <label id="lbl-selected-section" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            🎯 Chọn phần giảng dạy trong ngày từ tài liệu:
                          </label>
                          
                          <div className="grid grid-cols-2 gap-1.5 pb-1">
                            {/* Always offer Whole document selection */}
                            <button
                              type="button"
                              onClick={() => setSelectedSection("")}
                              className={`py-2 px-2.5 text-left rounded-xl text-[10px] font-extrabold transition-all border ${
                                selectedSection === ""
                                  ? 'bg-emerald-650 border-emerald-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                              }`}
                            >
                              📍 Toàn bộ tài liệu
                            </button>

                            {/* Map dynamic sections extracted from the actual syllabus/presentation file */}
                            {detectedSections.map((secName, index) => {
                              const isSelected = selectedSection === secName;
                              return (
                                <button
                                  type="button"
                                  key={index}
                                  onClick={() => setSelectedSection(secName)}
                                  className={`py-2 px-2.5 text-left rounded-xl text-[10px] font-extrabold transition-all border truncate shadow-sm ${
                                    isSelected
                                      ? 'bg-emerald-650 border-emerald-650 text-white font-black'
                                      : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-350'
                                  }`}
                                  title={secName}
                                >
                                  📖 {secName}
                                </button>
                              );
                            })}
                          </div>

                          {isAnalyzingFile && detectedSections.length === 0 && (
                            <div className="py-2.5 px-3 bg-emerald-50/40 border border-emerald-100/60 rounded-xl space-y-1.5 text-center animate-pulse">
                              <p className="text-[10px] font-extrabold text-amber-700 flex items-center justify-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                AI đang bóc tách phân tích chi tiết mục lục giáo trình...
                              </p>
                              <div className="h-2 bg-slate-200 rounded-full w-4/5 mx-auto"></div>
                            </div>
                          )}

                          {!isAnalyzingFile && detectedSections.length === 0 && (
                            <p className="text-[10px] text-slate-450 font-semibold italic">
                              (Không tìm thấy mục lục phân chia rõ ràng hoặc đang trống. Nhập thủ công bên dưới)
                            </p>
                          )}
                        </div>

                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              id="ipt-custom-section"
                              value={selectedSection}
                              onChange={(e) => setSelectedSection(e.target.value)}
                              placeholder="Hoặc tự gõ mục cụ thể (Ví dụ: Phần 3.1, slide 12-20, hay tiểu mục...)"
                              className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-semibold transition-all"
                            />
                            {selectedSection && (
                              <button
                                type="button"
                                onClick={() => setSelectedSection("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 font-bold text-xs"
                                title="Xóa lựa chọn"
                              >
                                ✖
                              </button>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-500 leading-normal font-semibold bg-emerald-50/50 p-2 rounded-lg">
                            💡 <span className="text-emerald-800">Cơ chế thông minh:</span> AI sẽ tự động định vị mục tiêu, phân tích, trích xuất cấu trúc slide & sách để thiết kế bài học tương tác bám chặt theo phần <b>{selectedSection || "Toàn bộ tài liệu"}</b> đã chọn.
                          </p>
                        </div>

                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-[10px] text-slate-550 leading-relaxed font-semibold">
                          💡 Mẹo bổ sung: <span className="text-slate-650">Bạn có thể cấu hình thêm các tiêu đề bổ sung bên dưới, rồi ấn nút <b>Bắt đầu kết xuất bài học</b> ở dưới cùng. AI sẽ tự động đọc tài liệu của bạn để cấu hình học liệu tương tác.</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border-2 border-emerald-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden animate-fade-in group">
                    <div className="absolute -right-16 -top-16 opacity-30 group-hover:opacity-60 transition-opacity">
                      <Sparkles className="w-48 h-48 text-emerald-200" />
                    </div>
                    <label id="lbl-expert-topic" className="block text-xs font-bold text-slate-700 relative z-10 flex items-center gap-1.5">
                      Nhập chủ đề bạn muốn dạy:
                    </label>
                    <textarea
                      value={aiExpertTopic}
                      onChange={(e) => setAiExpertTopic(e.target.value)}
                      placeholder="Ví dụ: Định luật Newton, Phân tích bài thơ Sóng, Lịch sử nhà Nguyễn..."
                      rows={2}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white/80 backdrop-blur-sm shadow-inner transition-all relative z-10"
                    />
                    
                    <button
                      type="button"
                      onClick={handleGenerateExpertTopic}
                      disabled={isGeneratingExpertTopic || !aiExpertTopic.trim()}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm relative z-10 cursor-pointer"
                    >
                      {isGeneratingExpertTopic ? (
                         <span className="flex items-center gap-2">
                           <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           AI đang thu thập dữ liệu & viết bài...
                         </span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Sinh tài liệu từ cơ sở dữ liệu học thuật
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-500 font-medium pt-1 relative z-10 leading-relaxed text-center">
                      AI sẽ tự động tổng hợp kiến thức từ các chương trình học thuật uy tín và điền vào ô "Nội dung bài học" bên dưới.
                    </p>
                  </div>
                )}
              </div>

              {/* Core Configuration Parameters form wrapper */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b pb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-emerald-600" /> Cấu hình thông tin đại cương
                  </span>
                  {isAnalyzingFile ? (
                    <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse border border-amber-200">
                      ⚡ AI Đang trích xuất điền tự động...
                    </span>
                  ) : uploadedFile ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fade-in">
                      ✨ Đã đồng bộ thông tin từ giáo trình
                    </span>
                  ) : null}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label id="lbl-title" className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề bài học:</label>
                    <input
                      type="text"
                      id="ipt-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Khái niệm Lạm phát & Thất nghiệp..."
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label id="lbl-subject" className="block text-xs font-bold text-slate-500 uppercase mb-1">Lĩnh vực / Môn học:</label>
                    <input
                      type="text"
                      id="ipt-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ví dụ: Kinh tế học vĩ mô"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label id="lbl-level" className="block text-xs font-bold text-slate-500 uppercase mb-1">Trình độ sinh viên:</label>
                    <select
                      id="ipt-level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="" disabled>Chọn trình độ...</option>
                      <option>Sinh viên Đại học năm 1 - 2</option>
                      <option>Sinh viên Đại học năm 1 - 2</option>
                      <option>Sinh viên Đại học chuyên ngành (Năm 3 - 4)</option>
                      <option>Học viên Cao học / Nghiên cứu sinh</option>
                    </select>
                  </div>

                  <div>
                    <label id="lbl-duration" className="block text-xs font-bold text-slate-500 uppercase mb-1">Thời lượng học dự kiến:</label>
                    <select
                      id="ipt-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="" disabled>Chọn thời lượng...</option>
                      <option>30 phút tự học</option>
                      <option>45 phút</option>
                      <option>60 phút</option>
                      <option>90 phút</option>
                      <option>120 phút tự học & thảo luận</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label id="lbl-objectives" className="block text-xs font-bold text-slate-500 uppercase">Mục tiêu sư phạm mong muốn (Khuyên dùng Bloom):</label>
                  <textarea
                    id="ipt-objectives"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Ví dụ: Định nghĩa được lạm phát, thất nghiệp và các chỉ số đo lường..."
                    rows={3}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="block text-xs font-bold text-slate-500 uppercase">Lựa chọn các cấu phần tương tác đính kèm:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-medium">
                      <input type="checkbox" checked={enableWarmUp} onChange={(e) => setEnableWarmUp(e.target.checked)} className="accent-emerald-600 rounded" />
                      <span>Hoạt động Khởi động (Warm-up)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-medium">
                      <input type="checkbox" checked={enableFlashcards} onChange={(e) => setEnableFlashcards(e.target.checked)} className="accent-emerald-600 rounded" />
                      <span>Bộ thẻ ôn tập thuật ngữ (Flashcard)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-medium">
                      <input type="checkbox" checked={enableQuiz} onChange={(e) => setEnableQuiz(e.target.checked)} className="accent-emerald-600 rounded" />
                      <span>Quiz Thử tài trắc nghiệm (5 Câu)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-medium">
                      <input type="checkbox" checked={enableCaseStudy} onChange={(e) => setEnableCaseStudy(e.target.checked)} className="accent-emerald-600 rounded" />
                      <span>Nghiên cứu tình huống (Case study)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-xl text-xs font-medium sm:col-span-2">
                      <input type="checkbox" checked={enableReflection} onChange={(e) => setEnableReflection(e.target.checked)} className="accent-emerald-600 rounded" />
                      <span>3 Câu hỏi phản biện sâu để lấy bản ghi thu hoạch (.txt)</span>
                    </label>
                  </div>
                </div>

                {/* 🎨 BẢNG ĐIỀU KHIỂN MỸ THUẬT & GIAO DIỆN (INTERACTIVE DESIGN CUSTOMIZER) */}
                <div className="space-y-3.5 pt-3.5 border-t border-slate-100/90 bg-slate-50/70 -mx-5 px-5 py-4 my-2 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-sm">🎨</span> Cấu hình Thiết kế & Mỹ thuật học liệu
                    </span>
                    <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider scale-95 origin-right">v2.0 PRO</span>
                  </div>
                  
                  {/* 1. Theme Color Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Tông màu chủ đạo (Color Theme):</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] ${
                        appTheme === 'ocean' ? 'text-blue-600' :
                        appTheme === 'emerald' ? 'text-emerald-600' :
                        appTheme === 'sunset' ? 'text-orange-650' :
                        appTheme === 'mystic' ? 'text-purple-600' :
                        'text-rose-600'
                      }`}>{appTheme}</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { key: 'ocean', color: 'bg-blue-600', label: 'Ocean' },
                        { key: 'emerald', color: 'bg-emerald-600', label: 'Emerald' },
                        { key: 'sunset', color: 'bg-orange-600', label: 'Sunset' },
                        { key: 'mystic', color: 'bg-purple-650', label: 'Mystic' },
                        { key: 'rose', color: 'bg-rose-600', label: 'Rose' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setAppTheme(item.key as any)}
                          className={`relative flex flex-col items-center justify-center p-2 rounded-xl border bg-white transition-all cursor-pointer ${
                            appTheme === item.key 
                              ? 'border-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] ring-2 ring-slate-800 ring-offset-1 scale-105 font-bold z-10' 
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-4.5 h-4.5 rounded-full ${item.color} shadow-inner mb-1`}></span>
                          <span className="text-[9px] text-slate-650 font-bold leading-none">{item.label}</span>
                          {appTheme === item.key && (
                            <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold shadow">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Background Pattern Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Kiểu hình nền học liệu:</span>
                      <span className="text-slate-700 font-extrabold capitalize">{appBackground} filter</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { key: 'glass', icon: '✨', label: 'Kính mờ' },
                        { key: 'grid', icon: '📐', label: 'Hệ lưới' },
                        { key: 'minimal', icon: '▫️', label: 'Tối giản' },
                        { key: 'neon', icon: '🌌', label: 'Bóng đêm' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setAppBackground(item.key as any)}
                          className={`relative py-2 px-1 rounded-xl border transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
                            appBackground === item.key 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02] font-extrabold z-10' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs mb-0.5">{item.icon}</span>
                          <span className="text-[9px] font-bold leading-normal">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Font Pairings & FontSize */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase block">Phông chữ sư phạm:</label>
                      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
                        {[
                          { key: 'sans', label: 'Sans-serif' },
                          { key: 'serif', label: 'Serif học' },
                          { key: 'mono', label: 'Mono kĩ' }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setAppFont(item.key as any)}
                            className={`flex-1 py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                              appFont === item.key 
                                ? 'bg-slate-800 text-white shadow-xs font-black' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase block">Cỡ chữ học tập:</label>
                      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
                        {[
                          { key: 'normal', label: 'Thường' },
                          { key: 'large', label: 'Lớn' },
                          { key: 'xlarge', label: 'Rất Lớn' }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setAppFontSize(item.key as any)}
                            className={`flex-1 py-1 text-[9px] font-extrabold rounded-md cursor-pointer transition-all ${
                              appFontSize === item.key 
                                ? 'bg-slate-800 text-white shadow-xs font-black' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-100/80 p-2 rounded-lg border border-slate-200/50">
                    <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                      👉 <b>Chỉ định Mỹ thuật v2.0:</b> Các tùy chọn giao diện sẽ được áp dụng trực tiếp thời gian thực vào <b>Khung xem thử sinh viên</b> bên phải và được tự động cấu hình đóng gói sâu vào mã nguồn trong tệp .html khi bạn xuất bản!
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label id="lbl-content" className="block text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>{uploadedFile ? "Chỉ dẫn / Ý kiến bổ sung cho tài liệu đã tải (Tùy chọn):" : "Nội dung bài học hoặc ý tưởng thô cần xử lý:"}</span>
                    <span className="text-[10px] p-0.5 px-1.5 rounded-full bg-slate-100 text-slate-550 font-extrabold">{uploadedFile ? "Không bắt buộc" : "Hỗ trợ lên tới 10,000 từ"}</span>
                  </label>
                  <textarea
                    id="ipt-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={uploadedFile ? "Nhập thêm chỉ dẫn phụ (ví dụ: 'Hãy làm sâu hơn về các khái niệm trong slide 5', hoặc 'Sử dụng bối cảnh công ty Việt Nam'...) hoặc để trống để AI tự động trích xuất toàn bộ tài liệu..." : "Dán tóm tắt lý thuyết, nội dung slide, văn bản bài giảng, hoặc đề cương thô của bạn tại đây để AI bắt đầu cấu trúc..."}
                    rows={uploadedFile ? 4 : 10}
                    required={!uploadedFile}
                    className="w-full text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white leading-relaxed font-semibold transition-all duration-300"
                  />
                </div>

                {/* Error notifications */}
                {generationError && (
                  <div id="pnl-error" className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-655 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">Gặp trở ngại kỹ thuật</h4>
                      <p className="mt-0.5 leading-relaxed">{generationError}</p>
                    </div>
                  </div>
                )}

                {/* Generate Action trigger button */}
                <button
                  id="btn-trigger"
                  disabled={isGenerating}
                  onClick={handleGenerateLesson}
                  className={`relative overflow-hidden w-full py-4 rounded-xl text-white font-extrabold text-[15px] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer group ${isGenerating ? 'bg-slate-400 shadow-none' : 'bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 hover:shadow-[0_8px_25px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                  {!isGenerating && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  )}
                  {isGenerating ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></span>
                      <span className="relative z-10">Đang khởi tạo bài học...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white animate-pulse relative z-10" />
                      <span className="relative z-10 drop-shadow-sm tracking-wide">Khởi Tạo Bài Học Tương Tác</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* STEP 2: COMPACT LIVE SLIDES & MODULES PRODUCT EDITOR */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-1.5">
                <div>
                  <span className="font-black text-slate-850 text-sm">✍️ BIÊN TẬP CHI TIẾT .HTML</span>
                  <p className="text-[10px] text-slate-500 leading-tight">Thay đổi nội dung sẽ tự cập nhật sang Trình Xem Thử</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Quay lại Phần 1 lập kế hoạch? Bạn có thể nạp tệp mới.")) {
                      setEditorStep('generate');
                    }
                  }}
                  className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold transition-all cursor-pointer"
                >
                  🔄 Nạp / Tạo Học Liệu Mới
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg border text-[10px] font-bold">
                {[
                  { key: 'general', label: 'Ý chính' },
                  { key: 'slides', label: 'Slide học' },
                  { key: 'quiz', label: 'Trắc nghiệm' },
                  { key: 'warmup', label: 'Warmup/Flash' },
                  { key: 'casestudy', label: 'Case Study' },
                  { key: 'reflection', label: 'Tổng kết' }
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setEditSectionTab(t.key as any)}
                    className={`py-1 rounded cursor-pointer transition-all ${
                      editSectionTab === t.key 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* 1. GENERAL */}
              {editSectionTab === 'general' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-0.5">Tiêu đề bài học:</label>
                    <input
                      type="text"
                      value={generatedLesson.lessonTitle}
                      onChange={e => updateLessonField(l => { l.lessonTitle = e.target.value; })}
                      className="w-full bg-slate-50 focus:bg-white border p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-0.5">Giới thiệu mở đầu:</label>
                    <textarea
                      value={generatedLesson.introduction}
                      onChange={e => updateLessonField(l => { l.introduction = e.target.value; })}
                      rows={3}
                      className="w-full bg-slate-50 focus:bg-white border p-2.5 rounded-xl font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-550"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-0.5">3 Mục tiêu sư phạm (Bloom):</label>
                    {generatedLesson.learningObjectives.map((obj, i) => (
                      <div key={i} className="flex gap-1.5 items-center">
                        <span className="text-slate-400 font-bold">#{i+1}</span>
                        <input
                          type="text"
                          value={obj}
                          onChange={e => updateLessonField(l => { l.learningObjectives[i] = e.target.value; })}
                          className="w-full bg-slate-50 focus:bg-white border p-2.5 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SLIDES */}
              {editSectionTab === 'slides' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="flex flex-wrap gap-1 items-center pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 mr-1.5">Slide:</span>
                    {generatedLesson.sections.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditingSlideIndex(i)}
                        className={`w-6.5 h-6.5 rounded-lg text-xs font-black cursor-pointer transition-all ${
                          editingSlideIndex === i 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateLessonField(l => {
                        l.sections.push({
                          title: `Mô đun ${l.sections.length + 1}`,
                          content: "Nội dung slide lý thuyết mới. Bạn có thể sử dụng các thẻ Markdown cơ bản.",
                          example: "Ví dụ trực quan về giải pháp môn học...",
                          quickCheck: {
                            question: "Câu tương tác tự kiểm tra nhanh?",
                            hint: "Gợi ý cho sinh viên",
                            suggestedAnswer: "Lời giải mẫu mong muốn"
                          },
                          lecturerNotes: "Ghi chú dành cho thầy cô đứng lớp"
                        });
                        setEditingSlideIndex(l.sections.length - 1);
                      })}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-black text-[10px] cursor-pointer transition-all border border-emerald-200 flex items-center justify-center"
                    >
                      ➕ Thêm Slide
                    </button>
                  </div>
                  
                  {generatedLesson.sections[editingSlideIndex] && (
                    <div className="space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-indigo-800 text-[10px] uppercase">📝 Nội Dung Slide {editingSlideIndex + 1}</span>
                        {generatedLesson.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Chắc chắn xóa Slide này?")) {
                                updateLessonField(l => {
                                  l.sections.splice(editingSlideIndex, 1);
                                  if (editingSlideIndex >= l.sections.length) {
                                    setEditingSlideIndex(Math.max(0, l.sections.length - 1));
                                  }
                                });
                              }
                            }}
                            className="text-red-600 text-[10px] font-black hover:underline cursor-pointer border-transparent bg-red-50 hover:bg-red-100 border px-2 py-0.5 rounded"
                          >
                            🗑️ Xóa Slide
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Tiêu đề slide lý thuyết:</label>
                        <input
                          type="text"
                          value={generatedLesson.sections[editingSlideIndex].title}
                          onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].title = e.target.value; })}
                          className="w-full bg-white border p-2 rounded-lg font-semibold shadow-3xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Nội dung cốt lõi khóa học (Hỗ trợ Markdown):</label>
                        <textarea
                          value={generatedLesson.sections[editingSlideIndex].content}
                          onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].content = e.target.value; })}
                          rows={4}
                          className="w-full bg-white border p-2 rounded-lg font-medium shadow-3xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Ví dụ trực quan:</label>
                        <textarea
                          value={generatedLesson.sections[editingSlideIndex].example}
                          onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].example = e.target.value; })}
                          rows={2}
                          className="w-full bg-white border p-2 rounded-lg font-medium shadow-3xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                          placeholder="Ví dụ cụ thể thực tế"
                        />
                      </div>

                      {/* FILE UPLOAD & AI IMAGE GENERATOR MODULE */}
                      <div className="border-t pt-3.5 space-y-2.5">
                        <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider">🖼️ THIẾT KẾ HÌNH ẢNH MINH HỌA SLIDE</span>
                        
                        {/* Position choices */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-500">Vị trí ảnh:</span>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border gap-1">
                            <button
                              type="button"
                              onClick={() => updateLessonField(l => { l.sections[editingSlideIndex].imagePosition = 'right'; })}
                              className={`px-2 py-1 text-[9px] font-black rounded cursor-pointer ${
                                (generatedLesson.sections[editingSlideIndex].imagePosition || 'right') === 'right'
                                  ? 'bg-white text-slate-900 shadow-3xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              👉 Góc phải (Mặc định)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLessonField(l => { l.sections[editingSlideIndex].imagePosition = 'left'; })}
                              className={`px-2 py-1 text-[9px] font-black rounded cursor-pointer ${
                                generatedLesson.sections[editingSlideIndex].imagePosition === 'left'
                                  ? 'bg-white text-slate-900 shadow-3xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              👈 Góc trái
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLessonField(l => { l.sections[editingSlideIndex].imagePosition = 'hide'; })}
                              className={`px-2 py-1 text-[9px] font-black rounded cursor-pointer ${
                                generatedLesson.sections[editingSlideIndex].imagePosition === 'hide'
                                  ? 'bg-white text-rose-700 shadow-3xs'
                                  : 'text-slate-500 hover:text-rose-700/80'
                              }`}
                            >
                              🚫 Ẩn hình ảnh
                            </button>
                          </div>
                        </div>

                        {/* Split block: upload & Prompt generator */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                          {/* Left col: manual file upload */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                            <div>
                              <span className="block text-[9px] font-black text-slate-650 mb-1">📤 Tải ảnh từ thiết bị</span>
                              <div 
                                className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-3 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/20 relative"
                                onClick={() => document.getElementById(`slide-file-${editingSlideIndex}`)?.click()}
                              >
                                <input
                                  type="file"
                                  id={`slide-file-${editingSlideIndex}`}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, editingSlideIndex);
                                  }}
                                />
                                {generatedLesson.sections[editingSlideIndex].imageUrl && !generatedLesson.sections[editingSlideIndex].imageUrl.startsWith('https://image.pollinations.ai') ? (
                                  <div className="space-y-1.5 flex flex-col items-center">
                                    <img 
                                      src={generatedLesson.sections[editingSlideIndex].imageUrl} 
                                      alt="Upload Preview" 
                                      className="max-h-12 rounded object-cover border"
                                    />
                                    <span className="text-[8px] font-bold text-slate-500 block overflow-hidden text-ellipsis max-w-[150px] whitespace-nowrap">Hình ảnh đã nạp</span>
                                    <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-bold">✓ Nhấp để đổi ảnh</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <span className="text-lg block">📁</span>
                                    <span className="text-[8px] font-bold text-slate-500 block leading-normal">Chọn ảnh từ máy tính<br/>(PNG, JPG, GIF...)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {generatedLesson.sections[editingSlideIndex].imageUrl && (
                              <button
                                type="button"
                                onClick={() => updateLessonField(l => {
                                  l.sections[editingSlideIndex].imageUrl = undefined;
                                  l.sections[editingSlideIndex].imagePrompt = undefined;
                                })}
                                className="w-full text-center text-red-500 hover:text-red-600 font-extrabold text-[8px] hover:bg-red-50 p-1 rounded-md border border-transparent hover:border-red-100 cursor-pointer"
                              >
                                ✕ Xóa hình ảnh hiện tại
                              </button>
                            )}
                          </div>

                          {/* Right col: prompt design tool via Gemini */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="block text-[9px] font-black text-slate-650">✨ Tạo ảnh minh họa bằng AI</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  disabled={generatingPromptSlideIdx === editingSlideIndex}
                                  onClick={() => handleGenerateImagePrompt(editingSlideIndex)}
                                  className="w-full text-center py-1.5 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-350 disabled:to-slate-400 text-white font-extrabold text-[9px] rounded-lg transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
                                >
                                  {generatingPromptSlideIdx === editingSlideIndex ? (
                                    <>
                                      <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                      Đang vạch ý...
                                    </>
                                  ) : (
                                    <>
                                      🔮 Tự động tạo prompt nội dung
                                    </>
                                  )}
                                </button>
                              </div>

                              {generatedLesson.sections[editingSlideIndex].imagePrompt && (
                                <div className="space-y-1 animate-fade-in">
                                  <label className="text-[7.5px] font-bold text-slate-450 block uppercase">Prompt vẽ tranh (Tiếng Anh, có thể chỉnh sửa):</label>
                                  <textarea
                                    value={generatedLesson.sections[editingSlideIndex].imagePrompt || ""}
                                    onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].imagePrompt = e.target.value; })}
                                    rows={2}
                                    placeholder="Enter prompt description..."
                                    className="w-full bg-slate-50 focus:bg-white text-[9px] p-1.5 border rounded-md font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              )}
                            </div>

                            {generatedLesson.sections[editingSlideIndex].imagePrompt && (
                              <button
                                type="button"
                                onClick={() => handleRegenerateImage(editingSlideIndex, generatedLesson.sections[editingSlideIndex].imagePrompt || "")}
                                className="w-full text-center py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-[8px] rounded-md transition-all border border-teal-200/50 cursor-pointer"
                              >
                                🔄 Tái sinh vẽ lại với prompt
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Active Image URL view for testing or verification */}
                        {generatedLesson.sections[editingSlideIndex].imageUrl && (
                          <div className="bg-slate-100/50 p-1.5 rounded-lg border text-[8px] font-mono flex items-center justify-between gap-2 text-slate-500 overflow-hidden text-ellipsis">
                            <span className="truncate max-w-[200px]">Link: {generatedLesson.sections[editingSlideIndex].imageUrl}</span>
                            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50/80 px-1 border border-emerald-100 rounded flex-shrink-0">ONLINE PREVIEW</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t pt-2 space-y-1.5">
                        <span className="block text-[9px] font-black text-indigo-700 uppercase">Interactive Quick-check (Tự rèn luyện nhanh)</span>
                        <div>
                          <input
                            type="text"
                            value={generatedLesson.sections[editingSlideIndex].quickCheck.question}
                            onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].quickCheck.question = e.target.value; })}
                            className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-bold shadow-3xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            placeholder="Câu hỏi trắc nghiệm / tự luận nhanh"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={generatedLesson.sections[editingSlideIndex].quickCheck.hint}
                            onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].quickCheck.hint = e.target.value; })}
                            className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-semibold text-slate-650"
                            placeholder="Gợi ý suy nghĩ"
                          />
                          <input
                            type="text"
                            value={generatedLesson.sections[editingSlideIndex].quickCheck.suggestedAnswer}
                            onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].quickCheck.suggestedAnswer = e.target.value; })}
                            className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-semibold text-slate-650"
                            placeholder="Lời giải gợi ý"
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">💡 Chú giải sư phạm của Giảng viên (Không hiện cho học sinh):</label>
                        <input
                          type="text"
                          value={generatedLesson.sections[editingSlideIndex].lecturerNotes || ""}
                          onChange={e => updateLessonField(l => { l.sections[editingSlideIndex].lecturerNotes = e.target.value; })}
                          className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-medium"
                          placeholder="Nhắc nhở giáo án lúc trình chiếu..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. QUIZ QUESTIONS */}
              {editSectionTab === 'quiz' && (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-0.5 animate-fade-in">
                  <div className="flex justify-between items-center border-b pb-1.5 gap-2">
                    <span className="font-extrabold text-slate-500 text-[10px] uppercase">
                      Bộ Trắc Nghiệm ({generatedLesson.quizQuestions.length} câu)
                    </span>
                    <button
                      type="button"
                      onClick={() => updateLessonField(l => {
                        const nextId = l.quizQuestions.length > 0 
                          ? Math.max(...l.quizQuestions.map(q => q.id)) + 1 
                          : 1;
                        l.quizQuestions.push({
                          id: nextId,
                          question: "Câu hỏi trắc nghiệm mới?",
                          options: [
                            "Lựa chọn A",
                            "Lựa chọn B",
                            "Lựa chọn C",
                            "Lựa chọn D"
                          ],
                          correctAnswer: "A",
                          explanation: "Giải thích lý do lựa chọn này là chính xác...",
                          bloomLevel: "Nhớ/Hiểu"
                        });
                      })}
                      className="text-[9px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 px-2 py-0.5 rounded cursor-pointer font-black transition-all flex items-center gap-1"
                    >
                      ➕ Thêm Câu Hỏi
                    </button>
                  </div>
                  {generatedLesson.quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 p-2.5 border rounded-xl space-y-2 shadow-3xs">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-indigo-750 font-black">Câu hỏi {qIdx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={q.bloomLevel}
                            onChange={e => updateLessonField(l => { l.quizQuestions[qIdx].bloomLevel = e.target.value as any; })}
                            className="bg-white border rounded p-0.5 text-[9px] font-bold"
                          >
                            <option value="Nhớ/Hiểu">Nhớ/Hiểu</option>
                            <option value="Vận dụng">Vận dụng</option>
                            <option value="Ra quyết định">Ra quyết định</option>
                          </select>
                          {generatedLesson.quizQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
                                  updateLessonField(l => { l.quizQuestions.splice(qIdx, 1); });
                                }
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded transition-all cursor-pointer text-[10px] font-black"
                              title="Xóa câu hỏi này"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <input
                        type="text"
                        value={q.question}
                        onChange={e => updateLessonField(l => { l.quizQuestions[qIdx].question = e.target.value; })}
                        className="w-full bg-white border p-1.5 rounded-lg text-slate-850 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                      />
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1 bg-white p-1 rounded-lg border">
                            <span className="text-[9px] font-black text-indigo-500 uppercase px-1">{String.fromCharCode(65 + oIdx)}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateLessonField(l => { l.quizQuestions[qIdx].options[oIdx] = e.target.value; })}
                              className="w-full bg-transparent focus:outline-none text-[10px] font-extrabold text-slate-700"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[8px] block text-slate-450 font-bold uppercase mb-0.5">Đáp án đúng:</label>
                          <select
                            value={q.correctAnswer}
                            onChange={e => updateLessonField(l => { l.quizQuestions[qIdx].correctAnswer = e.target.value; })}
                            className="w-full bg-white border rounded-lg p-1 text-[10px] font-black"
                          >
                            <option value="A">Choice A</option>
                            <option value="B">Choice B</option>
                            <option value="C">Choice C</option>
                            <option value="D">Choice D</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8px] block text-slate-450 font-bold uppercase mb-0.5">Giải thích vì sao đúng:</label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={e => updateLessonField(l => { l.quizQuestions[qIdx].explanation = e.target.value; })}
                            className="w-full bg-white border rounded-lg p-1 px-1.5 text-[10px] font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. WARMUP & FLASHCARDS */}
              {editSectionTab === 'warmup' && (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-0.5 animate-fade-in">
                  <div className="bg-slate-50 p-2.5 rounded-xl border space-y-2">
                    <span className="font-extrabold text-indigo-850 block border-b pb-1 text-[10px] uppercase">🔥 Hoạt động mở đầu (Warm up)</span>
                    <input
                      type="text"
                      aria-label="warmup title"
                      value={generatedLesson.warmUp.title}
                      onChange={e => updateLessonField(l => { l.warmUp.title = e.target.value; })}
                      className="w-full bg-white border p-1.5 rounded-lg text-[11px] font-bold"
                      placeholder="Tiêu đề khởi động"
                    />
                    <textarea
                      aria-label="warmup background"
                      value={generatedLesson.warmUp.description}
                      onChange={e => updateLessonField(l => { l.warmUp.description = e.target.value; })}
                      rows={2}
                      className="w-full bg-white border p-1.5 rounded-lg text-[10px]"
                      placeholder="Mô tả bối cảnh"
                    />
                    <textarea
                      aria-label="warmup study task"
                      value={generatedLesson.warmUp.task}
                      onChange={e => updateLessonField(l => { l.warmUp.task = e.target.value; })}
                      rows={2}
                      className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-bold"
                      placeholder="Nhiệm vụ sư phạm giao học sinh"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-700 text-[10px] uppercase">💳 Thẻ Từ Vựng/Thuật Ngữ (Flashcards)</span>
                      <button
                        type="button"
                        onClick={() => updateLessonField(l => { l.flashcards.push({ front: "Thuật ngữ mới", back: "Giải thích..." }); })}
                        className="text-[9px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 px-2 py-0.5 rounded cursor-pointer font-black transition-all"
                      >
                        ➕ Thêm Thẻ
                      </button>
                    </div>
                    {generatedLesson.flashcards.map((fc, idx) => (
                      <div key={idx} className="flex gap-2 bg-slate-50 p-2 border rounded-lg items-center relative animate-fade-in shadow-3xs">
                        <span className="text-[10px] text-slate-400 font-bold">#{idx+1}</span>
                        <div className="grid grid-cols-2 gap-2 flex-grow">
                          <input
                            type="text"
                            value={fc.front}
                            onChange={e => updateLessonField(l => { l.flashcards[idx].front = e.target.value; })}
                            className="bg-white border p-1.5 rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                            placeholder="Thuật ngữ"
                          />
                          <input
                            type="text"
                            value={fc.back}
                            onChange={e => updateLessonField(l => { l.flashcards[idx].back = e.target.value; })}
                            className="bg-white border p-1.5 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-550"
                            placeholder="Giải thích"
                          />
                        </div>
                        {generatedLesson.flashcards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => updateLessonField(l => { l.flashcards.splice(idx, 1); })}
                            className="text-red-500 font-extrabold px-1.5 hover:bg-red-50 rounded-md py-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 5. CASE STUDY */}
              {editSectionTab === 'casestudy' && (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-0.5 animate-fade-in">
                  <div className="bg-slate-50 p-2.5 rounded-xl border space-y-1.5 shadow-3xs">
                    <label className="text-[9px] block text-slate-500 font-black uppercase mb-0.5">Tên tình huống thực tế:</label>
                    <input
                      type="text"
                      value={generatedLesson.caseStudy.title}
                      onChange={e => updateLessonField(l => { l.caseStudy.title = e.target.value; })}
                      className="w-full bg-white border p-2 rounded-lg font-bold text-slate-800"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[9px] block text-slate-500 font-black uppercase mb-0.5">Bối cảnh chi tiết (Việt Nam hoặc Quốc tế):</label>
                    <textarea
                      value={generatedLesson.caseStudy.context}
                      onChange={e => updateLessonField(l => { l.caseStudy.context = e.target.value; })}
                      rows={3}
                      className="w-full bg-slate-50 border p-2 rounded-lg leading-relaxed font-semibold focus:bg-white focus:outline-none"
                    />
                  </div>
                  
                  <span className="block text-[10px] font-black text-indigo-755 uppercase border-b pb-0.5">💼 3 Nhiệm vụ thang nhận thức Bloom</span>
                  {generatedLesson.caseStudy.tasks.map((t, idx) => (
                    <div key={idx} className="p-3 border rounded-xl bg-slate-50/70 space-y-2 shadow-3xs">
                      <span className="block font-black text-teal-800 text-[10px] uppercase">Mức {idx+1}: {t.bloomLevel}</span>
                      <input
                        type="text"
                        value={t.question}
                        onChange={e => updateLessonField(l => { l.caseStudy.tasks[idx].question = e.target.value; })}
                        className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-teal-700"
                        placeholder="Nhiệm vụ sinh viên"
                      />
                      <input
                        type="text"
                        value={t.hint}
                        onChange={e => updateLessonField(l => { l.caseStudy.tasks[idx].hint = e.target.value; })}
                        className="w-full bg-white border p-1.5 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-teal-700 text-slate-650"
                        placeholder="Gợi ý phương án nghiên cứu"
                      />
                      <textarea
                        value={t.suggestedAnswer}
                        onChange={e => updateLessonField(l => { l.caseStudy.tasks[idx].suggestedAnswer = e.target.value; })}
                        rows={2}
                        className="w-full bg-white border p-1.5 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-teal-700 font-semibold text-slate-700 shadow-3xs"
                        placeholder="Lời giải gợi ý"
                      />
                    </div>
                  ))}

                  <div className="space-y-1.5 border-t pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                      <span>Rubric Chấm Điểm Thầy Cô:</span>
                      <button
                        type="button"
                        onClick={() => updateLessonField(l => { l.caseStudy.rubric.push("Tiêu chí mới để đánh giá học phần..."); })}
                        className="text-[9px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-250 cursor-pointer font-bold"
                      >
                        ➕ Thêm Rubric
                      </button>
                    </div>
                    {generatedLesson.caseStudy.rubric.map((rc, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center">
                        <span className="text-[9px] font-semibold text-slate-400">RC{idx+1}</span>
                        <input
                          type="text"
                          value={rc}
                          onChange={e => updateLessonField(l => { l.caseStudy.rubric[idx] = e.target.value; })}
                          className="w-full bg-slate-50 focus:bg-white border p-1.5 rounded-lg text-[10px] font-medium"
                        />
                        {generatedLesson.caseStudy.rubric.length > 1 && (
                          <button
                            type="button"
                            onClick={() => updateLessonField(l => { l.caseStudy.rubric.splice(idx, 1); })}
                            className="text-red-500 cursor-pointer text-xs font-bold px-1 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. REFLECTIONS & SUMMARY */}
              {editSectionTab === 'reflection' && (
                <div className="space-y-3.5 animate-fade-in">
                  <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none border-b pb-1">3 Câu hỏi phản biện suy ngẫm sâu (Self-Harvest):</span>
                  {generatedLesson.reflectionQuestions.map((rf, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-indigo-650 font-black">Q{idx+1}</span>
                      <input
                        type="text"
                        value={rf}
                        onChange={e => updateLessonField(l => { l.reflectionQuestions[idx] = e.target.value; })}
                        className="w-full bg-slate-50 focus:bg-white border p-2 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-550 shadow-3xs"
                      />
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase mb-1">Synthesized Core Summary (Bài học đúc kết cuối chương):</label>
                    <textarea
                      value={generatedLesson.summary}
                      onChange={e => updateLessonField(l => { l.summary = e.target.value; })}
                      rows={5}
                      className="w-full bg-slate-50 focus:bg-white border p-2.5 rounded-xl font-semibold leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-550 shadow-3xs"
                    />
                  </div>
                </div>
              )}

              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                <span className="block text-[10px] font-black text-indigo-850 uppercase tracking-wide">💡 LIVE SYNC CO-CREATION</span>
                <p className="text-[10px] text-slate-550 mt-0.5 leading-relaxed font-semibold">
                  Mọi thay đổi trên trình soạn thảo sẽ được áp dụng tự động <b>tức thì</b> vào mã xuất bản .HTML gốc và Khung xem thử bên phải!
                </p>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: PREVIEW SPACE / EXPORTS HUB (Takes 7/12 space) */}
        <section className="lg:col-span-7 flex flex-col min-w-0">
          
          {/* EMPTY INTRODUCTORY STATE (Before lecturer generates first content) */}
          {!generatedLesson && !isGenerating && (
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-white to-sky-50/50 border-2 border-white pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 text-center my-auto flex flex-col items-center justify-center space-y-10 h-full min-h-[500px]">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-300/20 blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>

              <div className="relative z-10 w-24 h-24 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_10px_40px_rgba(59,130,246,0.15)] flex items-center justify-center border border-white/60">
                <div className="absolute inset-0 rounded-3xl bg-blue-400/20 animate-ping opacity-20"></div>
                <BookOpen className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
              </div>
              
              <div className="relative z-10 max-w-2xl space-y-4">
                <h3 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 tracking-tight">
                  Kiến tạo bài giảng số <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">tương tác đỉnh cao</span>
                </h3>
                <p className="text-base sm:text-[17px] text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
                  Công cụ hỗ trợ giảng viên đại học hô biến tài liệu thô khan hiếm tương tác thành những module học tập sinh động nhờ trí thông minh sư phạm AI.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl text-left mt-4">
                {/* Bento Box 1 */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm border border-blue-100/50">1</div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-2">Chuẩn bị nội dung</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Nạp nội dung bài giảng, tài liệu nghiên cứu hoặc đề cương thô vào nền tảng.</p>
                </div>
                {/* Bento Box 2 */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm border border-indigo-100/50">2</div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-2">AI Phân tích</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Công cụ sẽ cấu trúc hóa bài giảng, khởi tạo câu hỏi tương tác theo chuẩn Bloom.</p>
                </div>
                {/* Bento Box 3 */}
                <div className="bg-white/60 backdrop-blur-2xl border border-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm border border-sky-100/50">3</div>
                  <h4 className="text-base font-extrabold text-slate-800 mb-2">Kiết xuất HTML</h4>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Nhận trọn bộ source code hiện đại sẵn sàng triển khai ngay lên LMS/Moodle.</p>
                </div>
              </div>
            </div>
          )}

          {/* GENERATION ACTIVE LOADING INDICATION */}
          {isGenerating && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-auto flex flex-col items-center justify-center space-y-8 h-full min-h-[450px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
              <div className="relative z-10 w-28 h-28 flex items-center justify-center">
                {/* Epic pulsing core */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-sky-400/20 to-teal-400/20 animate-pulse"></div>
                
                {/* Magic spinning orbits */}
                <div className="absolute w-[180%] h-[180%] rounded-full border-[2.5px] border-blue-400/20 border-t-blue-500 border-l-transparent animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute w-[140%] h-[140%] rounded-full border-[2.5px] border-teal-400/20 border-b-teal-500 border-r-transparent animate-[spin_2s_linear_infinite_reverse] opacity-70"></div>
                <div className="absolute w-[110%] h-[110%] rounded-full border-[2px] border-sky-400/20 border-r-sky-500 border-t-transparent animate-[spin_1.5s_linear_infinite]"></div>

                {/* Knowledge particles flying in */}
                <div className="absolute w-full h-full overflow-visible">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}></div>
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" style={{ animationDuration: '1s', animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.1s' }}></div>
                  <div className="-top-6 -left-6 absolute w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" style={{ animationDuration: '0.8s', animationDelay: '0.7s' }}></div>
                  <div className="-bottom-6 -right-6 absolute w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" style={{ animationDuration: '1.1s', animationDelay: '0.4s' }}></div>
                </div>

                {/* Book icon absorbing knowledge */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 animate-pulse"></div>
                  <BookOpen className="w-12 h-12 text-blue-600 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] relative z-10 animate-[bounce_2s_ease-in-out_infinite]" strokeWidth={2} />
                  <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-amber-400 animate-[spin_4s_linear_infinite]" />
                  <Sparkles className="absolute -bottom-3 -left-4 w-5 h-5 text-teal-400 animate-[spin_3s_linear_infinite_reverse]" />
                </div>
              </div>
              <div className="space-y-4 max-w-sm mt-6">
                <p className="text-[17px] font-extrabold text-slate-800 animate-pulse">Trí tuệ nhân tạo đang cấu trúc nội dung...</p>
                <div className="space-y-2 text-[13px] text-slate-500 font-medium">
                  <p>• Sắp đặt các mục tiêu giảng dạy thang đo Bloom</p>
                  <p>• Soạn bộ 5 câu trắc nghiệm thực tế kèm lý giải</p>
                  <p>• Chuyển ngữ các ví dụ thực tiễn trực quan sinh động</p>
                  <p>• Dựng kịch bản tình huống áp dụng bối cảnh Việt Nam</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE PREVIEW TAB 1: INTERACTIVE STUDENT SIMULATOR DEVICE VIEW */}
          {generatedLesson && activeTab === 'preview' && (
            <div className="space-y-4 flex flex-col h-full">

              {/* Action Toolbar to export immediately */}
              <div className="bg-emerald-800 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3.5 shadow-md shadow-emerald-250">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded">Xuất bản bài học</span>
                  <p className="text-xs font-semibold mt-1">Giảng án tương tác đã đóng gói hoàn chỉnh, sẵn sàng đem đi sử dụng.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    id="btn-sim-copy"
                    onClick={handleCopyCode}
                    className="w-1/2 sm:w-auto px-4 py-2 bg-emerald-900 border border-emerald-700/50 hover:bg-emerald-950 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép HTML
                      </>
                    )}
                  </button>
                  <button
                    id="btn-sim-dl"
                    onClick={handleDownloadFile}
                    className="w-1/2 sm:w-auto px-4 py-2 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" /> Tải về tệp .html
                  </button>
                </div>
              </div>

              {/* SIMULATOR SCREEN CONTAINER */}
              <div className="bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-slate-950 flex-grow flex flex-col relative">
                {/* Simulated Screen Header info bar */}
                <span className="text-[10px] text-slate-500 font-bold bg-slate-950 px-2.5 py-1 rounded-full absolute top-7 left-8 flex items-center gap-1.5 z-10">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> 
                  Bản giả lập người học trực tuyến
                </span>

                <div className={`rounded-2xl w-full flex-grow flex flex-col overflow-y-auto max-h-[640px] pt-8 p-4 sm:p-6 scrollbar-thin transition-all duration-300 ${
                  appFont === 'sans' ? 'font-sans' : appFont === 'serif' ? 'font-serif' : 'font-mono'
                } ${
                  appBackground === 'neon' ? 'bg-slate-950 text-slate-200' :
                  appBackground === 'glass' ? 'bg-gradient-to-br from-indigo-50/30 via-cyan-50/30 to-slate-100/40' :
                  appBackground === 'minimal' ? 'bg-[#fafbfc]' :
                  'bg-slate-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'
                }`}>
                  
                  {/* Inside simulated header banner */}
                  <div className={`p-3 rounded-xl mb-4 border text-[11px] flex items-center justify-between gap-2 flex-wrap ${
                    appBackground === 'neon' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    <span className="font-bold">🖥️ Mô phỏng thiết bị học sinh</span>
                    <div className="flex gap-2">
                      <span>⏱️ {duration}</span>
                      <span>🎓 {level}</span>
                    </div>
                  </div>

                  {/* TAB CONTROLS SIDEBAR INTERACTIVE PREVIEW */}
                  <div className={`flex gap-1 overflow-x-auto pb-2 border-b scrollbar-thin mb-4 ${
                    appBackground === 'neon' ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => setPreviewTab('intro')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'intro'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <BookMarked className="w-3.5 h-3.5" /> Giới thiệu & Mục tiêu
                    </button>
                    <button
                      onClick={() => setPreviewTab('warmup')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'warmup'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" /> Khởi động
                    </button>
                    <button
                      onClick={() => setPreviewTab('sections')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'sections'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Bài đọc ({previewSectionIdx + 1}/{generatedLesson.sections.length})
                    </button>
                    <button
                      onClick={() => setPreviewTab('flashcards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'flashcards'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Thẻ thuật ngữ
                    </button>
                    <button
                      onClick={() => setPreviewTab('quiz')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'quiz'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Câu hỏi Quiz
                    </button>
                    <button
                      onClick={() => setPreviewTab('casestudy')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'casestudy'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" /> Case Study
                    </button>
                    <button
                      onClick={() => setPreviewTab('reflection')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        previewTab === 'reflection'
                          ? themeColorsSim[appTheme].primary + ' active-tab-btn'
                          : appBackground === 'neon'
                            ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" /> Bản Thu Hoạch
                    </button>
                  </div>

                  {/* INTRO AND OBJECTS VIEW */}
                  {previewTab === 'intro' && (
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <span className={`text-[10px] uppercase font-extrabold ${themeColorsSim[appTheme].accentText}`}>Lời tự sự mở đầu</span>
                        <h3 className={`text-lg font-bold ${appBackground === 'neon' ? 'text-slate-100' : 'text-slate-800'}`}>{generatedLesson.lessonTitle}</h3>
                      </div>
                      <p className={`text-xs leading-relaxed whitespace-pre-line ${appBackground === 'neon' ? 'text-slate-300' : 'text-slate-600'}`}>{generatedLesson.introduction}</p>

                      <div className={`p-4 rounded-xl border space-y-2 ${
                        appBackground === 'neon' ? 'bg-slate-900 border-slate-800' : themeColorsSim[appTheme].bgLight
                      }`}>
                        <h4 className={`text-xs font-extrabold uppercase flex items-center gap-1 ${
                          appBackground === 'neon' ? 'text-slate-200' : themeColorsSim[appTheme].accent
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hệ thống chuẩn đầu ra:
                        </h4>
                        <ul className="space-y-2 text-xs">
                          {generatedLesson.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex gap-2">
                              <span className={`font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${themeColorsSim[appTheme].badge}`}>{i + 1}</span>
                              <span className={`font-medium leading-relaxed ${appBackground === 'neon' ? 'text-slate-300' : 'text-slate-700'}`}>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button onClick={() => setPreviewTab('warmup')} className={`w-full py-2 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer ${themeColorsSim[appTheme].primary}`}>
                        Đến Hoạt Động Khởi Động →
                      </button>
                    </div>
                  )}

                  {/* WARM UP VIEW */}
                  {previewTab === 'warmup' && (
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <span className={`text-[10px] uppercase font-extrabold ${themeColorsSim[appTheme].accentText}`}>Khơi nguồn năng lượng</span>
                        <h3 className={`text-base font-bold ${appBackground === 'neon' ? 'text-slate-100' : 'text-slate-800'}`}>{generatedLesson.warmUp.title}</h3>
                      </div>
                      <p className={`text-xs p-3 rounded-lg border leading-relaxed ${
                        appBackground === 'neon' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>{generatedLesson.warmUp.description}</p>
                      
                      <div className={`p-4 rounded-xl border space-y-3 ${
                        appBackground === 'neon' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          appBackground === 'neon' ? 'bg-slate-800 text-slate-300' : themeColorsSim[appTheme].badge
                        }`}>Thử thách khởi động:</span>
                        <p className={`text-xs font-bold ${appBackground === 'neon' ? 'text-slate-200' : 'text-slate-850'}`}>{generatedLesson.warmUp.task}</p>
                        <textarea placeholder="Nhập nhanh vài dòng ý kiến của bạn..." rows={2} id="prev-warm-ta" className={`w-full text-xs p-2 rounded-lg border focus:outline-none focus:ring-1 ${
                          appBackground === 'neon' ? 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-slate-700' : 'bg-white border-slate-200 text-slate-800 focus:ring-slate-300'
                        }`}></textarea>
                        
                        <div className="flex justify-end gap-2">
                          <button onClick={() => alert("🎉 Đã giả lập gửi thành công phản hồi của học sinh.")} className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${themeColorsSim[appTheme].primary}`}>Gửi phản hồi</button>
                        </div>
                      </div>

                      <button onClick={() => setPreviewTab('sections')} className={`w-full py-2 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all cursor-pointer ${themeColorsSim[appTheme].primary}`}>
                        Đến bài đọc Kiến thức →
                      </button>
                    </div>
                  )}

                  {/* CONTENT SECTIONS VIEW */}
                  {previewTab === 'sections' && (
                    <div id="interactive-content-container" className="space-y-5">
                      {/* 2-in-1 Switcher Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Kiến thức bài học
                          </span>
                          <h4 className="text-xs font-bold text-slate-700">Lựa chọn chế độ giảng dạy trực quan:</h4>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* Toggle Mode Button */}
                          <div className="bg-white p-0.5 border rounded-xl flex shadow-sm w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setSlideMode(true)}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                slideMode 
                                  ? 'bg-emerald-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              🖥️ Slide Giảng Dạy
                            </button>
                            <button
                              type="button"
                              onClick={() => setSlideMode(false)}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                !slideMode 
                                  ? 'bg-emerald-600 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              📄 Đọc Tài Liệu
                            </button>
                          </div>

                          {/* Dark/Light theme toggle for slides */}
                          {slideMode && (
                            <button
                              type="button"
                              onClick={() => setSlideTheme(prev => prev === 'light' ? 'dark' : 'light')}
                              className="p-2 border bg-white rounded-xl shadow-sm hover:bg-slate-50 text-xs text-slate-600 transition-all flex items-center justify-center"
                              title="Đổi màu nền Slide"
                            >
                              {slideTheme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
                            </button>
                          )}
                        </div>
                      </div>

                      {slideMode ? (
                        /* PRESENTATION SLIDE MODE (BEAUTIFUL HIGH-FIDELITY BENTO GRID CANVAS) */
                        <div id="preview-slide-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
                          {/* Left Column: Slide Theory card & tight-coupled navigation controls */}
                          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                            {/* Slide Canvas Wrapper with standard aspect-ratio styling */}
                            <div 
                              className={`relative rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-500 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between bg-gradient-to-b ${
                                slideTheme === 'light'
                                  ? [
                                      'from-white via-blue-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                      'from-white via-teal-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                      'from-white via-purple-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                      'from-white via-indigo-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                      'from-white via-emerald-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                      'from-white via-rose-50/20 to-slate-50/40 border-slate-100 text-slate-800 shadow-slate-100',
                                    ][previewSectionIdx % 6]
                                  : [
                                      'from-slate-950 via-slate-900 to-sky-950/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                      'from-slate-950 via-slate-900 to-teal-950/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                      'from-slate-950 via-slate-900 to-purple-950/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                      'from-slate-950 via-slate-900 to-indigo-950/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                      'from-slate-950 via-slate-900 to-emerald-900/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                      'from-slate-950 via-slate-900 to-rose-950/40 border-slate-800 text-slate-100 shadow-slate-950/40',
                                    ][previewSectionIdx % 6]
                              }`}
                            >
                              {/* Background Decorations for High fidelity slide style */}
                              <div className="absolute inset-0 opacity-15 pointer-events-none">
                                <span className={`absolute top-10 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse ${slideTheme === 'light' ? 'bg-emerald-500/10' : 'bg-emerald-400/5'}`}></span>
                                <span className={`absolute bottom-10 right-10 w-48 h-48 rounded-full blur-2xl animate-pulse ${slideTheme === 'light' ? 'bg-teal-500/10' : 'bg-teal-400/5'}`}></span>
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                              </div>

                              {/* Slide Accent Lines & Branding */}
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 z-10"></div>
                              
                              {/* Slide Header Header */}
                              <div className="p-5 sm:p-7 flex justify-between items-center border-b border-opacity-10 border-slate-350 relative z-10">
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${slideTheme === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'} animate-ping`}></span>
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 font-mono">
                                    {generatedLesson.lessonTitle}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-black font-mono border px-2.5 py-1 rounded-full ${
                                  slideTheme === 'light'
                                    ? 'bg-slate-50 border-slate-150 text-slate-600'
                                    : 'bg-slate-800 border-slate-750 text-slate-300'
                                }`}>
                                  SLIDE {String(previewSectionIdx + 1).padStart(2, '0')} / {String(generatedLesson.sections.length).padStart(2, '0')}
                                </span>
                              </div>

                              {/* Slide Body Viewport */}
                              <div className="p-6 sm:p-9 flex-grow flex flex-col justify-center scrollbar-thin overflow-y-auto max-h-[460px] relative z-10">
                                <div className="max-w-3xl mx-auto w-full space-y-4">
                                  <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight font-serif ${
                                    slideTheme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
                                  }`}>
                                    {generatedLesson.sections[previewSectionIdx].title}
                                  </h3>
                                  
                                  <div className="presentation-content">
                                    {renderBentoSlide(generatedLesson.sections[previewSectionIdx].title, generatedLesson.sections[previewSectionIdx].content, previewSectionIdx)}
                                  </div>
                                </div>
                              </div>

                              {/* Slide Footer */}
                              <div className="p-5 sm:p-6 bg-opacity-25 bg-slate-350 border-t border-opacity-10 border-slate-350 flex justify-between items-center text-[10px] font-bold opacity-70">
                                <span>InteractFlow AI v2.0 Interactive Lessons</span>
                                <span className="font-mono">Chế độ thuyết trình lớp học</span>
                              </div>
                            </div>

                            {/* Control Controls Dashboard */}
                            <div className="flex justify-between items-center bg-slate-10/50 border border-slate-200/60 p-3 rounded-2xl gap-3">
                              <button
                                type="button"
                                disabled={previewSectionIdx === 0}
                                onClick={handlePreviewPrevSection}
                                className="px-4 py-2.5 bg-white border border-slate-250 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                ← Slide trước
                              </button>
                              
                              <div className="hidden md:block text-[11px] text-slate-500 font-bold">
                                💡 Nhấn phím mũi tên <kbd className="bg-white border p-1 rounded font-mono shadow-sm">←</kbd> <kbd className="bg-white border p-1 rounded font-mono shadow-sm">→</kbd> để đổi slide.
                              </div>

                              <button
                                type="button"
                                onClick={handlePreviewNextSection}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                              >
                                {previewSectionIdx < generatedLesson.sections.length - 1 ? "Slide tiếp theo →" : "Đến thẻ ôn tập →"}
                              </button>
                            </div>
                          </div>

                          {/* Right Column: Interaction Bento Canvas (Example card & Quick Check card) */}
                          <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between gap-4">
                            {/* Slide Example Box */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex-grow flex flex-col justify-center">
                              <span className="text-[11px] uppercase font-black text-indigo-700 tracking-wider block flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                💡 Ví dụ minh họa thực tiễn:
                              </span>
                              <div className="p-4 rounded-xl border border-indigo-150 bg-slate-50/60 text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                                {generatedLesson.sections[previewSectionIdx].example}
                              </div>
                            </div>

                            {/* Interactive "Check hiểu nhanh" Activity */}
                            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex-grow flex flex-col justify-center">
                              <span className="text-[11px] uppercase font-black text-teal-700 tracking-wider block flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                                ⚡ Hoạt động "Check hiểu nhanh" (Active Recall):
                              </span>

                              <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/20 space-y-3">
                                <p className="text-xs sm:text-sm font-bold text-slate-800">
                                  {generatedLesson.sections[previewSectionIdx].quickCheck.question}
                                </p>

                                <textarea
                                  rows={2}
                                  value={previewQuickCheckAnswers[previewSectionIdx] || ""}
                                  onChange={(e) => {
                                    setPreviewQuickCheckAnswers({
                                      ...previewQuickCheckAnswers,
                                      [previewSectionIdx]: e.target.value
                                    });
                                  }}
                                  placeholder="Nhập phần trả lời lập luận của sinh viên tại đây..."
                                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                                />

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewShowHints({
                                        ...previewShowHints,
                                        [previewSectionIdx]: !previewShowHints[previewSectionIdx]
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-[10px] font-bold rounded-lg transition-all border border-amber-200 cursor-pointer"
                                  >
                                    {previewShowHints[previewSectionIdx] ? "💡 Ẩn gợi ý" : "💡 Xem gợi ý tư duy"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewShowModelAnswer({
                                        ...previewShowModelAnswer,
                                        [previewSectionIdx]: !previewShowModelAnswer[previewSectionIdx]
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg transition-all border border-emerald-200 cursor-pointer"
                                  >
                                    {previewShowModelAnswer[previewSectionIdx] ? "🎓 Ẩn đề xuất" : "🎓 Đối chiếu đề xuất"}
                                  </button>
                                </div>

                                {previewShowHints[previewSectionIdx] && (
                                  <div className="p-3 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl text-xs leading-relaxed animate-fade-in font-semibold mt-2">
                                    💡 <strong>Gợi ý:</strong> {generatedLesson.sections[previewSectionIdx].quickCheck.hint}
                                  </div>
                                )}

                                {previewShowModelAnswer[previewSectionIdx] && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-xl text-xs leading-relaxed animate-fade-in mt-2 font-semibold">
                                    🎓 <strong>Mô tả giải pháp mẫu:</strong> {generatedLesson.sections[previewSectionIdx].quickCheck.suggestedAnswer}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* CLASSIC LONG DOCUMENT VIEW (WITH DOCK INTERACTIVITIES INTEGRATED) */
                        <div className="space-y-6 animate-fade-in">
                          {/* Main Text Content */}
                          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b pb-3">
                              <div>
                                <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">Trang học liệu chính</span>
                                <h3 className="text-base font-bold text-emerald-800">{generatedLesson.sections[previewSectionIdx].title}</h3>
                              </div>
                              <span className="text-xs bg-slate-100 py-1.5 px-3.5 font-extrabold rounded-full text-slate-650">Phần {previewSectionIdx + 1} / {generatedLesson.sections.length}</span>
                            </div>

                            <div className="prose-sm text-slate-700 leading-relaxed p-1">
                              {renderMarkdown(generatedLesson.sections[previewSectionIdx].content)}
                            </div>

                            {/* Floating Interactivities side-by-side inside document mode */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                              {/* Example Board */}
                              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
                                <span className="text-[10px] uppercase font-bold text-indigo-700 block flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                  💡 Ví dụ minh họa thực tiễn:
                                </span>
                                <p className="text-xs text-slate-600 font-semibold leading-relaxed select-text">
                                  {generatedLesson.sections[previewSectionIdx].example}
                                </p>
                              </div>

                              {/* Active Recall Board */}
                              <div className="bg-teal-50/10 border border-teal-150 p-4 rounded-2xl space-y-3">
                                <span className="text-[10px] uppercase font-bold text-teal-700 block flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                                  ⚡ Câu hỏi Check Hiểu Nhanh:
                                </span>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                  {generatedLesson.sections[previewSectionIdx].quickCheck.question}
                                </p>

                                <textarea
                                  rows={2}
                                  value={previewQuickCheckAnswers[previewSectionIdx] || ""}
                                  onChange={(e) => {
                                    setPreviewQuickCheckAnswers({
                                      ...previewQuickCheckAnswers,
                                      [previewSectionIdx]: e.target.value
                                    });
                                  }}
                                  placeholder="Nhập phần trả lời lập luận của sinh viên tại đây..."
                                  className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white shadow-sm"
                                />
                              </div>
                            </div>

                            {/* Bottom buttons inside the document mode paper sheet */}
                            <div className="flex justify-between items-center pt-4 border-t gap-2 mt-4">
                              <button
                                type="button"
                                disabled={previewSectionIdx === 0}
                                onClick={handlePreviewPrevSection}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                ← Phần trước
                              </button>
                              <button
                                type="button"
                                onClick={handlePreviewNextSection}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                              >
                                {previewSectionIdx < generatedLesson.sections.length - 1 ? "Phần tiếp theo →" : "Đến thẻ ôn tập →"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FLASHCARDS INTERVIEW TESTING */}
                  {previewTab === 'flashcards' && (
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <span className="text-[10px] uppercase font-extrabold text-pink-600 font-bold">Thử sức rèn luyện phản ứng nhanh</span>
                        <h3 className="text-base font-bold text-slate-800">Thẻ Ghi Nhớ Từng Bước</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Nhấp vào thẻ để kiểm định nghĩa.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                        {generatedLesson.flashcards.map((card, idx) => {
                          const isFlipped = previewFlippedFlashcards[idx] || false;
                          return (
                            <div
                              key={idx}
                              onClick={() => setPreviewFlippedFlashcards(prev => ({ ...prev, [idx]: !isFlipped }))}
                              className="group cursor-pointer perspective-1000 h-40 w-full hover:scale-[1.01] transition-transform duration-300"
                            >
                              <div
                                className={`relative h-full w-full transform-style-3d transition-transform duration-500 rounded-2xl shadow-sm border border-slate-200/80 ${isFlipped ? 'rotate-y-180' : ''}`}
                              >
                                {/* Front Side */}
                                <div className="absolute backface-hidden w-full h-full p-4 bg-white flex flex-col justify-between rounded-2xl">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">Thuật ngữ ${idx + 1}</span>
                                    <span className="text-slate-400 font-medium text-[9px] flex items-center gap-0.5">🔍 Click để lật</span>
                                  </div>
                                  <div className="text-center font-bold text-xs sm:text-sm text-slate-800 px-2 py-3">
                                    {card.front}
                                  </div>
                                  <div className="text-right text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                                    INTERACTFLOW CORE
                                  </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute backface-hidden rotate-y-180 w-full h-full p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100 flex flex-col justify-between rounded-2xl shadow-inner shadow-slate-950 border border-indigo-500/10">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md">Định nghĩa chi tiết</span>
                                    <span className="text-slate-450 font-medium text-[9px]">↩️ Click để quay lại</span>
                                  </div>
                                  <div className="text-xs sm:text-xs font-semibold leading-relaxed text-slate-200 overflow-y-auto px-1 scrollbar-thin max-h-[80px]">
                                    {card.back}
                                  </div>
                                  <div className="text-right text-[8px] text-emerald-400/80 font-semibold uppercase tracking-wider">
                                    Kiến thức vững vàng
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button onClick={() => setPreviewTab('quiz')} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer">
                        Đến Trắc Nghiệm Tự Đánh Giá →
                      </button>
                    </div>
                  )}

                  {/* INTERACTIVE QUIZ TESTING PLAY */}
                  {previewTab === 'quiz' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold text-emerald-600">Hệ thống bài kiểm tra</span>
                          <h3 className="text-base font-bold text-slate-800">Quiz Trắc Nghiệm ({Object.keys(previewQuizAnswers).length}/5)</h3>
                        </div>
                        {Object.keys(previewQuizAnswers).length === 5 && (
                          <span className="text-xs bg-emerald-55 text-emerald-75 font-black px-2.5 py-1 rounded">Điểm: {previewQuizScore} / 5</span>
                        )}
                      </div>

                      <div className="space-y-6">
                        {generatedLesson.quizQuestions.map((q, qIdx) => {
                          const chosen = previewQuizAnswers[qIdx];
                          const isIncorrect = chosen && chosen !== q.correctAnswer;
                          const hasAnswered = chosen !== undefined;

                          return (
                            <div key={qIdx} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                              <p className="font-semibold text-xs text-slate-700 flex gap-2">
                                <span className="font-black bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">C{qIdx+1}</span>
                                <span>{q.question}</span>
                              </p>

                              <div className="grid grid-cols-1 gap-2 pl-7">
                                {q.options.map((opt) => {
                                  const letter = opt.substring(0, 1);
                                  const isSelected = chosen === letter;
                                  const isCorrectOption = letter === q.correctAnswer;

                                  let buttonStyles = "border border-slate-200 hover:bg-slate-50 hover:border-blue-400 hover:scale-[1.01] shadow-sm";
                                  let sphereStyles = "bg-slate-100 text-slate-700";

                                  if (hasAnswered) {
                                    if (isCorrectOption) {
                                      buttonStyles = "bg-emerald-500/10 border-emerald-500 text-emerald-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.01]";
                                      sphereStyles = "bg-gradient-to-br from-emerald-500 to-teal-600 text-white";
                                    } else if (isSelected) {
                                      buttonStyles = "bg-rose-500/10 border-rose-500 text-rose-950 font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.01]";
                                      sphereStyles = "bg-gradient-to-br from-rose-500 to-pink-600 text-white";
                                    } else {
                                      buttonStyles = "opacity-40 scale-[0.98] blur-[0.2px] cursor-not-allowed";
                                      sphereStyles = "bg-slate-100 text-slate-400";
                                    }
                                  }

                                  return (
                                    <button
                                      key={opt}
                                      disabled={hasAnswered}
                                      onClick={() => handlePreviewSelectOption(qIdx, letter, q.correctAnswer)}
                                      className={`p-3 rounded-xl text-xs text-left flex items-center transition-all duration-300 ${buttonStyles}`}
                                    >
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] mr-3 flex-shrink-0 font-bold transition-all ${sphereStyles}`}>
                                        {hasAnswered && isCorrectOption ? "✓" : hasAnswered && isSelected ? "✗" : letter}
                                      </span>
                                      <span>{opt.substring(3)}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {hasAnswered && (
                                <div className="mt-2 pl-7">
                                  <div className="p-3 bg-emerald-50 rounded-lg text-[11px] text-slate-600 leading-relaxed">
                                    <strong className="text-emerald-800 block mb-0.5">💡 Giải đáp:</strong>
                                    {q.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {Object.keys(previewQuizAnswers).length === 5 && (
                        <div className="p-4 bg-slate-50 rounded-xl space-y-2 border text-center">
                          <p className="text-xs font-bold text-slate-700">Ghi nhận hoàn tất bộ quiz thử nghiệm!</p>
                          <button onClick={handlePreviewResetQuiz} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-350 text-slate-700 text-[10px] font-black rounded transition-all">Làm lại quiz</button>
                        </div>
                      )}

                      <button onClick={() => setPreviewTab('casestudy')} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer">
                        Đến Nghiên Cứu Tình Huống →
                      </button>
                    </div>
                  )}

                  {/* CASE STUDY VIEW */}
                  {previewTab === 'casestudy' && (
                    <div className="space-y-5">
                      <div className="border-b pb-2">
                        <span className="text-[10px] uppercase font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded animate-fade-in font-bold">Nghiên cứu tình huống ứng dụng (Thang Bloom 3 mức)</span>
                        <h3 className="text-base font-bold text-slate-800 mt-1">{generatedLesson.caseStudy.title}</h3>
                      </div>

                      <div className="bg-slate-100 p-4 border rounded-2xl">
                        <span className="text-[10px] bg-slate-200 text-slate-650 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Tình tế đặt ra & Bối cảnh:</span>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2.5 whitespace-pre-wrap">{generatedLesson.caseStudy.context}</p>
                      </div>

                      {/* Render the 3 Worksheets Tasks */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase text-indigo-700 tracking-wider">📝 Thử thách tình huống tích chuỗi Bloom:</h4>
                        {generatedLesson.caseStudy.tasks.map((task, tIdx) => {
                          const levelColors = {
                            'Nhớ/Hiểu': 'bg-sky-50 text-sky-700 border-sky-200',
                            'Phân tích/Vận dụng': 'bg-amber-50 text-amber-700 border-amber-200',
                            'Đề xuất/Sáng tạo': 'bg-purple-50 text-purple-700 border-purple-200',
                          };
                          const colorClass = levelColors[task.bloomLevel] || 'bg-slate-100 text-slate-710';
                          return (
                            <div key={tIdx} className="p-4 border rounded-2xl bg-white shadow-sm space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black font-serif text-slate-805">Nhiệm vụ {tIdx + 1}:</span>
                                <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 border rounded-full ${colorClass}`}>
                                  {task.bloomLevel}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                {task.question}
                              </p>
                              
                              <textarea
                                rows={2}
                                value={previewCaseStudyAnswers[tIdx] || ""}
                                onChange={(e) => {
                                  setPreviewCaseStudyAnswers({
                                    ...previewCaseStudyAnswers,
                                    [tIdx]: e.target.value
                                  });
                                }}
                                placeholder="Nhập phần trả lời phân tích của sinh viên..."
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 shadow-inner"
                              />

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewShowCaseHint({
                                      ...previewShowCaseHint,
                                      [tIdx]: !previewShowCaseHint[tIdx]
                                    });
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 shadow-sm cursor-pointer"
                                >
                                  {previewShowCaseHint[tIdx] ? "Ẩn gợi ý" : "Xem gợi mở"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewShowCaseModel({
                                      ...previewShowCaseModel,
                                      [tIdx]: !previewShowCaseModel[tIdx]
                                    });
                                  }}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-805 text-[10px] font-bold rounded-lg border border-indigo-205 shadow-sm cursor-pointer"
                                >
                                  {previewShowCaseModel[tIdx] ? "Ẩn đáp án mẫu" : "Đối chiếu Phản hồi Thầy cô"}
                                </button>
                              </div>

                              {previewShowCaseHint[tIdx] && (
                                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-655 rounded-xl text-xs leading-relaxed animate-fade-in font-medium">
                                  💡 <strong>Gợi ý hướng đi:</strong> {task.hint}
                                </div>
                              )}

                              {previewShowCaseModel[tIdx] && (
                                <div className="p-3 bg-indigo-50/50 border border-indigo-100 text-indigo-950 rounded-xl text-xs leading-relaxed animate-fade-in">
                                  🎓 <strong>Định hướng đáp án giảng viên:</strong> {task.suggestedAnswer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Rubrics Card */}
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-600 block flex items-center gap-1.5 mb-1 animate-fade-in">
                          📊 Thang đo chấm điểm mẫu (Rubric đánh giá):
                        </span>
                        <ul className="space-y-1.5">
                          {generatedLesson.caseStudy.rubric.map((rub, rIdx) => (
                            <li key={rIdx} className="text-xs text-slate-605 leading-relaxed flex items-start gap-1.5 font-semibold">
                              <span className="text-emerald-500 font-bold">✔</span> <span>{rub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button onClick={() => setPreviewTab('reflection')} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-md">
                        Đến viết Phản hồi Thu hoạch →
                      </button>
                    </div>
                  )}

                  {/* STUDENT STUDY REFLECTIONS & TEXT DOWNLOADS */}
                  {previewTab === 'reflection' && (
                    <div className="space-y-5">
                      <div className="border-b pb-2">
                        <span className="text-[10px] uppercase font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Báo cáo khảo dượt</span>
                        <h3 className="text-base font-bold text-slate-800">Câu Hỏi Suy Ngẫm Cá Nhân</h3>
                        <p className="text-[10px] text-slate-400 mt-1">Học sinh soạn phản phản biện để xuất bài nộp.</p>
                      </div>

                      <div className="p-4 bg-slate-100 rounded-xl space-y-3 border">
                        <span className="text-xs font-black text-slate-600 block border-b pb-1">👤 Thiết lập Hồ sơ Học sinh nộp bài:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Học tên học sinh:</label>
                            <input
                              type="text"
                              value={previewStudentName}
                              onChange={(e) => setPreviewStudentName(e.target.value)}
                              placeholder="Họ tên học sinh..."
                              className="w-full bg-white text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Mã số học sinh:</label>
                            <input
                              type="text"
                              value={previewStudentId}
                              onChange={(e) => setPreviewStudentId(e.target.value)}
                              placeholder="Học sinh ID..."
                              className="w-full bg-white text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold shadow-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 block">Lớp học rèn luyện:</label>
                            <input
                              type="text"
                              value={previewStudentClass}
                              onChange={(e) => setPreviewStudentClass(e.target.value)}
                              placeholder="Ví dụ: K68-CNTT..."
                              className="w-full bg-white text-xs p-2 rounded border focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {generatedLesson.reflectionQuestions.map((q, idx) => (
                          <div key={idx} className="space-y-2">
                            <span className="text-xs font-bold text-slate-800 leading-relaxed block">{idx+1}. {q}</span>
                            <textarea
                              rows={2}
                              value={previewStudentResponses[idx]}
                              onChange={(e) => {
                                const copy = [...previewStudentResponses];
                                copy[idx] = e.target.value;
                                setPreviewStudentResponses(copy);
                              }}
                              placeholder="Nhập câu trả lời riêng của bạn..."
                              className="w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            ></textarea>
                          </div>
                        ))}
                      </div>

                      {showNotification && (
                        <div className="bg-slate-950 text-white text-[10px] py-1.5 px-3 rounded text-center animate-fade-in">
                          💾 Giả lập thành công: Đã lưu nháp dữ liệu vào Trình duyệt!
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button onClick={handleSaveDraftLocal} className="w-1/2 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer">Lưu nháp cục bộ</button>
                          <button onClick={handleDownloadStudentReport} className="w-1/2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer">Tải tệp nộp bài (.txt)</button>
                        </div>
                        <button 
                          onClick={handleSubmitAndRecordLesson}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xs font-black rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-indigo-300" /> Nộp bài học & Ghi nhận kết quả
                        </button>
                      </div>


                      {/* Summary display */}
                      <div className="bg-gradient-to-br from-slate-850 to-slate-900 text-slate-100 p-4 rounded-xl space-y-2 shadow-inner">
                        <span className="text-xs font-serif font-black text-emerald-400 block border-b border-slate-700 pb-1">🏁 Tóm tắt đọng lại:</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">{generatedLesson.summary}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ACTIVE PREVIEW TAB 2: DOWNLOADS / COPY SOURCE CODE CONTAINER */}
          {generatedLesson && activeTab === 'html-code' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex-grow flex flex-col justify-between space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600">Mã nguồn bài học tương tác (.html)</span>
                <h3 className="text-xl font-bold text-slate-800 font-serif mt-1">Xuất bản lên hệ thống LMS / Chia sẻ Sinh viên</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tệp tin mã HTML này hoạt động độc lập không cần hosting hay cài đặt phức tạp. Thầy cô chỉ cần nộp vào Hệ thống quản lý Moodle/Canvas của trường hoặc đính kèm trực tiếp gửi qua Zalo/Email cho lớp học tự rèn luyện định nghĩa & trắc nghiệm.
                </p>
              </div>

              {/* Code visual rendering box */}
              <div className="flex-grow flex flex-col min-h-[300px]">
                <div className="bg-slate-900 rounded-t-xl py-2 px-4 flex justify-between items-center text-xs text-slate-400 border-b border-slate-800">
                  <span className="font-bold">📄 single_file_interactive_lesson.html</span>
                  <div className="flex gap-2">
                    <span className="text-emerald-500">✔ CSS gọn gàng</span>
                    <span className="text-emerald-500">✔ JS đi kèm</span>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={compileStudentHTML(generatedLesson)}
                  className="w-full flex-grow text-[10px] font-mono bg-slate-950 text-slate-200 p-4 focus:outline-none rounded-b-xl border-t-0 border-slate-850 min-h-[350px] leading-relaxed resize-none scrollbar-thin"
                />
              </div>

              {/* Download controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 border rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Tên file chuẩn chuẩn hóa không dấu:</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tải file bài học về bộ nhớ máy tính thầy cô.</p>
                </div>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    id="btn-source-copy"
                    onClick={handleCopyCode}
                    className="w-1/2 sm:w-auto px-5 py-3 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-fade-in"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Đã sao chép mã
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép mã nguồn
                      </>
                    )}
                  </button>
                  <button
                    id="btn-source-dl"
                    onClick={handleDownloadFile}
                    className="w-1/2 sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md space-x-1.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> 
                    <span>Tải xuống tệp .html</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* Decorative and informative academic footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-slate-500 text-xs shadow-inner">
        <p className="font-semibold text-slate-600">Giáo án Active Learning trực quan - tương tác - giải pháp đột phá. Xây dựng phù hợp với bối cảnh giáo dục thời đại số 4.0.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          InteractFlow AI v2.0 made by <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse">Kinh tế số TLU</span>
        </p>
      </footer>

      {/* Dynamic Statistics Dashboard Modal popup */}
      <StatsDashboardModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        currentLessonTitle={generatedLesson?.lessonTitle || title || "Khái niệm Lạm phát & Thất nghiệp trong Kinh tế Vĩ mô"}
        triggerRefreshStamp={statsRefreshStamp}
      />

    </div>
  );
}

