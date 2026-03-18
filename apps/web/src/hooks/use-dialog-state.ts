import { useCallback, useState } from "react";

type UseDialogStateOptions = {
  initialOpen?: boolean;
  onCloseReset?: () => void;
};

export function useDialogState(options: UseDialogStateOptions = {}) {
  const { initialOpen = false, onCloseReset } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        onCloseReset?.();
      }
    },
    [onCloseReset],
  );

  const openDialog = useCallback(() => setIsOpen(true), []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    onCloseReset?.();
  }, [onCloseReset]);

  return {
    closeDialog,
    handleOpenChange,
    isOpen,
    openDialog,
    setIsOpen,
  };
}
