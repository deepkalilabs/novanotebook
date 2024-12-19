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
    posthogSetup: (userId: string, apiKey: string, baseUrl: string) => void;
}   



export function SourcesTab({ globalSources, posthogSetup }: SourcesTabProps) {
  console.log(globalSources);
    // const g = [
    //     {
    //       name: 'PostHog Production',
    //       type: 'posthog',
    //       status: 'connected'
    //     },
    //     {
    //       name: 'OpenAI',
    //       type: 'llm',
    //       status: 'connected'
    //     },
    //     {
    //       name: 'Customer Database',
    //       type: 'postgresql',
    //       status: 'connected'
    //     }
    //   ];

  return (
    <div className="flex items-center space-x-4">
        <Card className="mb-0">
            <CardContent className="py-0">
                <div className="flex items-center space-x-3">
                    {/* <span className="text-xs text-muted-foreground">Global Data Sources:</span>
                    {g.map(source => (
                        <Badge key={source.name} variant="secondary" className="text-xs">
                            <Database className="w-2 h-2 mr-1" />
                            {source.name}
                        </Badge>
                    ))} */}
                    <SourcesSheet posthogSetup={posthogSetup} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}