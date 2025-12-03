import { useEffect } from 'react';

const BASE_TITLE = 'Наукові Знахідки';

export function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;

    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useTitle;
