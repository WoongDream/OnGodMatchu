/**
 * 퀴즈 자동 생성 — 게시 스크립트 (결정적, Opus 미관여)
 *
 * staging 디렉토리의 quiz.json 매니페스트를 읽어:
 *   1) 매니페스트 검증 (필수 필드 / category key / answer / 이미지·텍스트 존재)
 *   2) 로컬 이미지 → presigned 업로드로 우리 S3 에 올려 key 획득
 *   3) POST /api/quizzes 로 퀴즈 생성 (항상 visibility=PRIVATE — 검토 전 노출 방지)
 *   4) 생성된 publicId / 검토 링크 출력
 *
 * 사용법:
 *   ONGOD_API_BASE=https://api.ongodmatchu.com \
 *   ONGOD_ACCESS_TOKEN=<브라우저 localStorage accessToken> \
 *   npx tsx tools/quiz-autogen/publish.ts tools/quiz-autogen/staging/<run>/
 *
 * 환경변수는 같은 폴더의 .env.local (gitignore: *.local) 에 적어도 됨. 실제 env 가 우선.
 *
 * 계약 출처(앱 코드 미import — 브라우저 전용 src/api/instance.ts 의존 회피):
 *   - 업로드 흐름/태깅: src/api/upload.ts (PRESIGNED_PUT_TAGGING='status=pending')
 *   - 생성 페이로드: BE QuizCreateRequest (visibility 필드, category 는 key 문자열)
 *   - 카테고리 key: src/types/quiz.ts CATEGORIES = BE QuizCategory enum key
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';

// --- 상수 (앱 코드와 동기화 필요 시 함께 갱신) -----------------------------
// src/api/upload.ts PRESIGNED_PUT_TAGGING. 빠지면 S3 가 403.
const PRESIGNED_PUT_TAGGING = 'status=pending';
// src/types/quiz.ts CATEGORIES value = BE QuizCategory key
const VALID_CATEGORIES = [
  'game',
  'music',
  'culture',
  'broadcast',
  'general',
  'comic',
  'food',
  'person',
  'sports',
  'meme',
] as const;
const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

// --- 매니페스트 타입 -------------------------------------------------------
interface ManifestQuestion {
  image?: string | null;
  questionText?: string | null;
  answer: string;
  answerImage?: string | null;
  sourceUrl?: string; // 검토/감사용. BE 미전송
  license?: string; // 검토/감사용. BE 미전송
}
interface Manifest {
  title: string;
  description?: string;
  category: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
  thumbnail?: string | null;
  questions: ManifestQuestion[];
}

type PresignedPutResponse = { uploadUrl: string; key: string; expiresIn: number };
type ApiResponse<T> = { success: boolean; data: T };

const __dirname = dirname(fileURLToPath(import.meta.url));

function fail(msg: string): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

/** 같은 폴더 .env.local 을 로드 (KEY=VALUE). 실제 환경변수가 우선. */
function loadEnvLocal(): void {
  const envPath = join(__dirname, '.env.local');
  if (!existsSync(envPath)) {
    return;
  }
  for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function contentTypeFor(file: string): string {
  const ct = CONTENT_TYPE_BY_EXT[extname(file).toLowerCase()];
  if (!ct) {
    fail(`지원하지 않는 이미지 확장자: ${file} (webp/jpg/png 만 가능)`);
  }
  return ct;
}

function validate(m: Manifest, stagingDir: string): void {
  const errs: string[] = [];
  if (!m.title?.trim()) {
    errs.push('title 이 비어있음');
  }
  if (!VALID_CATEGORIES.includes(m.category as never)) {
    errs.push(`category "${m.category}" 가 유효하지 않음 (${VALID_CATEGORIES.join('/')})`);
  }
  if (!Array.isArray(m.questions) || m.questions.length === 0) {
    errs.push('questions 가 비어있음');
  }
  m.questions?.forEach((q, i) => {
    const n = i + 1;
    if (!q.answer?.trim()) {
      errs.push(`Q${n}: answer(정답 텍스트) 필수`);
    }
    if (!q.image && !q.questionText?.trim()) {
      errs.push(`Q${n}: image 또는 questionText 중 하나는 필수`);
    }
    for (const [field, rel] of [
      ['image', q.image],
      ['answerImage', q.answerImage],
    ] as const) {
      if (rel && !existsSync(resolve(stagingDir, rel))) {
        errs.push(`Q${n}: ${field} 파일 없음 — ${rel}`);
      }
    }
  });
  if (m.thumbnail && !existsSync(resolve(stagingDir, m.thumbnail))) {
    errs.push(`thumbnail 파일 없음 — ${m.thumbnail}`);
  }
  if (errs.length) {
    fail(`매니페스트 검증 실패:\n  - ${errs.join('\n  - ')}`);
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const stagingArg = process.argv[2];
  if (!stagingArg) {
    fail('staging 디렉토리 경로를 인자로 넘겨주세요.');
  }
  const stagingDir = resolve(process.cwd(), stagingArg);
  const manifestPath = join(stagingDir, 'quiz.json');
  if (!existsSync(manifestPath)) {
    fail(`quiz.json 을 찾을 수 없음 — ${manifestPath}`);
  }

  const apiBase = process.env.ONGOD_API_BASE?.replace(/\/$/, '');
  const token = process.env.ONGOD_ACCESS_TOKEN;
  const webBase = (process.env.ONGOD_WEB_BASE ?? 'https://ongodmatchu.com').replace(/\/$/, '');
  if (!apiBase) {
    fail('ONGOD_API_BASE 환경변수가 필요합니다 (예: https://api.ongodmatchu.com)');
  }
  if (!token) {
    fail('ONGOD_ACCESS_TOKEN 환경변수가 필요합니다 (브라우저 localStorage accessToken)');
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
  validate(manifest, stagingDir);

  if (manifest.visibility === 'PUBLIC') {
    console.warn(
      '⚠ 매니페스트 visibility=PUBLIC 이지만, 검토 전 노출 방지를 위해 PRIVATE 로 강제합니다.',
    );
  }

  const auth = { Authorization: `Bearer ${token}` };
  const uploadCache = new Map<string, string>(); // 상대경로 → key (중복 업로드 방지)

  async function uploadImage(rel: string): Promise<string> {
    const cached = uploadCache.get(rel);
    if (cached) {
      return cached;
    }
    const filePath = resolve(stagingDir, rel);
    const buf = readFileSync(filePath);
    const filename = basename(filePath);
    const contentType = contentTypeFor(filePath);
    const size = statSync(filePath).size;

    // 1) presigned PUT URL 발급
    let presigned: PresignedPutResponse;
    try {
      const res = await axios.post<ApiResponse<PresignedPutResponse>>(
        `${apiBase}/api/upload/presigned`,
        { filename, contentType, size },
        { headers: auth },
      );
      presigned = res.data.data;
    } catch (e) {
      throw new Error(`presigned 발급 실패 (${rel}): ${errMsg(e)}`);
    }

    // 2) S3 직접 PUT (인증 없음, presigned URL)
    try {
      await axios.put(presigned.uploadUrl, buf, {
        headers: { 'Content-Type': contentType, 'x-amz-tagging': PRESIGNED_PUT_TAGGING },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30000,
      });
    } catch (e) {
      throw new Error(`S3 업로드 실패 (${rel}): ${errMsg(e)}`);
    }

    // 3) 업로드 완료 통지
    try {
      await axios.patch(
        `${apiBase}/api/upload/complete`,
        { key: presigned.key },
        { headers: auth },
      );
    } catch (e) {
      throw new Error(`업로드 완료 통지 실패 (${rel}): ${errMsg(e)}`);
    }

    uploadCache.set(rel, presigned.key);
    return presigned.key;
  }

  // --- 이미지 업로드 ---
  console.log(
    `\n▶ "${manifest.title}" — 문항 ${manifest.questions.length}개 게시 시작 (${apiBase})`,
  );
  const thumbnailKey = manifest.thumbnail ? await uploadImage(manifest.thumbnail) : undefined;

  const questions = [];
  for (let i = 0; i < manifest.questions.length; i++) {
    const q = manifest.questions[i];
    const imageKey = q.image ? await uploadImage(q.image) : undefined;
    const answerImageKey = q.answerImage ? await uploadImage(q.answerImage) : undefined;
    questions.push({
      imageKey,
      answerImageKey,
      questionText: q.questionText?.trim() || undefined,
      answer: q.answer.trim(),
    });
    console.log(`  ✓ Q${i + 1} 이미지 업로드 완료`);
  }

  // --- 퀴즈 생성 (항상 PRIVATE) ---
  const payload = {
    title: manifest.title.trim(),
    description: manifest.description?.trim() || undefined,
    category: manifest.category,
    thumbnailKey,
    visibility: 'PRIVATE' as const,
    questions,
  };

  let quiz: { id: number; publicId?: string };
  try {
    const res = await axios.post<ApiResponse<{ id: number; publicId?: string }>>(
      `${apiBase}/api/quizzes`,
      payload,
      { headers: auth },
    );
    quiz = res.data.data;
  } catch (e) {
    fail(`퀴즈 생성 실패: ${errMsg(e)}`);
  }

  console.log('\n✓ 게시 완료 (PRIVATE)');
  console.log(`  publicId : ${quiz.publicId ?? '(미반환)'}`);
  console.log(`  검토     : ${webBase}/profile/quizzes-made  (비공개 필터에서 확인 → 공개 토글)`);
  console.log('');
}

function errMsg(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const status = e.response?.status;
    const body = e.response?.data ? JSON.stringify(e.response.data) : '';
    if (status === 401) {
      return '401 Unauthorized — 토큰이 만료되었거나 잘못됨. 다시 발급하세요.';
    }
    return `HTTP ${status ?? '?'} ${body}`.trim();
  }
  return e instanceof Error ? e.message : String(e);
}

main().catch((e) => fail(errMsg(e)));
