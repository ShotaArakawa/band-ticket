import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { formatDateTime, formatYen } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const repo = getRepository();
  const [events, bands] = await Promise.all([repo.listUpcomingEvents(), repo.listBands()]);
  const bandName = (id: string) => bands.find((b) => b.id === id)?.name ?? "";

  return (
    <>
      <h1>公演一覧</h1>
      <p className="muted">気になる公演を選んで、取り置き予約ができます。お支払いは当日精算です。</p>
      {events.length === 0 && <p>予定されている公演はありません。</p>}
      {events.map((event) => (
        <article key={event.id} className="card">
          <p className="muted">{bandName(event.bandId)}</p>
          <h2>
            <Link href={`/events/${event.id}`}>{event.title}</Link>
          </h2>
          <p>
            {formatDateTime(event.startsAt)} / {event.venue}
            <br />
            前売り {formatYen(event.priceAdvance)} / 当日 {formatYen(event.priceDoor)}
          </p>
        </article>
      ))}
    </>
  );
}
