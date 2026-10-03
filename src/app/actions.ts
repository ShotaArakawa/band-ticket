"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CapacityExceededError, getRepository } from "@/lib/repository";
import { buildReservationConfirmation, getMailer } from "@/lib/mailer";

export type FormState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TICKETS_PER_RESERVATION = 10;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function reserveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const eventId = str(formData, "eventId");
  const name = str(formData, "name");
  const email = str(formData, "email");
  const quantity = Number(str(formData, "quantity"));
  const via = str(formData, "via");
  const message = str(formData, "message");

  if (!name) return { error: "お名前を入力してください" };
  if (!EMAIL_RE.test(email)) return { error: "メールアドレスの形式が正しくありません" };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_TICKETS_PER_RESERVATION) {
    return { error: `枚数は1〜${MAX_TICKETS_PER_RESERVATION}枚で指定してください` };
  }

  const repo = getRepository();
  const event = await repo.getEvent(eventId);
  if (!event) return { error: "イベントが見つかりません" };
  const band = await repo.getBand(event.bandId);
  if (!band) return { error: "主催バンドが見つかりません" };

  let reservationId: string;
  try {
    const reservation = await repo.createReservation({ eventId, name, email, quantity, via, message });
    reservationId = reservation.id;
    // 送信失敗で予約自体を失敗にしないよう、メールはベストエフォート
    await getMailer()
      .send(buildReservationConfirmation(band, event, reservation))
      .catch((e) => console.error("確認メールの送信に失敗", e));
  } catch (e) {
    if (e instanceof CapacityExceededError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}`);
  redirect(`/events/${eventId}/done?rid=${reservationId}`);
}

export async function createEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const bandId = str(formData, "bandId");
  const title = str(formData, "title");
  const venue = str(formData, "venue");
  const startsAtLocal = str(formData, "startsAt");
  const priceAdvance = Number(str(formData, "priceAdvance"));
  const priceDoor = Number(str(formData, "priceDoor"));
  const capacity = Number(str(formData, "capacity"));
  const note = str(formData, "note");

  const repo = getRepository();
  if (!(await repo.getBand(bandId))) return { error: "バンドを選択してください" };
  if (!title || !venue) return { error: "公演名と会場は必須です" };
  // datetime-local は TZ を持たないため JST として解釈する
  const startsAt = new Date(`${startsAtLocal}:00+09:00`);
  if (Number.isNaN(startsAt.getTime())) return { error: "開演日時を入力してください" };
  for (const [label, v] of [["前売り料金", priceAdvance], ["当日料金", priceDoor]] as const) {
    if (!Number.isInteger(v) || v < 0) return { error: `${label}は0以上の整数で入力してください` };
  }
  if (!Number.isInteger(capacity) || capacity < 1) return { error: "予約上限は1以上で入力してください" };

  const event = await repo.createEvent({
    bandId,
    title,
    venue,
    startsAt: startsAt.toISOString(),
    priceAdvance,
    priceDoor,
    capacity,
    note,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/dashboard/events/${event.id}?band=${bandId}`);
}
