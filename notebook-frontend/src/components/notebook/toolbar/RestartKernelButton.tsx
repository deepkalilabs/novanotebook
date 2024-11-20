'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RestartKernelButtonProps {
  onHandleRestartKernel?: () => Promise<void>;
  isConnected: boolean;
}

export function RestartKernelButton({ 
  onHandleRestartKernel,
  isConnected 
}: RestartKernelButtonProps) {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestartKernel = async () => {
    setIsRestarting(true);
    console.log('Restarting kernel...');
    try {
      await onHandleRestartKernel?.();
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleRestartKernel}
      disabled={!isConnected || isRestarting}
    >
      {isRestarting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Restarting...
        </>
      ) : (
        <>
          <RotateCcw className="h-4 w-4" />
          Restart Kernel
        </>
      )}
    </Button>
  );
} 