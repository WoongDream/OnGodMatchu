import { memo } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * 레거시 진입점(`/inquiry`) — 실제 문의하기 화면은 프로필 LNB 탭(`/profile/inquiries`)으로 이동했다.
 * 알림 모달·정지 안내의 "문의하기" 버튼이 가리키던 경로라 리다이렉트로 호환 유지.
 */
const InquiryPage = memo(() => <Navigate to="/profile/inquiries" replace />);

InquiryPage.displayName = 'InquiryPage';
export default InquiryPage;
