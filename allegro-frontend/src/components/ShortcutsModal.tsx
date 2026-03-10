"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["Space"], description: "Play / Pause" },
  { keys: ["→"], description: "Next song" },
  { keys: ["←"], description: "Previous song" },
  { keys: ["M"], description: "Mute / Unmute" },
  { keys: ["Ctrl", "K"], description: "Open search" },
  { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
  { keys: ["/"], description: "Show shortcuts" },
];

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 [&>button]:hidden"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          maxWidth: "400px",
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </VisuallyHidden>
        <div className="px-6 pt-6 pb-2">
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Keyboard Shortcuts
          </h2>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Press{" "}
            <kbd
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              /
            </kbd>{" "}
            anytime to open this
          </p>
        </div>
        <div className="flex flex-col px-6 py-4 gap-3">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between"
            >
              <span className="text-sm" style={{ color: "var(--foreground)" }}>
                {s.description}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="text-xs px-2 py-1 rounded font-mono"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg text-sm transition-all hover:opacity-80"
            style={{
              background: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
