"use client";

import { useActionState } from "react";
import { createEventAction, type FormState } from "@/app/actions";

export default function EventForm({ bandId }: { bandId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createEventAction, {});

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="bandId" value={bandId} />
      <label>
        公演名
        <input name="title" required maxLength={100} />
      </label>
      <label>
        会場
        <input name="venue" required maxLength={100} />
      </label>
      <div className="row">
        <label>
          開演日時
          <input name="startsAt" type="datetime-local" required />
        </label>
        <label>
          予約上限(枚)
          <input name="capacity" type="number" min={1} defaultValue={50} required />
        </label>
      </div>
      <div className="row">
        <label>
          前売り料金(円)
          <input name="priceAdvance" type="number" min={0} step={100} defaultValue={2000} required />
        </label>
        <label>
          当日料金(円)
          <input name="priceDoor" type="number" min={0} step={100} defaultValue={2500} required />
        </label>
      </div>
      <label>
        備考(出演者・ドリンク代など)
        <textarea name="note" rows={2} maxLength={500} />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "作成中..." : "公演を作成"}
      </button>
    </form>
  );
}
