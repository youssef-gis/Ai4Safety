import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // min-h-screen ensures it covers at least the full window
    // No "overflow-hidden" here, so the page can scroll normally
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {children}
    </div>
  );
}