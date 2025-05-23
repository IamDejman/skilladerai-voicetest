import { useState, useCallback } from 'react';

type CopyFn = (text: string) => void;
type CopyToClipboardReturnType = [boolean, CopyFn];

export function useCopyToClipboard(): CopyToClipboardReturnType {
  const [isCopied, setIsCopied] = useState(false);

  const copy: CopyFn = useCallback((text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return;
    }

    // Try to save to clipboard then save it in the state
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.warn('Copy failed', error);
        setIsCopied(false);
      });
  }, []);

  return [isCopied, copy];
}