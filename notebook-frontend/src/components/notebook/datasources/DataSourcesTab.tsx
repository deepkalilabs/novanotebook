import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Plus } from "lucide-react";

interface DataSourcesTabProps {
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

export function DataSourcesTab({ globalSources }: DataSourcesTabProps) {
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
                <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Source
                    </Button>
                </div>
            </CardContent>
            </Card>
    </div>
  );
}