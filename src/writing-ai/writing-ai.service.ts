import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class WritingAiService {
  private genAI: GoogleGenerativeAI;
  private genAiProModel: any;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(this.configService.get<string>('API_GEMINI_KEY')!);
    this.genAiProModel = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  }

  async generateText(promptDto: PromptDto): Promise<any> {
    const { title, description, content, level, minWords, maxWords } = promptDto;

    if (!content || content.trim() === "") {
      throw new Error("Nội dung không được để trống");
    }

    const instruction = `
Bạn là một chuyên gia đánh giá kỹ năng viết tiếng Anh nâng cao, chuyên về TOEIC và môi trường kinh doanh.

Hãy đánh giá bài luận sau một cách cẩn thận và đưa ra phản hồi chi tiết.

Thông tin bài luận:
- Tiêu đề: ${title}
- Mô tả: ${description}
- Trình độ: ${level || "Chưa xác định"}
- Số từ mong đợi: ${minWords || "?"}–${maxWords || "?"}

Nội dung bài luận:
"""${content}"""

Trả kết quả **chỉ** dưới định dạng JSON với cấu trúc sau:
{
  "overallFeedback": "string",  // Nhận xét tổng quan
  "grammarErrors": [
    { "original": "string", "correction": "string", "explanation": "string" }
  ],
  "vocabularySuggestions": [
    { "word": "string", "suggestion": "string", "reason": "string" }
  ],
  "structureFeedback": "string", 
  "score": {
    "grammar": number,
    "vocabulary": number,
    "coherence": number,
    "taskResponse": number,
    "overall": number
  },
  "improvedVersion": "string" 
}

Hướng dẫn:
- Ngắn gọn nhưng chính xác.
- Luôn đưa ít nhất 1 ví dụ về lỗi ngữ pháp và từ vựng.
- Nếu bài luận xuất sắc, vẫn đưa ít nhất một gợi ý cải thiện.
`;

    const result = await this.genAiProModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: instruction }],
        },
      ],
    });

    const rawText = result.response.text();

    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");
    const jsonString =
      jsonStart !== -1 && jsonEnd !== -1
        ? rawText.slice(jsonStart, jsonEnd + 1)
        : rawText;

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Kết quả AI không phải JSON hợp lệ, trả về text gốc.");
      return { overallFeedback: rawText };
    }
  }





  async generateImage(prompt: string, imageBase64: string): Promise<string> {
    if (!prompt || !imageBase64) {
      throw new Error('Prompt and imageBase64 are required');
    }

    const base64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const result = await this.genAiProModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();
    return text;
  }

}
