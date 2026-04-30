const FEEDBACK_KO: Record<string, string> = {
  'Use a few words, avoid common phrases': '여러 단어를 조합하고 흔한 구절은 피하세요.',
  'No need for symbols, digits, or uppercase letters': '기호·숫자·대문자가 꼭 필요하지는 않습니다.',
  'Add another word or two. Uncommon words are better.':
    '한두 단어를 더 추가하세요. 흔하지 않은 단어가 좋습니다.',
  'Use a longer keyboard pattern with more turns': '키보드 패턴을 더 길게, 방향을 자주 바꾸세요.',
  'Avoid repeated words and characters': '반복되는 단어와 문자를 피하세요.',
  'Avoid sequences': '연속된 문자를 피하세요.',
  'Avoid recent years': '최근 연도는 피하세요.',
  'Avoid years that are associated with you': '본인과 관련된 연도는 피하세요.',
  'Avoid dates and years that are associated with you': '본인과 관련된 날짜·연도는 피하세요.',
  "Capitalization doesn't help very much": '대문자만 섞는 것은 큰 도움이 되지 않습니다.',
  'All-uppercase is almost as easy to guess as all-lowercase':
    '전부 대문자는 전부 소문자만큼 쉽게 추측됩니다.',
  "Reversed words aren't much harder to guess": '거꾸로 쓴 단어도 추측이 크게 어렵지 않습니다.',
  "Predictable substitutions like '@' instead of 'a' don't help very much":
    "'a' 를 '@' 로 바꾸는 것 같은 흔한 치환은 큰 도움이 되지 않습니다.",
  'Straight rows of keys are easy to guess': '키보드 한 줄로 된 비밀번호는 쉽게 추측됩니다.',
  'Short keyboard patterns are easy to guess': '짧은 키보드 패턴은 쉽게 추측됩니다.',
  'Repeats like "aaa" are easy to guess': '"aaa" 같은 반복은 쉽게 추측됩니다.',
  'Repeats like "abcabcabc" are only slightly harder to guess than "abc"':
    '"abcabcabc" 같은 반복은 "abc" 보다 약간 더 안전할 뿐입니다.',
  'Sequences like abc or 6543 are easy to guess': 'abc, 6543 같은 연속된 문자는 쉽게 추측됩니다.',
  'Recent years are easy to guess': '최근 연도는 쉽게 추측됩니다.',
  'Dates are often easy to guess': '날짜는 흔히 쉽게 추측됩니다.',
  'This is a top-10 common password': '가장 많이 쓰이는 10대 비밀번호 중 하나입니다.',
  'This is a top-100 common password': '가장 많이 쓰이는 100대 비밀번호 중 하나입니다.',
  'This is a very common password': '매우 흔한 비밀번호입니다.',
  'This is similar to a commonly used password': '자주 쓰이는 비밀번호와 비슷합니다.',
  'A word by itself is easy to guess': '단어 하나만으로는 쉽게 추측됩니다.',
  'Names and surnames by themselves are easy to guess': '이름이나 성씨만으로는 쉽게 추측됩니다.',
  'Common names and surnames are easy to guess': '흔한 이름이나 성씨는 쉽게 추측됩니다.',
};

export const translateFeedback = (text: string): string => {
  if (!text) {
    return '';
  }
  return FEEDBACK_KO[text] ?? text;
};

const CRACK_TIMES_LITERAL: Record<string, string> = {
  'less than a second': '1초 미만',
  'less than a minute': '1분 미만',
  centuries: '수세기',
};

const CRACK_TIME_UNIT_KO: Record<string, string> = {
  second: '초',
  minute: '분',
  hour: '시간',
  day: '일',
  month: '개월',
  year: '년',
};

export const translateCrackTimes = (text: string): string => {
  if (!text) {
    return '';
  }
  if (CRACK_TIMES_LITERAL[text]) {
    return CRACK_TIMES_LITERAL[text];
  }
  const m = text.match(/^(\d+)\s+(\w+?)s?$/);
  if (m) {
    const [, n, unit] = m;
    const ko = CRACK_TIME_UNIT_KO[unit];
    if (ko) {
      return `${n}${ko}`;
    }
  }
  return text;
};
