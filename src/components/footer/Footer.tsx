import { memo } from 'react';
import {
  FooterWrapper,
  FooterInner,
  BrandColumn,
  BrandName,
  CopyText,
  MetaColumn,
  FooterLink,
  PrivacyLink,
  ContactLink,
} from './Footer.style';

const CONTACT_EMAIL = 'ongodmatchu@gmail.com';

const Footer = memo(() => {
  return (
    <FooterWrapper>
      <FooterInner>
        <BrandColumn>
          <BrandName>OnGodMatchu</BrandName>
          <CopyText>© 2026 OnGodMatchu. All rights reserved.</CopyText>
        </BrandColumn>
        <MetaColumn>
          <FooterLink to="/terms">이용약관</FooterLink>
          <PrivacyLink to="/privacy">개인정보처리방침</PrivacyLink>
          <ContactLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</ContactLink>
        </MetaColumn>
      </FooterInner>
    </FooterWrapper>
  );
});

Footer.displayName = 'Footer';
export default Footer;
