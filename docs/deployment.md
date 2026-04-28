# Deployment Guide

OnGodMatchu 프론트엔드의 배포 인프라와 운영 가이드.

## 인프라 구성

```
[GitHub] ──push──> [GitHub Actions] ──build──> [S3]
                          │                      │
                          │ invalidate           │ origin
                          ▼                      ▼
                    [CloudFront]  ◄────────────────
                          │
                          │ HTTPS
                          ▼
                  [Cloudflare DNS]
                          │
                          ▼
                       [User]
```

| 영역 | 구성 |
|------|------|
| Static Hosting | AWS S3 (`ongodmatchu-frontend`) |
| CDN | AWS CloudFront (글로벌 엣지 캐싱) |
| TLS | AWS ACM (us-east-1, 자동 갱신) |
| DNS | Cloudflare (DNS only 모드) |
| Build | Vite (TypeScript + React) |
| CI/CD | GitHub Actions |

## 도메인 / 인증서

| 도메인 | 용도 | TLS |
|--------|------|-----|
| `ongodmatchu.com` | 메인 도메인 | CloudFront + ACM |
| `www.ongodmatchu.com` | alias | CloudFront + ACM |

ACM 인증서는 CloudFront 요구사항에 따라 **us-east-1 (버지니아 북부) 리전**에서 발급.  
DNS 기반 자동 갱신.

## CI/CD 흐름

`main` 브랜치에 push 하면 GitHub Actions가 자동으로 빌드 → 배포한다.

```
git push origin main
        │
        ▼
GitHub Actions
  ├─ npm ci
  ├─ Vite production build (→ dist/)
  ├─ S3 sync (변경된 파일만 업로드, 삭제된 파일 정리)
  │   ├─ 정적 자원: 1년 캐시 (immutable)
  │   └─ index.html: no-cache (즉시 반영)
  └─ CloudFront 캐시 무효화 (/*)
        │
        ▼
사용자에게 즉시 배포 반영 (~30초)
```

워크플로우 정의: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

## SPA 라우팅 처리

React Router의 클라이언트 사이드 라우팅을 위해 **CloudFront 에러 응답 설정** 필요.

| HTTP 코드 | 응답 | 응답 코드 |
|-----------|------|----------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

→ S3에 없는 경로(`/quiz/123` 등)도 `index.html` 반환 → React Router가 라우팅 처리.

## 캐시 전략

배포 자동 반영을 위한 캐시 헤더 분리.

| 파일 | Cache-Control | 이유 |
|------|---------------|------|
| `assets/*.js`, `*.css`, 이미지 | `public, max-age=31536000, immutable` | Vite가 파일명에 해시 포함 → 1년 캐시 안전 |
| `index.html` | `public, max-age=0, must-revalidate` | 매번 검증 → 새 배포 즉시 반영 |
| `*.map` | 업로드 제외 | 소스맵 노출 방지 |

CloudFront 캐시는 배포마다 `/*` 무효화로 강제 갱신.

## GitHub Secrets

| 변수 | 설명 |
|------|------|
| `AWS_ACCESS_KEY_ID` | S3 + CloudFront 접근용 IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Access Key |
| `S3_BUCKET_NAME` | `ongodmatchu-frontend` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront 배포 ID |

IAM 사용자(`github-actions-frontend`)는 다음 권한만 가진다:
- `s3:ListBucket`, `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` (대상 버킷 한정)
- `cloudfront:CreateInvalidation`, `cloudfront:GetInvalidation`

## 백엔드 연동

API 요청은 별도 도메인의 백엔드로 전송된다.

| 환경 | API Base URL |
|------|--------------|
| 로컬 | `http://localhost:8080` |
| 운영 | `https://api.ongodmatchu.com` |

CORS는 백엔드에서 `https://ongodmatchu.com`, `https://www.ongodmatchu.com` 을 허용 origin으로 등록.

## 운영 명령어

### 수동 배포 (긴급 시)

```bash
# 빌드
npm run build

# AWS 자격증명 설정 후
aws s3 sync dist/ s3://ongodmatchu-frontend --delete
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

### CloudFront 캐시 강제 무효화

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

### 배포 상태 확인

```bash
# 현재 배포된 index.html 확인
curl -I https://ongodmatchu.com

# 캐시 헤더 확인
curl -I https://ongodmatchu.com/assets/index-abc123.js
```

## 트러블슈팅

### 배포 후 화면이 안 바뀜

1. CloudFront 무효화 진행 중일 수 있음 (보통 1~2분)
2. 브라우저 캐시 → 시크릿 창에서 확인
3. 강제 새로고침: `Cmd + Shift + R` (Mac) / `Ctrl + F5` (Windows)

### 새로고침 시 404 에러

CloudFront 에러 응답 설정 누락. SPA 라우팅 처리 섹션 참고.

### S3 직접 접근 시 AccessDenied

정상 동작. CloudFront OAC(Origin Access Control)로만 접근 가능하도록 설정됨.  
사용자는 `https://ongodmatchu.com` 으로만 접근.

### GitHub Actions 권한 오류

IAM 사용자(`github-actions-frontend`) 권한 정책 확인:
- 정책 이름: `GitHubActions-FrontendDeploy`
- 대상 리소스: `arn:aws:s3:::ongodmatchu-frontend/*`

## 비용 구조 (월 기준)

| 항목 | 비용 (USD) | 비고 |
|------|-----------|------|
| S3 스토리지 (~50MB) | ~$0.001 | |
| S3 요청 | ~$0 | CloudFront가 대부분 캐싱 |
| CloudFront 데이터 전송 (~10GB) | ~$0 | 1TB 무료 한도 (12개월) |
| CloudFront 요청 | ~$0 | 천만 건 무료 한도 (12개월) |
| ACM 인증서 | $0 | CloudFront 한정 무료 |
| Cloudflare DNS | $0 | 무료 |
| **합계** | **~$0** | 일반적인 트래픽 기준 |

도메인 (`ongodmatchu.com`) 은 별도, 연 약 $10 (Cloudflare).