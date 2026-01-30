import { ReactNode } from "react";

export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div
        className={[
          "fixed inset-0 bg-black/30 transition-opacity z-30",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />
      <div
        className={[
          "fixed top-0 left-0 h-full w-[280px] bg-white border-r border-zinc-200 shadow-xl transition-transform z-40",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
