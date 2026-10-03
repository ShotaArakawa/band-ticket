import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ band?: string }>;
}) {
  const [{ id }, { band }] = await Promise.all([params, searchParams]);
  const repo = getRepository();
  const event = await repo.getEvent(id);
  if (!event) notFound();
  const reservations = await repo.listReservations(event.id);
  const active = reservations.filter((r) => r.status === "reserved");
  const total = active.reduce((sum, r) => sum + r.quantity, 0);

  // 対バン時の「どのバンド目当てか」集計(チケットバックの計算に使う想定)
  const byVia = new Map<string, number>();
  for (const r of active) byVia.set(r.via || "(未記入)", (byVia.get(r.via || "(未記入)") ?? 0) + r.quantity);

  return (
    <>
      <p>
        <Link href={`/dashboard${band ? `?band=${band}` : ""}`}>← 主催者メニュー</Link>
      </p>
      <h1>{event.title}</h1>
      <p className="muted">
        {formatDateTime(event.startsAt)} / {event.venue} / <Link href={`/events/${event.id}`}>予約ページを開く</Link>
      </p>

      <section className="card">
        <h2>
          予約一覧({total} / {event.capacity} 枚)
        </h2>
        {reservations.length === 0 ? (
          <p>まだ予約はありません。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>お名前</th>
                  <th>枚数</th>
                  <th>お目当て</th>
                  <th>メール</th>
                  <th>メッセージ</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.quantity}</td>
                    <td>{r.via}</td>
                    <td>{r.email}</td>
                    <td>{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {byVia.size > 0 && (
        <section className="card">
          <h3>お目当てバンド別</h3>
          <ul>
            {[...byVia.entries()].map(([via, count]) => (
              <li key={via}>
                {via}: {count}枚
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
