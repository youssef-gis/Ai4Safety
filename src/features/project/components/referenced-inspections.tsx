import { LucideArrowUpRightFromSquare } from "lucide-react";
import Link from "next/link";
import { CardElement } from "@/components/card-compact";
import { projectPath } from "@/path";
import { getReferencedInspections } from "../queries/get-referenced-inspections";
import { format } from "date-fns";

type ReferencedInspectionsProps = {
  inspectionId: string;
};

const ReferencedInspections = async ({ inspectionId }: ReferencedInspectionsProps) => {
  const referencedInspections = await getReferencedInspections(inspectionId);

  if (!referencedInspections.length) return null;

  return (
    <CardElement
      title="Referenced Inspections"
      description="Inspections that have been referenced in comments"
      content={
        <div className="mx-2 mb-4">
          {referencedInspections.map((referencedInspection) => (
            <div key={referencedInspection.id}>
              <Link
                className="flex gap-x-2 items-center text-sm"
                href={projectPath(referencedInspection.id)}
              >
                <LucideArrowUpRightFromSquare className="h-4 w-4" />
                {format(referencedInspection.inspectionDate, "yyyy-MM-dd")}
              </Link>
            </div>
          ))}
        </div>
      }
    />
  );
};

export { ReferencedInspections };