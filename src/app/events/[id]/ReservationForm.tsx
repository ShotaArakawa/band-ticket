"use client";

import { useActionState } from "react";
import { reserveAction, type FormState } from "@/app/actions";

type Props = {
  eventId: string;
  defaultVia: string;
  maxQuantity: number;
};

export default function ReservationForm({ eventId, defaultVia, maxQuantity }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(reserveAction, {});

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="eventId" value={eventId} />
      <label>
        お名前(当日受付で使用)
        <input name="name" required maxLength={50} />
      </label>
      <label>
        メールアドレス(予約確認を送信します)
        <input name="email" type="email" required />
      </label>
      <div className="row">
        <label>
          枚数
          <select name="quantity" defaultValue="1">
            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}枚
              </option>
            ))}
          </select>
        </label>
        <label>
          お目当てのバンド
          <input name="via" defaultValue={defaultVia} maxLength={50} />
        </label>
      </div>
      <label>
        メッセージ(任意)
        <textarea name="message" rows={3} maxLength={500} />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "送信中..." : "予約する"}
      </button>
    </form>
  );
}
