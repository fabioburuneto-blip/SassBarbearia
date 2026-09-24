"use client";

import { HoursForm } from "@/app/dashboard/hours/hours-form";

export function StepHours({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900">
        Horário de funcionamento
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Já deixamos um horário comum pré-preenchido (seg-sáb, 09:00–18:00).
        Ajuste se precisar e salve para continuar.
      </p>

      <div className="mt-6">
        <HoursForm
          hoursByDay={new Map()}
          submitLabel="Salvar e continuar"
          onSaved={onNext}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="text-sm text-zinc-500 hover:text-zinc-700 hover:underline"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}
