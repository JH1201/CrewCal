export function uuid() {
  // RN/Expo: crypto.randomUUID may not exist on all runtimes
  const g: any = globalThis as any;
  const c = g?.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();

  // Fallback (UI ids)
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
