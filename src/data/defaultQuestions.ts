import { QuestionSet } from '../types';

export const DEFAULT_QUESTION_SETS: QuestionSet[] = [
  {
    id: 'set_stem_primary',
    name: '10 Câu hỏi – Giáo dục STEM Tiểu học',
    grade: 'Tiểu học (Khối 1 - Khối 5)',
    subject: 'Giáo dục STEM',
    status: 'saved',
    updatedAt: Date.now(),
    questions: [
      {
        id: 'stem_q1',
        content: 'Mục tiêu quan trọng của giáo dục STEM ở tiểu học là gì?',
        options: [
          'Phát triển năng lực vận dụng kiến thức để giải quyết vấn đề.',
          'Phát triển khả năng ghi nhớ kiến thức của các môn học.',
          'Phát triển kĩ năng sử dụng thiết bị và công nghệ hiện đại.',
          'Phát triển khả năng tạo ra các sản phẩm có tính ứng dụng.'
        ],
        correctAnswer: 'A',
        explanation: 'Giáo dục STEM chú trọng giúp học sinh hình thành năng lực vận dụng kiến thức liên môn để giải quyết vấn đề thực tế.',
        isConfirmed: true
      },
      {
        id: 'stem_q2',
        content: 'STEM là viết tắt của những lĩnh vực nào sau đây?',
        options: [
          'Khoa học, Công nghệ, Kĩ thuật và Toán học.',
          'Khoa học, Thiết kế, Giáo dục và Toán học.',
          'Khoa học, Công nghệ, Giáo dục và Kĩ thuật.',
          'Khoa học, Kĩ thuật, Nghệ thuật và Toán học.'
        ],
        correctAnswer: 'A',
        explanation: 'STEM là viết tắt của Science (Khoa học), Technology (Công nghệ), Engineering (Kĩ thuật) và Mathematics (Toán học).',
        isConfirmed: true
      },
      {
        id: 'stem_q3',
        content: 'Giáo dục STEM có thể được triển khai như thế nào ở tiểu học?',
        options: [
          'Chỉ triển khai trong môn Khoa học và môn Toán.',
          'Chỉ triển khai trong các môn học có nội dung công nghệ.',
          'Có thể tích hợp trong nhiều môn học và hoạt động giáo dục.',
          'Chỉ triển khai trong môn STEM được tổ chức riêng biệt.'
        ],
        correctAnswer: 'C',
        explanation: 'Giáo dục STEM mang tính tích hợp liên môn và có thể lồng ghép linh hoạt trong các môn học và hoạt động trải nghiệm.',
        isConfirmed: true
      },
      {
        id: 'stem_q4',
        content: 'Yếu tố nào thể hiện rõ đặc trưng của giáo dục STEM?',
        options: [
          'Học sinh tiếp nhận kiến thức từ giáo viên và hoàn thành bài tập.',
          'Học sinh vận dụng kiến thức để giải quyết vấn đề trong thực tiễn.',
          'Học sinh sử dụng thiết bị công nghệ để hoàn thành nhiệm vụ học tập.',
          'Học sinh tạo ra sản phẩm dựa trên hướng dẫn của giáo viên.'
        ],
        correctAnswer: 'B',
        explanation: 'Đặc trưng cốt lõi của STEM là học thông qua hành, gắn liền việc vận dụng kiến thức với thực tiễn đời sống.',
        isConfirmed: true
      },
      {
        id: 'stem_q5',
        content: 'Giáo dục STEM ở tiểu học có những hình thức tổ chức nào?',
        options: [
          'Bài học STEM, hoạt động trải nghiệm STEM và nghiên cứu khoa học, kĩ thuật.',
          'Bài học STEM, hoạt động ngoại khóa STEM và các cuộc thi STEM.',
          'Bài học STEM, dự án STEM và hoạt động nghiên cứu khoa học, kĩ thuật.',
          'Bài học STEM, câu lạc bộ STEM và hoạt động trải nghiệm STEM.'
        ],
        correctAnswer: 'A',
        explanation: 'Theo hướng dẫn của Bộ GD&ĐT, các hình thức tổ chức STEM gồm: Bài học STEM, Hoạt động trải nghiệm STEM và NCKH, kĩ thuật.',
        isConfirmed: true
      },
      {
        id: 'stem_q6',
        content: 'Đặc điểm nào phù hợp với một bài học STEM?',
        options: [
          'Học sinh chủ yếu ghi nhớ kiến thức do giáo viên cung cấp.',
          'Học sinh vận dụng kiến thức để giải quyết một vấn đề đặt ra.',
          'Học sinh chủ yếu hoàn thành sản phẩm theo hướng dẫn có sẵn.',
          'Học sinh chủ yếu sử dụng công nghệ để tạo ra sản phẩm học tập.'
        ],
        correctAnswer: 'B',
        explanation: 'Bài học STEM định hướng giải quyết vấn đề, học sinh tự chủ tư duy và thử nghiệm giải pháp sáng tạo.',
        isConfirmed: true
      },
      {
        id: 'stem_q7',
        content: 'Quy trình thiết kế kĩ thuật thường bắt đầu bằng hoạt động nào?',
        options: [
          'Chế tạo sản phẩm.',
          'Xác định vấn đề.',
          'Thử nghiệm sản phẩm.',
          'Đánh giá sản phẩm.'
        ],
        correctAnswer: 'B',
        explanation: 'Bước đầu tiên trong quy trình thiết kế kĩ thuật luôn là nhận diện và xác định rõ vấn đề cần giải quyết.',
        isConfirmed: true
      },
      {
        id: 'stem_q8',
        content: 'Trình tự nào phù hợp với quy trình thiết kế kĩ thuật?',
        options: [
          'Xác định vấn đề → nghiên cứu kiến thức nền → đề xuất và lựa chọn giải pháp → chế tạo, thử nghiệm và đánh giá.',
          'Xác định vấn đề → đề xuất và lựa chọn giải pháp → chế tạo → nghiên cứu kiến thức nền.',
          'Xác định vấn đề → đề xuất và lựa chọn giải pháp → chế tạo, thử nghiệm và đánh giá → nghiên cứu kiến thức nền.',
          'Xác định vấn đề → nghiên cứu kiến thức nền → chế tạo, thử nghiệm và đánh giá → đề xuất và lựa chọn giải pháp.'
        ],
        correctAnswer: 'A',
        explanation: 'Quy trình chuẩn: Xác định vấn đề → Nghiên cứu kiến thức nền → Đề xuất & lựa chọn giải pháp → Chế tạo, thử nghiệm & đánh giá.',
        isConfirmed: true
      },
      {
        id: 'stem_q9',
        content: 'Vì sao học sinh cần thử nghiệm sản phẩm trong hoạt động STEM?',
        options: [
          'Để xác định sản phẩm của nhóm nào có hình thức đẹp hơn.',
          'Để kiểm tra giải pháp và tìm cách điều chỉnh sản phẩm.',
          'Để xác định nhóm nào hoàn thành sản phẩm nhanh hơn.',
          'Để giáo viên có căn cứ chấm điểm sản phẩm cuối cùng.'
        ],
        correctAnswer: 'B',
        explanation: 'Thử nghiệm giúp kiểm chứng hiệu quả thực tế và phát hiện điểm cần cải tiến, tối ưu hóa sản phẩm.',
        isConfirmed: true
      },
      {
        id: 'stem_q10',
        content: 'Yếu tố nào giúp phân biệt hoạt động STEM với hoạt động làm sản phẩm thông thường?',
        options: [
          'Học sinh vận dụng kiến thức để tạo ra một sản phẩm nhằm giải quyết vấn đề thực tiễn.',
          'Học sinh làm việc theo nhóm để hoàn thành các nhiệm vụ được giao tại lớp.',
          'Học sinh thực hiện tạo sản phẩm theo các bước giáo viên hướng dẫn.',
          'Học sinh sử dụng nhiều vật liệu khác nhau để tạo ra sản phẩm sử dụng tốt.'
        ],
        correctAnswer: 'A',
        explanation: 'Hoạt động STEM đòi hỏi tư duy giải quyết vấn đề dựa trên kiến thức khoa học, khác với việc lắp ráp mô hình rập khuôn.',
        isConfirmed: true
      }
    ]
  },
  {
    id: 'set_stem_future',
    name: 'Tin học & Công nghệ số tương lai',
    grade: 'Khối 3 - Khối 5',
    subject: 'Tin học & STEM',
    status: 'saved',
    updatedAt: Date.now() - 3600000,
    questions: [
      {
        id: 'q1',
        content: 'Thiết bị nào sau đây dùng để nhập hình ảnh và video trực tiếp vào máy tính?',
        options: ['Webcam (Camera)', 'Bàn phím', 'Màn hình', 'Máy in'],
        correctAnswer: 'A',
        explanation: 'Webcam là thiết bị thu thập hình ảnh và video trực tiếp.',
        isConfirmed: true
      },
      {
        id: 'q2',
        content: 'Trong lập trình Scratch, khối lệnh màu cam "Lặp lại 10 lần" thuộc nhóm lệnh nào?',
        options: ['Chuyển động (Motion)', 'Điều khiển (Control)', 'Sự kiện (Events)', 'Cảm biến (Sensing)'],
        correctAnswer: 'B',
        explanation: 'Nhóm lệnh Điều khiển (Control) chứa các vòng lặp và câu lệnh điều kiện.',
        isConfirmed: true
      },
      {
        id: 'q3',
        content: 'Bộ phận nào được ví như "bộ não" xử lý mọi dữ liệu của máy tính?',
        options: ['Ổ cứng SSD', 'Bộ vi xử lý (CPU)', 'Thanh nhớ RAM', 'Chuột máy tính'],
        correctAnswer: 'B',
        explanation: 'CPU (Central Processing Unit) là bộ xử lý trung tâm của máy tính.',
        isConfirmed: true
      }
    ]
  }
];
