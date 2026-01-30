import { ReactNode } from "react";

export function SlidePanel({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className={[
        "fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-zinc-200 shadow-xl transition-transform z-40",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="font-medium">{title}</div>
        <button className="text-sm px-2 py-1 rounded-md hover:bg-zinc-100" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="p-4 overflow-auto h-[calc(100%-56px)]">{children}</div>
    </div>
  );
}
