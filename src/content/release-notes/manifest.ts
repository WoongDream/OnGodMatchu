export type ReleaseNoteManifestItem = {
  version: string;
  publishedAt: string;
  title: string;
  bodyFile: string;
};

export const RELEASE_NOTES_MANIFEST: ReleaseNoteManifestItem[] = [
  {
    version: '1.1.0',
    publishedAt: '2026-06-29',
    title: '프로필·소셜 기능 확장과 문의하기',
    bodyFile: 'v1.1.0.md',
  },
  {
    version: '1.0.0',
    publishedAt: '2026-05-29',
    title: '첫 릴리즈',
    bodyFile: 'v1.0.0.md',
  },
];
