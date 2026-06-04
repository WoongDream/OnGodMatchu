import { memo } from 'react';
import { wrapperStyle, titleStyle, descStyle } from './InquiryPage.style';

/** 문의하기 화면 — 추후 개발 예정. 알림 modal "문의하기" 버튼의 도착지(stub). */
const InquiryPage = memo(() => (
  <div css={wrapperStyle}>
    <h1 css={titleStyle}>문의하기</h1>
    <p css={descStyle}>문의 기능은 준비 중이에요. 곧 만나요!</p>
  </div>
));

InquiryPage.displayName = 'InquiryPage';
export default InquiryPage;
