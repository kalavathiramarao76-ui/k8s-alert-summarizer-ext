import { useState, useEffect, useCallback, useRef } from 'react';
import type { MessagePayload } from './types';

export function useStreaming() {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handler = (message: MessagePayload) => {
      if (message.requestId && message.requestId !== requestIdRef.current) return;

      switch (message.type) {
        case 'STREAM_CHUNK':
          setOutput((prev) => prev + (message.data as string));
          break;
        case 'STREAM_DONE':
          setIsStreaming(false);
          break;
        case 'STREAM_ERROR':
          setError(message.data as string);
          setIsStreaming(false);
          break;
      }
    };

    chrome.runtime?.onMessage?.addListener(handler);
    return () => {
      chrome.runtime?.onMessage?.removeListener(handler);
    };
  }, []);

  const send = useCallback((type: MessagePayload['type'], data: unknown) => {
    setOutput('');
    setError(null);
    setIsStreaming(true);
    const requestId = crypto.randomUUID();
    requestIdRef.current = requestId;

    chrome.runtime.sendMessage({ type, data, requestId }, (response) => {
      if (response?.requestId) {
        requestIdRef.current = response.requestId;
      }
    });
  }, []);

  const reset = useCallback(() => {
    setOutput('');
    setError(null);
    setIsStreaming(false);
    requestIdRef.current = null;
  }, []);

  return { output, isStreaming, error, send, reset };
}
