"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Icon name="book" size={16} /> Print / Save as PDF
    </Button>
  );
}
