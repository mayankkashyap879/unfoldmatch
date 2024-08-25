// hooks/useScrollToBottom.ts
import { useEffect, useRef } from 'react';

export const useScrollToBottom = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return { ref, scrollToBottom };
};