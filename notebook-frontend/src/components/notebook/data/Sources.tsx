import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";
import { SourcesSheet } from "./SourcesSheet";

interface SourcesTabProps {
    globalSources: {
        name: string;
        type: string;
        status: string;
    }[];
}   

const globalSources = [
    {
      name: 'PostHog Production',
      type: 'posthog',
      status: 'connected'
    },
    {
      name: 'OpenAI',
      type: 'llm',
      status: 'connected'
    },
    {
      name: 'Customer Database',
      type: 'postgresql',
      status: 'connected'
    }
  ];

export function SourcesTab({ globalSources }: SourcesTabProps) {
    const g = [
        {
          name: 'PostHog Production',
          type: 'posthog',
          status: 'connected'
        },
        {
          name: 'OpenAI',
          type: 'llm',
          status: 'connected'
        },
        {
          name: 'Customer Database',
          type: 'postgresql',
          status: 'connected'
        }
      ];

  return (
    <div className="flex items-center space-x-4">
        <Card className="mb-4">
            <CardContent className="py-3">
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Global Data Sources:</span>
                    {g.map(source => (
                        <Badge key={source.name} variant="secondary">
                            <Database className="w-3 h-3 mr-1" />
                            {source.name}
                        </Badge>
                    ))}
                    <SourcesSheet />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}