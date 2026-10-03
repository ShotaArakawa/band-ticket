import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { formatDateTime, formatYen } from "@/lib/format";
import ReservationForm from "./ReservationForm";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const repo = getRepository();
  const event = await repo.getEvent(id);
  if (!event) notFound();
  const [band, reserved] = await Promise.all([repo.getBand(event.bandId), repo.reservedCount(event.id)]);
  const remaining = Math.max(0, event.capacity - reserved);

  return (
    <>
      <p className="muted">{band?.name}</p>
      <h1>{event.title}</h1>
      <section className="card">
        <p>
          日時: {formatDateTime(event.startsAt)}
          <br />
          会場: {event.venue}
          <br />
          料金: 前売り {formatYen(event.priceAdvance)} / 当日 {formatYen(event.priceDoor)}
        </p>
        {event.note && <p className="muted">{event.note}</p>}
        <p>残り {remaining} 枚</p>
      </section>

      <section className="card">
        <h2>取り置き予約</h2>
        {remaining > 0 ? (
          <ReservationForm eventId={event.id} defaultVia={band?.name ?? ""} maxQuantity={Math.min(10, remaining)} />
        ) : (
          <p>予約枠が上限に達しました。当日券についてはバンドの告知をご確認ください。</p>
        )}
      </section>
    </>
  );
}
