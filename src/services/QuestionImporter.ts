import { Question } from '../types';

export class QuestionImporter {
  /**
   * Generates sample text template for download.
   */
  public static getSampleTemplate(): string {
    return `Câu 1: Thiết bị nào sau đây dùng để ghi nhận hình ảnh và video từ người dùng?
A. Máy ảnh kỹ thuật số hoặc Webcam
B. Loa âm thanh nổi
C. Bàn phím cơ học
D. Ổ đĩa quang
Đáp án đúng: A
Giải thích: Webcam là thiết bị ghi nhận hình ảnh và video trực tiếp.

Câu 2: Trong khoa học máy tính, thuật toán là gì?
A. Một chương trình vi rút
B. Dãy các bước chỉ dẫn rõ ràng để giải quyết một bài toán
C. Dây cáp mạng Internet
D. Bộ nhớ trong máy tính
Đáp án đúng: B
Giải thích: Thuật toán là tập hợp hữu hạn các chỉ dẫn tuần tự.

Câu 3: Bộ phận nào điều khiển mọi hoạt động tính toán của máy tính?
A. Ổ cứng SSD
B. Bộ vi xử lý trung tâm (CPU)
C. Bộ nhớ tạm RAM
D. Chuột quang
Đáp án đúng: B
Giải thích: CPU đóng vai trò như bộ não xử lý.
`;
  }

  /**
   * Parses structured text into Question objects.
   */
  public static parseText(rawText: string): Question[] {
    const lines = rawText.split(/\r?\n/);
    const questions: Question[] = [];

    let currentContent = '';
    let optA = '';
    let optB = '';
    let optC = '';
    let optD = '';
    let correct: 'A' | 'B' | 'C' | 'D' | null = null;
    let explanation = '';
    let isReadingQuestion = false;

    const commitQuestion = () => {
      if (currentContent.trim() && (optA || optB || optC || optD)) {
        const isConfirmed = correct !== null;
        questions.push({
          id: 'q_' + Math.random().toString(36).substring(2, 9),
          content: currentContent.trim(),
          options: [
            optA.trim() || 'Lựa chọn A',
            optB.trim() || 'Lựa chọn B',
            optC.trim() || 'Lựa chọn C',
            optD.trim() || 'Lựa chọn D'
          ],
          correctAnswer: correct || 'A',
          explanation: explanation.trim() || undefined,
          isConfirmed
        });
      }
      currentContent = '';
      optA = '';
      optB = '';
      optC = '';
      optD = '';
      correct = null;
      explanation = '';
      isReadingQuestion = false;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Question start
      const qMatch = line.match(/^(?:Câu\s*\d+|Question\s*\d+|\d+)[.:]\s*(.+)$/i);
      if (qMatch) {
        commitQuestion();
        currentContent = qMatch[1];
        isReadingQuestion = true;
        continue;
      }

      // Option A
      const aMatch = line.match(/^A[.:)]\s*(.+)$/i);
      if (aMatch) {
        isReadingQuestion = false;
        optA = aMatch[1];
        continue;
      }

      // Option B
      const bMatch = line.match(/^B[.:)]\s*(.+)$/i);
      if (bMatch) {
        isReadingQuestion = false;
        optB = bMatch[1];
        continue;
      }

      // Option C
      const cMatch = line.match(/^C[.:)]\s*(.+)$/i);
      if (cMatch) {
        isReadingQuestion = false;
        optC = cMatch[1];
        continue;
      }

      // Option D
      const dMatch = line.match(/^D[.:)]\s*(.+)$/i);
      if (dMatch) {
        isReadingQuestion = false;
        optD = dMatch[1];
        continue;
      }

      // Correct Answer
      const ansMatch = line.match(/^(?:Đáp\s*án(?:\s*đúng)?|Answer)[.:]\s*([A-D])/i);
      if (ansMatch) {
        correct = ansMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
        continue;
      }

      // Explanation
      const expMatch = line.match(/^(?:Giải\s*thích|Explanation)[.:]\s*(.+)$/i);
      if (expMatch) {
        explanation = expMatch[1];
        continue;
      }

      // Continuation of current item
      if (isReadingQuestion) {
        currentContent += ' ' + line;
      } else if (optD) {
        optD += ' ' + line;
      } else if (optC) {
        optC += ' ' + line;
      } else if (optB) {
        optB += ' ' + line;
      } else if (optA) {
        optA += ' ' + line;
      }
    }

    commitQuestion();
    return questions;
  }
}
