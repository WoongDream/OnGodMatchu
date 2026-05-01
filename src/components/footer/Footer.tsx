import { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  wrapperStyle,
  innerStyle,
  brandColumnStyle,
  brandNameStyle,
  copyTextStyle,
  metaColumnStyle,
  footerLinkStyle,
  privacyLinkStyle,
  contactLinkStyle,
} from './Footer.style';

const CONTACT_EMAIL = 'ongodmatchu@gmail.com';

const Footer = memo(() => {
  return (
    <footer css={wrapperStyle}>
      <div css={innerStyle}>
        <div css={brandColumnStyle}>
          <span css={brandNameStyle}>OnGodMatchu</span>
          <span css={copyTextStyle}>© 2026 OnGodMatchu. All rights reserved.</span>
        </div>
        <div css={metaColumnStyle}>
          <Link to="/terms" css={footerLinkStyle}>
            이용약관
          </Link>
          <Link to="/privacy" css={privacyLinkStyle}>
            개인정보처리방침
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} css={contactLinkStyle}>
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
