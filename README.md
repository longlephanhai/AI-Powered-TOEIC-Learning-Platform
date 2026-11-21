# AI-Powered TOEIC Learning Platform

Nền tảng học và luyện thi TOEIC toàn diện tích hợp trí tuệ nhân tạo (Google Gemini & Google Cloud Text-to-Speech), gồm 3 ứng dụng độc lập trong cùng repository:

- **`backend/`**: REST API server xây dựng bằng **NestJS + MongoDB (Mongoose)**.
- **`frontend-next/`**: Ứng dụng web dành cho **học viên** xây dựng bằng **Next.js 14 (App Router) + Ant Design + NextAuth v5**.
- **`frontend-react/`**: Cổng **quản trị & nhập liệu hàng loạt (Excel/CSV)** xây dựng bằng **React + Vite + Ant Design + Redux Toolkit**.

---

## Mục lục

- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Biến môi trường](#biến-môi-trường)
- [Hướng dẫn cài đặt & chạy dự án](#hướng-dẫn-cài-đặt--chạy-dự-án)
- [Tổng quan API & Routes](#tổng-quan-api--routes)
- [Ghi chú kỹ thuật](#ghi-chú-kỹ-thuật)

---

## Kiến trúc hệ thống

```text
┌──────────────────────────┐        ┌──────────────────────────┐
│      frontend-next       │        │      frontend-react      │
│  (Học viên - Port 3000)  │        │  (Quản trị - Port 4000)  │
└────────────┬─────────────┘        └────────────┬─────────────┘
             │ HTTP / REST (/api/*)              │ HTTP / REST (/api/*)
             └──────────────────┬────────────────┘
                                ▼
             ┌────────────────────────────────────┐
             │              backend               │
             │   NestJS REST API (Port 8000)      │
             └──────┬──────────┬───────────┬──────┘
                    │          │           │
        ┌───────────▼──┐  ┌────▼─────┐  ┌──▼───────────────────┐
        │   MongoDB    │  │  Google  │  │ Dịch vụ bên ngoài:   │
        │  (Mongoose)  │  │  Gemini  │  │ - Google Cloud TTS   │
        │              │  │   API    │  │ - Python ML Server   │
        └──────────────┘  └──────────┘  └──────────────────────┘
```

---

## Tính năng chính

### 1. Ứng dụng học viên (`frontend-next`)
- **Xác thực người dùng**: Đăng ký, đăng nhập qua `next-auth` (Credentials + GitHub provider), tự động làm mới JWT access token qua refresh token.
- **Lộ trình học cá nhân hóa (Learning Path)**:
  - Khảo sát trình độ đầu vào và mục tiêu điểm (`surveys`).
  - Gemini tự động tạo lộ trình học **30 ngày** (`LearningPath`, `LearningStep`, `LearningTask`) phân bổ bài luyện Part 1–7 và Ngữ pháp.
- **Luyện đề TOEIC 7 Parts (`test`)**:
  - Làm bài full test hoặc chọn từng Part (Part 1 đến Part 7).
  - Tự động tính số câu đúng và quy đổi điểm Listening / Reading / Tổng điểm TOEIC.
  - Xem lại lịch sử làm bài, chi tiết câu trả lời đúng/sai/bỏ trống.
- **Dự đoán điểm TOEIC & Lời khuyên AI (`user/predict`)**:
  - Tổng hợp kết quả luyện tập 7 Parts gửi tới Python ML Server (`PYTHON_SERVER_URL`) để dự đoán điểm (`median`), sau đó dùng Gemini phân tích và gợi ý hướng cải thiện.
- **Ôn tập lỗi sai thông minh (`mistake`)**:
  - Thống kê lỗi sai theo dạng câu hỏi cho từng Part 1–7 từ lịch sử làm đề.
  - Dùng Gemini chọn lọc các câu hỏi luyện tập tập trung vào điểm yếu của từng học viên.
- **Luyện viết với AI (`writing`)**:
  - Thực hành viết bài theo đề và nhận chấm điểm, nhận xét cấu trúc/ngữ pháp/từ vựng từ Gemini (`generate-text` và backend hỗ trợ `generate-image`).
  - Lưu trữ lịch sử bài viết (`writing/history`).
- **Luyện nói với AI (`speaking`)**:
  - Chọn chủ đề giao tiếp và trò chuyện theo ngữ cảnh với AI (`speaking-ai/start`, `speaking-ai`).
  - Phản hồi kèm âm thanh MP3 tổng hợp từ Google Cloud Text-to-Speech.
- **Từ vựng, Ngữ pháp & Flashcard**:
  - Học từ vựng theo chủ đề (kèm phát âm qua `window.speechSynthesis`) và bài tập điền từ **AI Review**.
  - Đọc bài học ngữ pháp và làm 5 câu hỏi luyện tập do AI sinh cho từng chủ đề.
  - Tạo, sửa, quản lý bộ thẻ và từ vựng **Flashcard** cá nhân.
- **Trợ lý AI nổi (`AIHelper`)**:
  - Tích hợp sẵn trên giao diện học viên để giải thích nghĩa câu, ghi chú ngữ pháp, từ vựng khó và phân tích đáp án A/B/C/D bằng tiếng Việt.

### 2. Cổng quản trị & nhập dữ liệu (`frontend-react`)
- **Quản lý phân quyền (RBAC)**: Quản lý Người dùng (`/user`), Vai trò (`/role`), Quyền hạn (`/permission`).
- **Nhập dữ liệu hàng loạt từ Excel/CSV (`xlsx`)**:
  - Đề thi và danh sách câu hỏi theo từng Part (`/test`).
  - Dữ liệu luyện tập riêng cho Part 1 đến Part 7 (`/part1` – `/part7`).
  - Chủ đề từ vựng & danh sách từ vựng (`/vocabulary`).
  - Bài học ngữ pháp (`/grammar`), chủ đề luyện nói (`/speaking`), đề luyện viết (`/writing`).

### 3. Backend API (`backend`)
- Global prefix `/api`, bật CORS (`credentials: true`), `cookie-parser`, `ValidationPipe({ whitelist: true })`.
- Guard JWT toàn cục (`JwtAuthGuard`), chỉ bỏ qua ở các route có decorator `@Public()`.
- Chuẩn hóa response toàn cục qua `TransformInterceptor` theo cấu trúc `{ statusCode, message, data }`.
- Hỗ trợ upload file tĩnh vào `public/images/...` (Multer, giới hạn `1MB`, định dạng `jpg, jpeg, png, gif, pdf, doc, docx`) và phục vụ static assets từ thư mục `public/`.
- Tự động khởi tạo dữ liệu mẫu (`DatabasesService`) khi cấu hình `SHOULD_INIT`:
  - Tạo 16 quyền mặc định (`USERS`, `FILES`, `PERMISSIONS`, `ROLES`).
  - Tạo 2 role: `SUPER_ADMIN` và `NORMAL_USER`.
  - Tạo 2 tài khoản mẫu: `admin@gmail.com` và `user@gmail.com` (mật khẩu lấy từ `INIT_PASSWORD`).

---

## Công nghệ sử dụng

| Thành phần | Công nghệ chính |
|---|---|
| **Backend (`backend/`)** | NestJS 11, TypeScript 5.7, MongoDB & Mongoose 8, Passport (Local & JWT), `bcryptjs`, `class-validator`, `multer`, `@google/generative-ai` (`gemini-3-flash-preview`), `@google-cloud/text-to-speech`, `axios` |
| **Learner Web (`frontend-next/`)** | Next.js 14 (App Router), React 18, TypeScript 5, Ant Design 5, `@ant-design/nextjs-registry`, `next-auth` v5 beta, `query-string`, `dayjs` |
| **Admin Portal (`frontend-react/`)** | React 18, Vite 7 (SWC), TypeScript 5.8, Ant Design 5, `@ant-design/pro-components`, React Router 7, Redux Toolkit, TanStack React Query, Axios, SheetJS (`xlsx`) |

---

## Cấu trúc thư mục

```text
AI-Powered-TOEIC-Learning-Platform/
├── backend/
│   ├── public/                     # Static files (css, images/avatar, images/default)
│   ├── src/
│   │   ├── ai-assistant/           # Giải thích câu & đáp án bằng Gemini
│   │   ├── auth/                   # Đăng ký, đăng nhập, JWT access/refresh token
│   │   ├── core/                   # TransformInterceptor, HttpExceptionFilter
│   │   ├── databases/              # Seed permissions, roles, admin/user mặc định
│   │   ├── decorator/              # @Public(), @User(), @ResponseMessage()
│   │   ├── exam-result/            # Chấm điểm TOEIC, lịch sử thi, dự đoán điểm
│   │   ├── files/                  # Upload file (Multer)
│   │   ├── flash-card/             # Bộ flashcard cá nhân
│   │   ├── vocabularies-flash-card/# Chi tiết từ trong flashcard
│   │   ├── grammars/               # Ngữ pháp & sinh câu hỏi AI
│   │   ├── learning-path/          # Lộ trình học 30 ngày
│   │   ├── learning-step/          # Từng ngày học trong lộ trình
│   │   ├── learning-task/          # Từng nhiệm vụ trong ngày
│   │   ├── user-task-progress/     # Tiến độ hoàn thành task
│   │   ├── part1/ ... part7/       # Ngân hàng câu hỏi/bài tập Parts 1–7
│   │   ├── parts/ & question/      # Part & câu hỏi thuộc đề thi
│   │   ├── part5-mistakes/         # Phân tích lỗi sai & tạo bài ôn tập AI Parts 1–7
│   │   ├── permissions/ & roles/   # Quản lý vai trò & quyền hạn
│   │   ├── speaking-ai/            # Hội thoại AI + Google Cloud TTS
│   │   ├── surveys/                # Khảo sát đầu vào & sinh lộ trình AI
│   │   ├── tests/                  # Quản lý đề thi TOEIC
│   │   ├── topics-speaking/        # Chủ đề luyện nói
│   │   ├── topics-vocabularies/    # Chủ đề từ vựng & AI review
│   │   ├── users/                  # Quản lý người dùng
│   │   ├── vocabularies/           # Từ vựng
│   │   ├── writing/                # Đề luyện viết
│   │   ├── writing-ai/             # Chấm bài viết (text/image) bằng Gemini
│   │   ├── writing-history/        # Lịch sử bài viết
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
├── frontend-next/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (guest)/            # /auth/login, /auth/register
│   │   │   ├── (user)/             # Toàn bộ trang học viên
│   │   │   └── api/                # /api/auth/[...nextauth], /api/revalidate
│   │   ├── components/             # UI theo từng module (exam, aihelper, writing, speaking...)
│   │   ├── types/                  # Type definitions cho backend & next-auth
│   │   ├── utils/                  # Fetch wrapper (api.ts), TextToSpeech.js
│   │   ├── auth.ts                 # Cấu hình NextAuth v5
│   │   └── middleware.ts
│   └── package.json
└── frontend-react/
    ├── src/
    │   ├── config/                 # Axios interceptor, permission helpers
    │   ├── layout/                 # Admin layout (Sider, Header, Footer)
    │   ├── pages/                  # auth, dashboard, user, role, permission, test, part1..7...
    │   ├── components/             # Bảng dữ liệu & modal import Excel theo module
    │   ├── redux/                  # Redux store (userSlice, counterSlice)
    │   ├── services/               # API client (api.ts)
    │   └── App.tsx                 # React Router config
    ├── vite.config.ts              # Cấu hình dev server port 4000
    └── package.json
```

---

## Biến môi trường

### 1. Backend (`backend/.env`)
Tham khảo file mẫu tại `backend/.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/toeic_platform
PORT=8000

# JWT Access Token
JWT_ACCESS_TOKEN_SECRET=your_access_secret
JWT_ACCESS_EXPIRE=1d

# JWT Refresh Token
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d

# Seed dữ liệu khởi tạo (DatabasesService)
INIT_PASSWORD=123456
SHOULD_INIT=true

# Google Gemini API (dùng cho các tính năng AI)
API_GEMINI_KEY=your_gemini_api_key

# Google Cloud Text-to-Speech (đường dẫn file JSON service account)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json

# Python ML Server (tùy chọn, phục vụ GET /api/exam-result/user/predict)
PYTHON_SERVER_URL=http://localhost:5000/predict

# (Khai báo trong .env.example, hiện chưa gọi trực tiếp trong source code)
OPENAI_API_KEY=
```

### 2. Frontend Next.js (`frontend-next/.env.local`)
Tạo file `.env.local` trong `frontend-next/` với các biến được đọc trong mã nguồn:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth v5
AUTH_SECRET=your_nextauth_secret
# Nếu dùng đăng nhập GitHub (tùy chọn)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Thời hạn access token để NextAuth tính thời điểm refresh (vd: 1 + d, hoặc 15 + m)
TOKEN_EXPIRE_NUMBER=1
TOKEN_EXPIRE_UNIT=d

# Secret cho endpoint POST /api/revalidate
REVALIDATE_SECRET=your_revalidate_secret
```

### 3. Frontend React Admin (`frontend-react/.env`)
Tạo file `.env` trong `frontend-react/`:

```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## Hướng dẫn cài đặt & chạy dự án

### Yêu cầu môi trường
- **Node.js** (khuyến nghị v20+) và **npm**
- **MongoDB** đang chạy cục bộ hoặc MongoDB Atlas
- **Gemini API Key** (`API_GEMINI_KEY`)
- **Google Cloud Credentials JSON** (nếu sử dụng tính năng AI Speaking TTS)
- **Python Prediction Server** (nếu sử dụng tính năng dự đoán điểm TOEIC)

### Bước 1: Chạy Backend

```bash
cd backend
npm install
cp .env.example .env
# Cập nhật các biến trong backend/.env
npm run start:dev
```

Backend chạy mặc định tại `http://localhost:8000` (global prefix `/api`).

### Bước 2: Chạy Learner Web (`frontend-next`)

```bash
cd frontend-next
npm install
# Tạo frontend-next/.env.local theo hướng dẫn ở trên
npm run dev
```

Ứng dụng học viên chạy mặc định tại `http://localhost:3000`.

### Bước 3: Chạy Admin Portal (`frontend-react`)

```bash
cd frontend-react
npm install
# Tạo frontend-react/.env với VITE_BACKEND_URL=http://localhost:8000
npm run dev
```

Cổng quản trị được cấu hình chạy tại `http://localhost:4000` (xem `frontend-react/vite.config.ts`).

### Các script hữu ích khác

- **Backend**: `npm run build`, `npm run start:prod`, `npm run lint`, `npm run test`, `npm run test:e2e`
- **Frontend Next**: `npm run build`, `npm run start`, `npm run lint`
- **Frontend React**: `npm run build`, `npm run preview`, `npm run lint`

---

## Tổng quan API & Routes

### Backend API (`/api/*`)
- **Auth & RBAC**: `/api/auth` (`register`, `login`, `account`, `profile`, `refresh`, `logout`), `/api/users`, `/api/roles`, `/api/permissions`, `/api/files/upload`
- **Đề thi & Luyện tập TOEIC**: `/api/tests`, `/api/parts`, `/api/question`, `/api/part1` ... `/api/part7`, `/api/exam-result` (bao gồm `user/history`, `user/predict`), `/api/part5-mistakes` (bao gồm `generate-part1-mistakes` ... `generate-part7-mistakes`)
- **Lộ trình học**: `/api/surveys`, `/api/learning-path`, `/api/learning-step`, `/api/learning-task`, `/api/user-task-progress`
- **Kỹ năng & AI**: `/api/ai-assistant/explain-sentence`, `/api/speaking-ai` (`start`, `/`), `/api/topics-speaking`, `/api/writing`, `/api/writing-ai` (`generate-text`, `generate-image`), `/api/writing-history`
- **Từ vựng, Ngữ pháp & Flashcard**: `/api/topics-vocabularies` (bao gồm `ai-review/:id`), `/api/vocabularies`, `/api/grammars` (bao gồm `questions-ai/:id`), `/api/flash-card`, `/api/vocabularies-flash-card`

### Routes chính của Learner Web (`frontend-next`)
- `/auth/login`, `/auth/register`
- `/` (Dashboard lộ trình học hoặc khảo sát đầu vào), `/learningpath`
- `/test`, `/test/[id]`, `/test/[id]/exam`, `/test/[id]/exam/result/[resultId]`, `/test/history`, `/test/history/[id]`, `/test/history/answer/[id]`
- `/writing`, `/writing/[id]`, `/writing/history`
- `/speaking`, `/speaking/[id]`
- `/mistake`, `/mistake/part1` ... `/mistake/part7`
- `/vocabularies`, `/vocabularies/[id]`, `/vocabularies/[id]/ai-review`
- `/grammar`, `/grammar/[id]`
- `/flashcard`, `/flashcard/[id]`

### Routes chính của Admin Portal (`frontend-react`)
- `/auth/login`
- `/`, `/user`, `/role`, `/permission`, `/test`, `/writing`, `/vocabulary`, `/speaking`, `/grammar`, `/part1` ... `/part7`

---

## Ghi chú kỹ thuật

- **Model AI thực tế**: Tất cả dịch vụ AI trong `backend/src` hiện sử dụng `@google/generative-ai` với model `gemini-3-flash-preview`. Package `openai` vẫn nằm trong `backend/package.json` nhưng không còn được dùng để gọi API.
- **Khởi tạo dữ liệu (`SHOULD_INIT`)**: Trong `backend/src/databases/databases.service.ts`, logic kiểm tra dùng `Boolean(isInit)` trên chuỗi cấu hình; bất kỳ chuỗi không rỗng nào (kể cả `"false"`) đều được xem là `true`, nhưng dữ liệu chỉ chèn khi collection đang rỗng (`count === 0`).
- **Một số tính năng đang hoàn thiện dở trên UI**:
  - Ở `frontend-next`: chức năng tải ảnh chấm Writing (`writing.textarea.tsx`) gọi `/api/evaluateImage` nhưng chưa có route handler tương ứng; trang Speaking (`topics.speak.tsx`) hiện đang gọi cứng `http://localhost:8000` và gửi text input; nút đăng nhập Google và một số mục menu (`profile`, `settings`) mới dừng ở mức giao diện.
  - Ở `frontend-react`: các trang `/part1`–`/part7`, `/speaking`, `/grammar` chủ yếu phục vụ import Excel (chưa hiển thị bảng dữ liệu quản lý); một số thao tác sửa/xóa trên bảng vẫn dùng placeholder (`alert`/`console.log`); trang `/` (`DashboardPage`) đang là placeholder.
