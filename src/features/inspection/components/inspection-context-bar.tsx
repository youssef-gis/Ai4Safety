import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LucideCloudSun, LucideCpu, LucidePlane, LucideWifi } from "lucide-react";

export type InspectionContextType = {
    weather: string;
    temperature: string;
    droneModel: string;
    aiModelVersion: string;
    aiConfidence: number;
}

export const InspectionContextBar = ({ data }: { data: InspectionContextType }) => {
    return (
        <div className="flex items-center gap-6 px-4 py-2 bg-card border-b border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
                <LucideCloudSun className="h-3.5 w-3.5" />
                <span>{data.weather}, {data.temperature}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
                <LucidePlane className="h-3.5 w-3.5" />
                <span>{data.droneModel}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
                <LucideCpu className="h-3.5 w-3.5" />
                <span>Model: {data.aiModelVersion}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <span className="hidden sm:inline">AI Confidence Score:</span>
                <Badge variant={data.aiConfidence > 80 ? "default" : "secondary"} className="text-[10px] h-5">
                    {data.aiConfidence}%
                </Badge>
            </div>
        </div>
    );
}