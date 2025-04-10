'use client';

import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/messages';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  locale?: string;
}

export default function ErrorModal({ isOpen, onClose, title, message, locale = 'ko' }: ErrorModalProps) {
  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorModalContent
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        message={message}
      />
    </NextIntlClientProvider>
  );
}

function ErrorModalContent({ isOpen, onClose, title, message }: Omit<ErrorModalProps, 'locale'>) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onClose={onClose} as={Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-lg font-semibold text-red-600">
              {title || t('error.title')}
            </Dialog.Title>
            <button onClick={onClose}>
              <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <Dialog.Description className="text-gray-800 whitespace-pre-wrap">
            {message || t('error.default')}
          </Dialog.Description>
          <div className="mt-6 text-right">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={onClose}
            >
              {t('button.close')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}