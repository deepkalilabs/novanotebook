import { useState, useCallback } from 'react';

export default function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  return [value, toggle];
}
