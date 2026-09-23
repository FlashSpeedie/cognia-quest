"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

/**
 * Learning-activity month calendar (not a scheduler): each day cell shows a
 * subtle marker for lessons, quiz submissions, missions, and lab runs that
 * already happened. Uses the persisted activity stream passed from the
 * dashboard - no synthetic data is ever drawn.
 */
export function ActivityCalendar({ activityByDay }: { activityByDay: [string, number][] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const counts = useMemo(() => new Map(activityByDay), [activityByDay]);
  const today = new Date();
  const todayKey = isoDay(today.getFullYear(), today.getMonth(), today.getDate());

  const grid = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      const d = new Date(c.year, m, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-ink">Learning activity</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="px-2"
          >
            <Icon name="arrow-left" size={15} />
          </Button>
          <p className="min-w-28 text-center text-sm font-semibold text-ink" aria-live="polite">
            {monthLabel}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="px-2"
          >
            <Icon name="arrow-right" size={15} />
          </Button>
        </div>
      </div>

      <table className="mt-4 w-full table-fixed border-collapse" role="grid" aria-label={`Learning activity for ${monthLabel}`}>
        <thead>
          <tr role="row">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <th key={d} role="columnheader" scope="col" className="pb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((week, w) => (
            <tr key={w} role="row">
              {week.map((cell, ci) => {
                if (!cell) return <td key={`pad-${ci}`} role="gridcell" className="p-0.5" />;
                const key = isoDay(cursor.year, cursor.month, cell);
                const count = counts.get(key) ?? 0;
                const isToday = key === todayKey;
                const label = `${new Date(cursor.year, cursor.month, cell).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${count > 0 ? `, ${count} learning ${count === 1 ? "activity" : "activities"}` : ", no activity"}`;
                return (
                  <td key={key} role="gridcell" className="p-0.5">
                    <div
                      aria-label={label}
                      title={label}
                      className={`flex h-9 flex-col items-center justify-center rounded-md text-xs font-medium transition-colors sm:h-10 ${
                        isToday
                          ? "border border-pulse-600 bg-pulse-50 font-bold text-pulse-700 dark:bg-pulse-950/50 dark:text-pulse-700 dark:text-pulse-300"
                          : "text-ink-dim"
                      }`}
                    >
                      {cell}
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 h-1 rounded-full ${
                          count >= 3 ? "w-4 bg-pulse-600" : count === 2 ? "w-3 bg-pulse-500" : count === 1 ? "w-1.5 bg-pulse-400" : "w-1.5 bg-transparent"
                        }`}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-ink-faint">
        A dot marks days with at least one completed learning action. Longer marks mean busier days.
      </p>
    </Card>
  );
}

function isoDay(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Weeks (Mon-first) of the month; nulls pad the ends. */
function buildMonth(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadBlanks = (first.getDay() + 6) % 7; // Monday-first offset
  const cells: (number | null)[] = [...Array<number | null>(leadBlanks).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
