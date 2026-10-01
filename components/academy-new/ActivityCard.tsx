"use client";

import type { ActivityDef } from "@/content/academy/types";
import { Icon } from "@/components/ui/Icon";
import { useLessonProgress } from "./LessonProgressContext";
import { ApplicationsSpotter } from "./activities/ApplicationsSpotter";
import { RoadmapBuilder } from "./activities/RoadmapBuilder";
import { SupervisedSorter } from "./activities/SupervisedSorter";
import { TaskChooser } from "./activities/TaskChooser";
import { MetricDetective } from "./activities/MetricDetective";
import { WorkflowOrdering } from "./activities/WorkflowOrdering";
import { FlexSlider } from "./activities/FlexSlider";
import { OverfittingDetective } from "./activities/OverfittingDetective";

/**
 * Interactive exercise card. Every lesson's activity teaches by doing:
 * the student interacts first, the explanation follows - and the step
 * only counts as done after genuine engagement.
 */

const REGISTRY: Record<
  ActivityDef["kind"],
  (props: { onComplete?: () => void; done?: boolean }) => React.JSX.Element
> = {
  "applications-spotter": (p) => <ApplicationsSpotter {...p} />,
  "roadmap-builder": (p) => <RoadmapBuilder {...p} />,
  "supervised-sorter": (p) => <SupervisedSorter {...p} />,
  "task-chooser": (p) => <TaskChooser {...p} />,
  "metric-detective": (p) => <MetricDetective {...p} />,
  "workflow-ordering": (p) => <WorkflowOrdering {...p} />,
  "flexibility-slider": (p) => <FlexSlider {...p} />,
  "overfitting-detective": (p) => <OverfittingDetective {...p} />,
};

export function ActivityCard({ def, lessonId }: { def: ActivityDef; lessonId: string }) {
  const { markDone, isDone } = useLessonProgress();
  const sectionId = `${lessonId}-activity`;
  const done = isDone(sectionId);
  const Activity = REGISTRY[def.kind];

  return (
    <section
      aria-label={def.heading}
      className="rounded-xl border border-pulse-400/30 bg-void-900 px-5 py-5 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-pulse-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pulse-700 dark:text-pulse-300">
          Interactive exercise
        </span>
        {done && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-mint-700 dark:text-mint-300">
            <Icon name="check" size={13} aria-hidden="true" /> Done
          </span>
        )}
      </div>
      <h2 className="mt-2.5 font-display text-xl font-bold text-ink">{def.heading}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{def.intro}</p>
      <div className="mt-4">
        {Activity ? <Activity onComplete={() => markDone(sectionId)} done={done} /> : null}
      </div>
    </section>
  );
}
