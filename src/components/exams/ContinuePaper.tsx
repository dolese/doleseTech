"use client";

import { useEffect, useState } from "react";
import { listJobs } from "@/lib/examJobs";
import { readDraft } from "@/lib/examLibrary";

/** For a teacher coming back: a way straight back to the paper they left. */
export default function ContinuePaper() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const job = listJobs()[0];
    if (job) setMessage(`The panel is writing “${job.title}”.`);
    else if (readDraft()) setMessage("Your last paper is waiting where you left it.");
  }, []);

  if (!message) return null;
  return (
    <div className="xl-continue" role="status">
      <span>{message}</span>
      <a href="/exams/write">Open it →</a>
    </div>
  );
}
