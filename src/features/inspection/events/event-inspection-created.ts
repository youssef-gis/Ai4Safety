import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";


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

    // Example: Call FastAPI /process-job endpoint
    await step.run("call-fastapi", async () => {
      const response = await fetch(`${process.env.FASTAPI_URL}/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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