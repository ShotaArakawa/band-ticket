import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DonePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rid?: string }>;
}) {
  const [{ id }, { rid }] = await Promise.all([params, searchParams]);
  const event = await getRepository().getEvent(id);
  if (!event) notFound();

  return (
    <section className="card">
      <h1>予約を受け付けました</h1>
      <p>
        {event.title}
        <br />
        {formatDateTime(event.startsAt)} / {event.venue}
      </p>
      {rid && <p className="muted">予約番号: {rid}</p>}
      <p>確認メールをお送りしました。当日受付にてお名前をお伝えください。</p>
      <Link href="/">公演一覧へ戻る</Link>
    </section>
  );
}
