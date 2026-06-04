import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

function parseRobustJson(text: string): any {
  if (!text) return {};
  
  let cleaned = text.trim();
  
  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Continue with robustness cleaning
  }

  // Remove markdown tags if present
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to extract first block matches between '{' and '}'
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Continue
    }
  }

    console.error("Failed to parse JSON string of length:", text.length);
  console.error("Incorrect JSON content starts with:", text.substring(0, 300));
  throw new Error(`Dữ liệu bài giảng trả về từ AI không ở dạng cấu trúc JSON hợp lệ. Thử lại sau ít phút hoặc tinh chỉnh dán nội dung thô trực tiếp.`);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Serve static assets or use body-parser with elevated limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper to dynamically get Gemini client either from headers or env
  const getAiClient = (req: express.Request) => {
    let key = (req.headers["x-gemini-key"] as string) || 
              (req.headers["authorization"]?.toString().replace("Bearer ", "")) || 
              process.env.GEMINI_API_KEY || 
              "";
    key = key.trim();
    return {
      client: key ? new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      }) : null,
      key
    };
  };

  // Helper to run content generation with model fallback for restricted/free-tier keys
  const robustGenerateContent = async (ai: any, params: any, customModel?: string) => {
    const modelsToTry: string[] = [];
    if (customModel && customModel.trim()) {
      modelsToTry.push(customModel.trim());
    }
    const standardFallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const m of standardFallbackModels) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }

    // Format contents parameter correctly for the new @google/genai SDK structure
    const finalParams = { ...params };
    const rawContents = finalParams.contents;
    if (rawContents) {
      if (Array.isArray(rawContents)) {
        // If it's an array, check if the items are Parts instead of Content objects.
        // A Content object usually has a 'parts' array or a specific structure.
        // If elements are Part objects (possess text or inlineData), wrap them into a single Content object { parts: rawContents }
        const isArrayOfParts = rawContents.length > 0 && 
                               (!rawContents[0].parts && (rawContents[0].text !== undefined || rawContents[0].inlineData !== undefined));
        if (isArrayOfParts) {
          finalParams.contents = { parts: rawContents };
        }
      } else if (typeof rawContents === "object" && !rawContents.parts && (rawContents.text !== undefined || rawContents.inlineData !== undefined)) {
        // If a single Part is passed directly, map it to Content
        finalParams.contents = { parts: [rawContents] };
      }
    }
    
    let lastError: any = null;
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`[robustGenerateContent] Attempting generation with model: ${modelName}`);
        const response = await ai.models.generateContent({
          ...finalParams,
          model: modelName
        });
        console.log(`[robustGenerateContent] Success with model: ${modelName}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[robustGenerateContent] Model ${modelName} failed. Error:`, errMsg);
      }
    }
    throw lastError;
  };

  // API Route to analyze uploaded files and extract lesson general configuration
  app.post("/api/analyze-metadata", async (req, res) => {
    try {
      const { file, model } = req.body;

      if (!file || !file.data || !file.mimeType) {
        return res.status(400).json({ error: "Thiếu dữ liệu tệp tin để phân tích" });
      }

      const { client: ai, key } = getAiClient(req);

      if (!key || !ai) {
        return res.status(500).json({
          error: "Hiện tại hệ thống chưa nhận được GEMINI_API_KEY. Vui lòng thiết lập khóa API trong UI hoặc trong Settings > Secrets."
        });
      }

      const contents = [];

      if (file && file.data && file.mimeType) {
        contents.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      }

      contents.push({
        text: `Bạn là trợ lý thiết kế giáo án số cao cấp hỗ trợ các nhà Sư phạm đại học Việt Nam. Hãy đọc kỹ tài liệu đính kèm này (PDF/PowerPoint/Word/Text) và phân tích tìm ra các giá trị để tự động cấu hình lại thông tin đại cương bài học hôm nay.
Hãy phản hồi CHÍNH XÁC một cấu trúc JSON sau đây phù hợp nhất với tài liệu được tải lên để tự động điều chỉnh cấu hình:
{
  "title": "Tiêu đề bài học hay, súc tích và bám rõ nhất vào nội dung cốt lõi của tài liệu tải lên (Ví dụ: 'Cấu trúc mảng trong C++' thay vì chỉ 'Mảng')",
  "subject": "Tên môn học hoặc lĩnh vực học thuật tổng quát bao quát tài liệu tương thích nhất",
  "level": "Trình độ sinh viên đề xuất của môn học này. Phải khớp chính xác với 1 trong các chuỗi sau đây: 'Sinh viên Năm 1-2' hoặc 'Sinh viên Năm 3-4' hoặc 'Giảng viên & Học viên Cao học' hoặc 'Phát triển năng lực nghề nghiệp'",
  "duration": "Thời lượng tự học đề xuất ước tính bằng phút. Phải khớp chính xác với 1 trong các chuỗi sau đây: '30 phút', '45 phút', '60 phút', '90 phút' hoặc tự chọn phù hợp",
  "objectives": "Các mục tiêu học tập bám sát thang đo Bloom sư phạm xuất sắc (mỗi mục tiêu viết gạch đầu dòng dòng mới, có từ 2-3 gạch đầu dòng dòng mới, viết thật chi tiết và chuyên nghiệp)",
  "sections": ["Danh sách chứa từ 3 đến 6 tiêu đề chương, tiểu mục nhỏ hoặc slide có học liệu chi tiết thực tế tìm thấy trong tài liệu để giảng viên có thể click chọn dạy trong ngày (Ví dụ: 'Phần 3.2: Quy trình...', 'Chương 2:...'). Trích xuất trực tiếp từ các tiêu đề hiển thị trong file."]
}`
      });

      const response = await robustGenerateContent(ai, {
        contents: contents,
        config: {
          systemInstruction: "Bạn là một học giả, giảng viên đại học xuất sắc, phân tích sâu các đề cương tài liệu học tập của Việt Nam để chuyển thành metadata đại cương trực tuyến dưới dạng JSON hợp lệ hoàn toàn.",
          temperature: 0.4,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              level: { type: Type.STRING },
              duration: { type: Type.STRING },
              objectives: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "subject", "level", "duration", "objectives", "sections"]
          }
        }
      }, model);

      const meta = parseRobustJson(response.text || "{}");
      res.json(meta);
    } catch (error: any) {
      const errMsg = (error && error.message) ? error.message : String(error);
      const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      
      if (isQuota) {
        console.warn("Analyze Metadata Quota Warn: Gemini free rate limit reached. Returning fallback schema.");
        res.json({
          fallback: true,
          errorType: "QUOTA_EXCEEDED",
          title: "",
          subject: "",
          level: "Sinh viên Năm 1-2",
          duration: "45 phút",
          objectives: "- Học tập nội dung trong văn bản đính kèm\n- Củng cố lý thuyết và thực hành phân tích",
          sections: []
        });
      } else {
        console.warn("Analyze Metadata Warning:", errMsg);
        res.status(500).json({ error: errMsg || "Không thể phân tích dữ liệu tệp tin. Vui lòng kiểm tra lại." });
      }
    }
  });

  // API Route to generate image prompt based on slide content using Gemini
  app.post("/api/generate-image-prompt", async (req, res) => {
    try {
      const { slideTitle, slideContent, model } = req.body;
      if (!slideTitle) {
        return res.status(400).json({ error: "Thiếu tiêu đề slide để tạo prompt" });
      }

      const { client: ai, key } = getAiClient(req);

      if (!key || !ai) {
        return res.status(500).json({
          error: "Hiện tại hệ thống chưa nhận được GEMINI_API_KEY. Vui lòng thiết lập khóa API trong UI hoặc trong Settings > Secrets."
        });
      }

      const response = await robustGenerateContent(ai, {
        contents: [
          {
            text: `Bạn là giám đốc sáng tạo mỹ thuật học tập trực thuộc ban đổi mới sư phạm số. Hãy tạo ra một câu prompt chi tiết bằng tiếng Anh (khoảng 20-30 từ) để từ đó khởi tạo một hình vẽ minh họa tuyệt đẹp, bám sát nội dung học của slide này.
Thông tin slide:
- Tiêu đề (Title): ${slideTitle}
- Chi tiết bài đọc (Content): ${slideContent || ""}

Hướng dẫn phối cảnh mỹ thuật:
- Có thể dùng định dạng: "A clean minimalist flat vector illustration representing [topic], 3d isometric style, corporate web design, vibrant colors, white background".
- Nếu là slide kỹ thuật/quy trình, có thể chọn: "A high quality block diagram flow of [topic], schematic view, clean blueprint layout, modern scientific look".
- Chỉ trả ra một dòng prompt duy nhất bằng Tiếng Anh để nạp trực tiếp cho AI sinh ảnh. Tuyệt đối không bọc trong dấu nháy kép, không chứa mã markdown (như \`\`\`), không có bất cứ lời mở đầu hay giải thích tiếng Việt nào khác.`
          }
        ],
        config: {
          temperature: 0.7,
        }
      }, model);

      const prompt = (response.text || "").replace(/^["'`]|["'`]$/g, "").trim();
      res.json({ prompt });
    } catch (error: any) {
      console.warn("Generate Image Prompt Error:", error);
      res.status(500).json({ error: error.message || "Không thể khởi tạo gợi ý định hình ảnh." });
    }
  });

  // API Route
  app.post("/api/generate-lesson", async (req, res) => {
    try {
      const { title, subject, level, duration, content, objectives, interactions, file, selectedSection, model } = req.body;

      if (!content && (!file || !file.data)) {
        return res.status(400).json({ error: "Vui lòng nhập nội dung bài giảng viết tay hoặc tải tệp tài liệu lên (PDF, PPT, Word...)." });
      }

      const { client: ai, key } = getAiClient(req);

      if (!key || !ai) {
        return res.status(500).json({
          error: "Hiện tại hệ thống chưa nhận được GEMINI_API_KEY. Vui lòng thiết lập khóa API trong UI hoặc trong Settings > Secrets."
        });
      }

      let contents: any[] = [];

      // If they uploaded a syllabus/slide file, pass it as a document part
      if (file && file.data && file.mimeType) {
        contents.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      }

      const promptText = `
Bạn là một chuyên gia thiết kế bài giảng sư phạm đại học lỗi lạc của Việt Nam. Hãy chuyển đổi nội dung bài giảng dưới đây thành một giáo án bài giảng số tương tác chất lượng cao, chia nhỏ theo cấu trúc slide và hỗ trợ hoạt hóa tư duy của sinh viên đại học môn học này. 
Bài học phải được hành văn hoàn toàn bằng tiếng Việt với văn phong sư phạm truyền cảm hứng, chuẩn mực học thuật, sâu sắc nhưng dễ tiếp thu và có tính thực tế cao.

${file ? `QUAN TRỌNG: Bạn đã có mục tiêu học tập là đọc và bám sát tài liệu đính kèm (PDF/PPT/Word) ở trên để trích xuất nội dung bài giảng, các chương sách, slide giảng dạy chính thức. Hãy phân tích kỹ tài liệu này.
${selectedSection ? `LƯU Ý ĐẶC BIỆT CỰC KỲ QUAN TRỌNG: Giảng viên yêu cầu bạn CHỈ tập trung sâu sắc và trích xuất nội dung bài học tương tác hôm nay xoay quanh phần: "${selectedSection}" trong tài liệu đính kèm. Hãy phớt lờ các phần không liên quan khác trong tài liệu để thiết kế mục tiêu học tập bám sát hoàn hảo mục tiêu dạy học của phần này.` : "Hãy phân tích toàn văn tài liệu đã nạp."}` : ""}

Thông tin thiết lập bởi Giảng viên:
- Tiêu đề dự kiến: ${title || (file ? "Trích xuất tiêu đề hay bám sát tài liệu đính kèm" : "Chưa thiết lập")}
- Môn học / Lĩnh vực: ${subject || (file ? "Tự động trích xuất môn học thích hợp" : "Phát triển bản thân / Chuyên ngành")}
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
6. "quizQuestions": Từ 5 đến 10 câu hỏi trắc nghiệm kiểm định kiến thức tùy vào lượng thông tin tài liệu. Phân bổ các câu hỏi đều đặn theo 3 cấp độ Bloom tăng dần:
   - Cấp độ "Nhớ/Hiểu" (Nhận diện khái niệm, định nghĩa gốc).
   - Cấp độ "Vận dụng" (Giải quyết tình huống, bối cảnh bài tập thực tế ngắn).
   - Cấp độ "Ra quyết định" (Phân tích thông tin để lựa chọn phương án giải quyết tối ưu hoặc quyết định quản trị phù hợp).
   Mỗi câu hỏi có:
   - "id": Số thứ tự câu hỏi (từ 1 đến 10).
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
10. "flashcards": Từ 5-10 flashcard ghi nhớ nhanh thuật ngữ khoa học khó tùy thuộc độ dài kiến thức (mỗi thẻ có front là tên thuật ngữ, back là định nghĩa cô đọng dưới 40 từ).

Đảm bảo cấu trúc JSON hợp lệ hoàn toàn, không bị khuyết thiếu hay lỗi dấu phẩy. Mọi nội dung hiển thị đều bằng tiếng Việt chuẩn mực sư phạm cao cấp.
`;

      contents.push({ text: promptText });

      const response = await robustGenerateContent(ai, {
        contents: contents,
        config: {
          systemInstruction: "Bạn là một học giả và chuyên gia sư phạm đại học xuất sắc bậc nhất tại Việt Nam, sở hữu tư duy thiết kế bài giảng số tích cực chuẩn quốc tế, giúp sinh viên có trải nghiệm học tập đỉnh cao.",
          temperature: 0.6,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lessonTitle: { type: Type.STRING },
              introduction: { type: Type.STRING },
              learningObjectives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Danh sách đúng 3 mục tiêu học tập theo Bloom"
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Nội dung lý thuyết cực kỳ súc tích dưới dạng các gạch đầu dòng rõ ràng, ví dụ: '- **Tiêu đề ý 1**: Phần diễn giải ngắn dưới 20 từ.' Tuyệt đối không viết thành đoạn văn dài dòng không phân điểm." },
                    example: { type: Type.STRING, description: "1 ví dụ thực tế sinh động minh họa độc lập cho slide này." },
                    quickCheck: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        hint: { type: Type.STRING },
                        suggestedAnswer: { type: Type.STRING }
                      },
                      required: ["question", "hint", "suggestedAnswer"]
                    },
                    lecturerNotes: { type: Type.STRING, description: "Bí quyết sư phạm riêng tư dành cho giảng viên dạy slide này." }
                  },
                  required: ["title", "content", "example", "quickCheck", "lecturerNotes"]
                },
                description: "Danh sách từ 4 đến 12 slide lý thuyết ngắn gọn tích hợp bám sát vào tài liệu."
              },
              warmUp: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  task: { type: Type.STRING }
                },
                required: ["title", "description", "task"]
              },
              quizQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.STRING, description: "Chữ cái hoa đáp án đúng: A, B, C, hoặc D" },
                    explanation: { type: Type.STRING },
                    bloomLevel: { type: Type.STRING, description: "Cấp độ hành vi Bloom: 'Nhớ/Hiểu', 'Vận dụng', 'Ra quyết định'" }
                  },
                  required: ["id", "question", "options", "correctAnswer", "explanation", "bloomLevel"]
                },
                description: "Đúng 5 câu hỏi trắc nghiệm tương tác"
              },
              caseStudy: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  context: { type: Type.STRING, description: "Bối cảnh tình huống thực tiễn kinh tế xã hội phong phú." },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        bloomLevel: { type: Type.STRING, description: "Có 3 cấp: 'Nhớ/Hiểu', 'Phân tích/Vận dụng', 'Đề xuất/Sáng tạo'" },
                        question: { type: Type.STRING },
                        hint: { type: Type.STRING },
                        suggestedAnswer: { type: Type.STRING }
                      },
                      required: ["bloomLevel", "question", "hint", "suggestedAnswer"]
                    },
                    description: "Đúng 3 nhiệm vụ worksheet từ dễ đến khó."
                  },
                  rubric: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-4 tiêu chí chấm điểm và hướng dẫn đánh giá."
                  }
                },
                required: ["title", "context", "tasks", "rubric"]
              },
              reflectionQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Đúng 3 câu hỏi suy ngẫm sâu liên hệ thực tiễn."
              },
              summary: { type: Type.STRING, description: "Tóm tắt đọng lại giá trị." },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
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
        }
      }, model);

      const lessonJson = parseRobustJson(response.text || "{}");
      res.json(lessonJson);
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ error: error.message || "Không thể khởi tạo nội dung khóa học thông qua AI. Vui lòng kiểm tra API Key hoặc nội dung bài giảng của bạn." });
    }
  });

// Set up Vite or static asset serving on development (when NOT running on Vercel)
async function initServerAndListen() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("[initServerAndListen] Failed to dynamically load and set up Vite:", e);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen on 3000 if not on Vercel (Cloud Run/Workspace/local needs this)
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

initServerAndListen().catch((err) => {
  console.error("Failed to initialize server/Vite middleware:", err);
});

export default app;
