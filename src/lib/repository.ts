import type { Band, LiveEvent, NewEventInput, NewReservationInput, Reservation } from "./types";

/**
 * データアクセスの差し替えポイント。
 * 雛形ではインメモリ実装(プロセス再起動でリセット)。本実装では SupabaseRepository を作って
 * getRepository() の返り値を差し替える。
 */
export interface Repository {
  listBands(): Promise<Band[]>;
  getBand(id: string): Promise<Band | undefined>;
  listUpcomingEvents(): Promise<LiveEvent[]>;
  listEventsByBand(bandId: string): Promise<LiveEvent[]>;
  getEvent(id: string): Promise<LiveEvent | undefined>;
  createEvent(input: NewEventInput): Promise<LiveEvent>;
  listReservations(eventId: string): Promise<Reservation[]>;
  reservedCount(eventId: string): Promise<number>;
  createReservation(input: NewReservationInput): Promise<Reservation>;
}

export class CapacityExceededError extends Error {
  constructor(public remaining: number) {
    super(`残り枚数が不足しています(残り${remaining}枚)`);
  }
}

const newId = () => crypto.randomUUID();

function daysFromNow(days: number, hour = 19): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

class InMemoryRepository implements Repository {
  private bands: Band[] = [
    { id: "band-1", slug: "night-owls", name: "Night Owls", contactEmail: "owls@example.com" },
    { id: "band-2", slug: "paper-rocket", name: "Paper Rocket", contactEmail: "rocket@example.com" },
  ];

  private events: LiveEvent[] = [
    {
      id: "event-1",
      bandId: "band-1",
      title: "Night Owls ワンマン「深夜二時」",
      venue: "下北沢 某ライブハウス",
      startsAt: daysFromNow(14),
      priceAdvance: 2500,
      priceDoor: 3000,
      capacity: 80,
      note: "ドリンク代別 600円",
    },
    {
      id: "event-2",
      bandId: "band-2",
      title: "Paper Rocket 企画 対バンナイト",
      venue: "新宿 某ライブハウス",
      startsAt: daysFromNow(30, 18),
      priceAdvance: 2000,
      priceDoor: 2500,
      capacity: 120,
      note: "出演: Paper Rocket / Night Owls / ほか",
    },
  ];

  private reservations: Reservation[] = [
    {
      id: "rsv-1",
      eventId: "event-1",
      name: "山田 太郎",
      email: "yamada@example.com",
      quantity: 2,
      via: "Night Owls",
      message: "",
      status: "reserved",
      createdAt: new Date().toISOString(),
    },
  ];

  async listBands() {
    return this.bands;
  }
  async getBand(id: string) {
    return this.bands.find((b) => b.id === id);
  }
  async listUpcomingEvents() {
    const now = Date.now();
    return this.events
      .filter((e) => new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  async listEventsByBand(bandId: string) {
    return this.events.filter((e) => e.bandId === bandId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  async getEvent(id: string) {
    return this.events.find((e) => e.id === id);
  }
  async createEvent(input: NewEventInput) {
    const event: LiveEvent = { ...input, id: newId() };
    this.events.push(event);
    return event;
  }
  async listReservations(eventId: string) {
    return this.reservations
      .filter((r) => r.eventId === eventId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async reservedCount(eventId: string) {
    return this.reservations
      .filter((r) => r.eventId === eventId && r.status === "reserved")
      .reduce((sum, r) => sum + r.quantity, 0);
  }
  async createReservation(input: NewReservationInput) {
    const event = await this.getEvent(input.eventId);
    if (!event) throw new Error("イベントが見つかりません");
    // Supabase 移行時はトランザクション or RPC で残数チェックと挿入を原子的に行うこと
    const remaining = event.capacity - (await this.reservedCount(input.eventId));
    if (input.quantity > remaining) throw new CapacityExceededError(remaining);
    const reservation: Reservation = {
      ...input,
      id: newId(),
      status: "reserved",
      createdAt: new Date().toISOString(),
    };
    this.reservations.push(reservation);
    return reservation;
  }
}

// dev サーバーのホットリロードでデータが消えないよう globalThis に保持する
const globalForRepo = globalThis as unknown as { __bandTicketRepo?: Repository };

export function getRepository(): Repository {
  globalForRepo.__bandTicketRepo ??= new InMemoryRepository();
  return globalForRepo.__bandTicketRepo;
}
