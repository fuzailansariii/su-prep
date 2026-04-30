import { useRef, useState } from "react";

export default function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef<(val: boolean) => void | null>(null);

  const confirm = () => {
    setIsOpen(true);
    return new Promise<boolean>((res) => {
      resolveRef.current = res;
    });
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setIsOpen(false);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, confirm, handleCancel, handleConfirm, close };
}
