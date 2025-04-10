const messages = {
  ko: {
    error: {
      title: '오류',
      default: '오류가 발생했습니다.',
      invalidFormat: '잘못된 형식입니다.',
      unauthorized: '권한이 없습니다.',
      notFound: '찾을 수 없습니다.',
      serverError: '서버 오류가 발생했습니다.'
    },
    button: {
      close: '닫기',
      confirm: '확인',
      cancel: '취소',
      save: '저장',
      delete: '삭제'
    }
  },
  en: {
    error: {
      title: 'Error',
      default: 'An error occurred.',
      invalidFormat: 'Invalid format.',
      unauthorized: 'Unauthorized.',
      notFound: 'Not found.',
      serverError: 'Server error occurred.'
    },
    button: {
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete'
    }
  }
};

export function getMessages(locale: string = 'ko') {
  return messages[locale as keyof typeof messages] || messages.ko;
} 