export interface PresetSample {
  title: string;
  subject: string;
  level: string;
  duration: string;
  objectives: string;
  content: string;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    title: "Khái niệm Lạm phát & Thất nghiệp trong Kinh tế Vĩ mô",
    subject: "Kinh tế học vĩ mô",
    level: "Sinh viên Đại học năm 1 - 2",
    duration: "45 phút",
    objectives: "- Định nghĩa được lạm phát, thất nghiệp và các chỉ số đo lường liên quan.\n- Phân tích được mối quan hệ đánh đổi ngắn hạn giữa lạm phát và thất nghiệp thông qua đường cong Phillips.\n- Đề xuất được các biện pháp kiểm soát từ góc độ chính sách vĩ mô.",
    content: "Lạm phát và thất nghiệp là hai vấn đề vĩ mô hàng đầu mà mọi quốc gia đều phải đối mặt. \n\nLạm phát (Inflation) là sự tăng mức giá chung liên tục của hàng hóa và dịch vụ theo thời gian, dẫn tới sự mất giá trị của một loại tiền tệ. Thước đo lường phổ biến là Chỉ số giá tiêu dùng (CPI). Lạm phát thường được chia làm 3 loại chính dựa trên tốc độ: lạm phát vừa phải (dưới 10% một năm), lạm phát phi mã (từ hai tới ba chữ số), và siêu lạm phát (trên 50% một tháng, gây sụp đổ kinh tế).\n\nThất nghiệp (Unemployment) là tình trạng những người trong độ tuổi lao động, có khả năng lao động, đang tích cực tìm kiếm việc làm nhưng chưa tìm được việc làm. Tỷ lệ thất nghiệp được tính bằng số người thất nghiệp chia cho tổng lực lượng lao động nhân với 100%.\n\nMối quan hệ giữa hai yếu tố này được biểu diễn qua Đường cong Phillips (Phillips Curve) trong ngắn hạn: khi tỷ lệ thất nghiệp giảm xuống thấp, lạm phát có xu hướng tăng cao, và ngược lại. Điều này tạo ra sự đánh đổi khó khăn cho các nhà hoạch định chính sách khi lựa chọn giữa ưu tiên kiềm chế lạm phát hay thúc đẩy tăng trưởng để tạo việc làm."
  },
  {
    title: "Nhập môn Câu lệnh điều kiện & Vòng lặp trong Python",
    subject: "Tin học cơ sở / Lập trình cơ bản",
    level: "Sinh viên Đại học năm 1",
    duration: "60 phút",
    objectives: "- Trình bày được cú pháp và nguyên lý hoạt động của câu lệnh logic if-elif-else.\n- Viết được chương trình Python sử dụng vòng lặp for và while để lặp dữ liệu.\n- Nhận diện và sửa lỗi lặp vô hạn (infinite loop) trong mã nguồn thực tế.",
    content: "Lập trình máy tính về bản chất là việc đưa ra các quyết định và lặp lại các tác vụ dựa trên điều kiện nhất định.\n\nTrong Python, câu lệnh rẽ nhánh được biểu diễn qua khối if-elif-else. Python sử dụng thụt lề (indentation, thường là 4 khoảng trắng) để phân tách các khối lệnh, đây là nét độc đáo so với C++ hay Java dùng cặp ngoặc nhọn. \nCú pháp cơ bản:\nif dieu_kien:\n    thuc_thi_a()\nelif dieu_kien_2:\n    thuc_thi_b()\nelse:\n    thuc_thi_c()\n\nVòng lặp (Loops) trong Python gồm hai loại chính:\n1. Vòng lặp `for`: Được dùng khi biết trước số lần lặp, thường lặp qua một chuỗi (danh sách, chuỗi ký tự, tuple) hoặc đối tượng dãy số tạo bởi hàm range(start, stop, step).\n2. Vòng lặp `while`: Được dùng khi lặp liên tục cho đến khi một điều kiện logic chuyển sang False. \n\nVí dụ kinh điển về lỗi phổ biến của sinh viên khi sử dụng vòng lặp while là quên cập nhật biến điều kiện bên trong thân vòng lặp, dẫn tới lỗi lặp vô hạn (Infinite Loop), khiến máy tính cạn kiệt bộ nhớ RAM. Do đó, quy tắc cốt lõi khi sử dụng while luôn là đảm bảo điều kiện dừng có cơ hội được thỏa mãn sau mỗi chu kỳ lặp."
  },
  {
    title: "Ứng dụng Trí tuệ Nhân tạo (AI) trong Thiết kế Giáo án Số",
    subject: "Sư phạm số / Kỹ năng giảng dạy trực tuyến",
    level: "Giảng viên & Học viên Cao học",
    duration: "30 phút",
    objectives: "- Liệt kê được 3 lợi ích vượt trội của mô hình ngôn ngữ lớn (LLM) trong soạn thảo tài liệu sư phạm.\n- Thiết lập được các cú pháp prompt chuẩn mực để tối đa hóa độ chính xác học thuật từ AI.\n- Thực hành tích hợp các hoạt động phản hồi chủ động bằng giáo án tự tương tác HTML.",
    content: "Thời đại giáo dục 4.0 đang chứng kiến sự chuyển dịch mạnh mẽ từ các bài giảng tĩnh (PDF, PowerPoint truyền thống) sang tài liệu số tương tác cao (Active Learning Resources).\n\nTrí tuệ nhân tạo, đặc biệt là các mô hình ngôn ngữ lớn như Gemini, đóng vai trò là một trợ lý ảo của giảng viên. Thay vì tốn hàng giờ thiết kế các bộ câu hỏi trắc nghiệm, tình huống thảo luận và flashcard một cách thủ công, giảng viên có thể sử dụng AI để đồng tạo dựng (co-create) học liệu tương tác.\n\nPhương pháp áp dụng sư phạm tích cực (Active Learning) nhấn mạnh rằng sinh viên không chỉ thụ động đọc văn bản mà phải liên tục tương tác: trả lời câu hỏi trắc nghiệm để nhận phản hồi lập tức, lật các thẻ flashcard để ôn lại thuật ngữ ngay tại chỗ, viết phản hồi tự ngẫm để ghi nhớ sâu bản chất khoa học. Việc xuất bản các giáo trình này ra định dạng HTML khép kín giúp giảng viên dễ dàng tích hợp trực tiếp vào bất cứ hệ thống quản lý học tập (LMS) nào như Moodle, Canvas hoặc gửi trực tiếp cho sinh viên qua Zalo, Email chơi được trên mọi điện thoại di động và máy tính mà không cần cài đặt thêm phần mềm nào."
  }
];
