import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

@Injectable()
export class SpeakingAiService {
  private genAI: GoogleGenerativeAI;
  private genAiProModel: any;
  private ttsClient: TextToSpeechClient;

  private conversationHistory: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[] = [];

  constructor(private configService: ConfigService) {
    // Gemini
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('API_GEMINI_KEY')!,
    );

    this.genAiProModel = this.genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
    });

    // ✅ FIX QUAN TRỌNG
    this.ttsClient = new TextToSpeechClient();
  }

  private buildPrompt(): string {
    return this.conversationHistory
      .map((msg) => {
        if (msg.role === 'system') return msg.content;
        if (msg.role === 'user') return `Learner: ${msg.content}`;
        return `Teacher: ${msg.content}`;
      })
      .join('\n');
  }

  async startConversation(topic: string): Promise<string> {
    if (!topic) {
      return 'Please provide a topic so we can begin our conversation.';
    }

    this.conversationHistory = [
      {
        role: 'system',
        content: `
You are an English speaking coach helping a learner practice conversation on the topic "${topic}".

Rules:
1. Start with ONE very simple question.
2. Increase difficulty gradually.
3. Ask only ONE question at a time.
4. Correct grammar gently and suggest better expressions.
5. Encourage natural conversation.
6. Never mention you are an AI. Speak like a real teacher.
`,
      },
    ];

    const result = await this.genAiProModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: this.buildPrompt() }],
        },
      ],
    });

    const message = result.response.text().trim();
    this.conversationHistory.push({ role: 'assistant', content: message });

    return message;
  }

  async getGeminiResponse(userText: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userText,
    });

    const result = await this.genAiProModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: this.buildPrompt() }],
        },
      ],
    });

    const message = result.response.text().trim();
    if (!message) throw new Error('No response from Gemini');

    this.conversationHistory.push({
      role: 'assistant',
      content: message,
    });

    return message;
  }

  async convertTextToSpeech(text: string): Promise<Buffer> {
    const [response] = await this.ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    return Buffer.from(response.audioContent as Uint8Array);
  }
}
