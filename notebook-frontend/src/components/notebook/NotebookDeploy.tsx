import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Check, Copy } from 'lucide-react';
import { OutputDeployMessage } from '@/app/types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const DeploymentDialog = ({ isOpen, onOpenChange, data }: { isOpen: boolean, onOpenChange: (open: boolean) => void, data: OutputDeployMessage }) => {
  const [messages, setMessages] = useState<{ message: string, success: boolean }[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [ endpointURI, setEndpointURI ] = useState('');
  const [ copied, setCopied ] = useState(false);

  useEffect(() => {
    if (!data) return;

    if (data.message.startsWith("https://")) {
      setEndpointURI(data.message.trim());
    }
    else {
      setMessages(prev => [...prev, {
          message: data.message,
          success: data.success
      }]);
    }
    setCurrentMessageIndex(prev => prev + 1);

  }, [data]);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setCurrentMessageIndex(0);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!endpointURI) return;
    navigator.clipboard.writeText(endpointURI);
    setCopied(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deploying your Notebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex items-center space-x-3">
              {index === currentMessageIndex - 1 ? (
                msg.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )
              ) : index < currentMessageIndex ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5" />
              )}
              <span className="text-sm text-gray-700">{msg.message}</span>
            </div>
          ))}

          {endpointURI && (
            <Card className="mt-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <code className="text-sm font-mono text-muted-foreground">
                  {endpointURI}
                </code>
                <Button 
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;