import { describe, it, expect } from 'vitest';
import { parseUserAgent, formatDeviceLabel, type DeviceInfo } from './userAgent';

// 실제 브라우저 UA 문자열 샘플
const UA = {
  chromeOnMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  edgeOnWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  firefoxOnWindows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  safariOnIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  chromeOnAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  operaOnMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0',
  chromiumOnLinux:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/124.0.0.0 Chrome/124.0.0.0 Safari/537.36',
  unknown: 'UnknownAgent/1.0',
};

describe('parseUserAgent', () => {
  describe('빈/알 수 없는 입력', () => {
    it('빈 문자열은 { browser: null, os: null } 을 반환한다', () => {
      expect(parseUserAgent('')).toEqual({ browser: null, os: null });
    });

    it('알 수 없는 UA 문자열은 { browser: null, os: null } 을 반환한다', () => {
      expect(parseUserAgent(UA.unknown)).toEqual({ browser: null, os: null });
    });
  });

  describe('브라우저 감지', () => {
    it('Chrome UA 는 browser="Chrome" 을 반환한다', () => {
      expect(parseUserAgent(UA.chromeOnMac).browser).toBe('Chrome');
    });

    it('Edge UA (Edg/) 는 browser="Edge" 를 반환한다', () => {
      expect(parseUserAgent(UA.edgeOnWindows).browser).toBe('Edge');
    });

    it('Firefox UA 는 browser="Firefox" 를 반환한다', () => {
      expect(parseUserAgent(UA.firefoxOnWindows).browser).toBe('Firefox');
    });

    it('iPhone Safari UA 는 browser="Safari" 를 반환한다', () => {
      expect(parseUserAgent(UA.safariOnIphone).browser).toBe('Safari');
    });

    it('Opera UA (OPR/) 는 browser="Opera" 를 반환한다', () => {
      expect(parseUserAgent(UA.operaOnMac).browser).toBe('Opera');
    });

    it('Chromium UA 는 Chrome 로 감지되지 않는다', () => {
      // /Chrome\// 은 매치되지만 /Chromium/ 도 매치 → 제외 조건
      expect(parseUserAgent(UA.chromiumOnLinux).browser).not.toBe('Chrome');
    });
  });

  describe('OS 감지', () => {
    it('Macintosh UA 는 os="macOS" 를 반환한다', () => {
      expect(parseUserAgent(UA.chromeOnMac).os).toBe('macOS');
    });

    it('Windows NT UA 는 os="Windows" 를 반환한다', () => {
      expect(parseUserAgent(UA.firefoxOnWindows).os).toBe('Windows');
    });

    it('Android UA 는 os="Android" 를 반환한다', () => {
      expect(parseUserAgent(UA.chromeOnAndroid).os).toBe('Android');
    });

    it('iPhone UA 는 os="iOS" 를 반환한다', () => {
      expect(parseUserAgent(UA.safariOnIphone).os).toBe('iOS');
    });

    it('Linux UA 는 os="Linux" 를 반환한다', () => {
      // Chromium on Linux: Chrome 제외되지만 Linux는 감지
      expect(parseUserAgent(UA.chromiumOnLinux).os).toBe('Linux');
    });

    it('iPhone UA 는 macOS 로 잘못 감지되지 않는다 (iPhone 예외 처리)', () => {
      // iPhone UA 에 "Mac OS X" 가 포함되지만 iPhone 예외로 iOS 로 분류
      expect(parseUserAgent(UA.safariOnIphone).os).toBe('iOS');
      expect(parseUserAgent(UA.safariOnIphone).os).not.toBe('macOS');
    });
  });

  describe('조합 결과', () => {
    it('Chrome on macOS UA → { browser: "Chrome", os: "macOS" }', () => {
      expect(parseUserAgent(UA.chromeOnMac)).toEqual({ browser: 'Chrome', os: 'macOS' });
    });

    it('Edge on Windows UA → { browser: "Edge", os: "Windows" }', () => {
      expect(parseUserAgent(UA.edgeOnWindows)).toEqual({ browser: 'Edge', os: 'Windows' });
    });

    it('Firefox on Windows UA → { browser: "Firefox", os: "Windows" }', () => {
      expect(parseUserAgent(UA.firefoxOnWindows)).toEqual({ browser: 'Firefox', os: 'Windows' });
    });

    it('Safari on iPhone UA → { browser: "Safari", os: "iOS" }', () => {
      expect(parseUserAgent(UA.safariOnIphone)).toEqual({ browser: 'Safari', os: 'iOS' });
    });

    it('Chrome on Android UA → { browser: "Chrome", os: "Android" }', () => {
      expect(parseUserAgent(UA.chromeOnAndroid)).toEqual({ browser: 'Chrome', os: 'Android' });
    });
  });
});

describe('formatDeviceLabel', () => {
  it('browser 와 os 가 모두 있으면 "Chrome · macOS" 형식으로 반환한다', () => {
    const info: DeviceInfo = { browser: 'Chrome', os: 'macOS' };
    expect(formatDeviceLabel(info)).toBe('Chrome · macOS');
  });

  it('browser 만 있으면 browser 단독 반환한다', () => {
    const info: DeviceInfo = { browser: 'Chrome', os: null };
    expect(formatDeviceLabel(info)).toBe('Chrome');
  });

  it('os 만 있으면 os 단독 반환한다', () => {
    const info: DeviceInfo = { browser: null, os: 'macOS' };
    expect(formatDeviceLabel(info)).toBe('macOS');
  });

  it('browser 와 os 가 모두 null 이면 빈 문자열을 반환한다', () => {
    const info: DeviceInfo = { browser: null, os: null };
    expect(formatDeviceLabel(info)).toBe('');
  });

  it('구분자가 정확히 " · " (공백 포함 가운뎃점) 이다', () => {
    const info: DeviceInfo = { browser: 'Firefox', os: 'Windows' };
    const label = formatDeviceLabel(info);
    expect(label).toContain(' · ');
    expect(label.split(' · ')).toEqual(['Firefox', 'Windows']);
  });

  it('parseUserAgent 결과를 그대로 받아 레이블을 만든다', () => {
    const info = parseUserAgent(UA.chromeOnMac);
    expect(formatDeviceLabel(info)).toBe('Chrome · macOS');
  });
});
