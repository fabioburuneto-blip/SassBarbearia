import { cn } from "@/lib/cn";

const STEP_LABELS = [
  "Empresa",
  "Segmento",
  "WhatsApp",
  "Instagram",
  "Localização",
  "Endereço público",
  "Tema",
  "Serviços",
  "Horários",
] as const;

export function ProgressBar({ step }: { step: number }) {
  const total = STEP_LABELS.length;
  const percent = Math.round((step / total) * 100);

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Passo {step} de {total}
        </span>
        <span className="font-medium text-zinc-700">
          {STEP_LABELS[step - 1]}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className={cn(
            "h-full rounded-full bg-zinc-900 transition-all duration-300",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
