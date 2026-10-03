import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { formatDateTime } from "@/lib/format";
import EventForm from "./EventForm";

export const dynamic = "force-dynamic";

/**
 * 主催者メニュー。
 * 雛形では認証なしで ?band= によりバンドを切り替える。本実装では Supabase Auth のログインユーザーに
 * 紐づくバンドのみ表示する(RLS で他バンドのデータを読めないようにする)。
 */
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ band?: string }> }) {
  const { band: bandParam } = await searchParams;
  const repo = getRepository();
  const bands = await repo.listBands();
  const band = bands.find((b) => b.id === bandParam) ?? bands[0];
  const events = await repo.listEventsByBand(band.id);
  const counts = await Promise.all(events.map((e) => repo.reservedCount(e.id)));

  return (
    <>
      <h1>主催者メニュー</h1>
      <p className="muted">
        表示中のバンド(デモ用切り替え):{" "}
        {bands.map((b, i) => (
          <span key={b.id}>
            {i > 0 && " / "}
            {b.id === band.id ? <strong>{b.name}</strong> : <Link href={`/dashboard?band=${b.id}`}>{b.name}</Link>}
          </span>
        ))}
      </p>

      <section className="card">
        <h2>公演と予約状況</h2>
        {events.length === 0 ? (
          <p>まだ公演がありません。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>公演</th>
                  <th>予約 / 上限</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={e.id}>
                    <td>{formatDateTime(e.startsAt)}</td>
                    <td>
                      <Link href={`/dashboard/events/${e.id}?band=${band.id}`}>{e.title}</Link>
                    </td>
                    <td>
                      {counts[i]} / {e.capacity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>公演を作成</h2>
        <EventForm bandId={band.id} />
      </section>
    </>
  );
}
