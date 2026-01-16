import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { NonRetriableError } from "inngest";


export type InspectionStartedEventArgs = {
  data: {
    inspectionId: string;
  };
};

export const inspectionStartedEvent = inngest.createFunction(
  { id: "inspection-started" },
  { event: "app/inspection.started" },
  async ({ event , step }) =>  {
    const {
      inspectionId
    } = event.data;

   
    await step.run("call-fastapi", async () => {
      //console.log("Secret Length:", (process.env.INTERNAL_SERVICE_SECRET || "").length);
      const response = await fetch(`${process.env.FASTAPI_URL}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret": process.env.INTERNAL_SERVICE_SECRET || "",
        },
        body: JSON.stringify({
          inspectionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI processing failed: ${response.statusText}`);
      }

      return await response.json();
    });

    return { ok: true, inspectionId };
  }
);