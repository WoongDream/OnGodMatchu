export type DeviceInfo = {
  browser: string | null;
  os: string | null;
};

export const parseUserAgent = (ua: string): DeviceInfo => {
  if (!ua) {
    return { browser: null, os: null };
  }

  let browser: string | null = null;
  if (/Edg\//.test(ua)) {
    browser = 'Edge';
  } else if (/OPR\//.test(ua) || /Opera/.test(ua)) {
    browser = 'Opera';
  } else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    browser = 'Chrome';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Safari\//.test(ua)) {
    browser = 'Safari';
  }

  let os: string | null = null;
  if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) {
    os = 'macOS';
  } else if (/Windows NT/.test(ua)) {
    os = 'Windows';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  return { browser, os };
};

export const formatDeviceLabel = (info: DeviceInfo): string => {
  const parts = [info.browser, info.os].filter(Boolean);
  return parts.join(' · ');
};
