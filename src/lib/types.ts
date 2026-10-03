// ドメインモデル。Supabase 移行時はこの型をテーブル定義(supabase/schema.sql)と揃える。

export type Band = {
  id: string;
  slug: string;
  name: string;
  contactEmail: string;
};

export type LiveEvent = {
  id: string;
  bandId: string;
  title: string;
  venue: string;
  /** ISO 8601 (開演日時) */
  startsAt: string;
  /** 前売り料金(円) */
  priceAdvance: number;
  /** 当日料金(円) */
  priceDoor: number;
  /** 予約上限枚数 */
  capacity: number;
  note: string;
};

export type ReservationStatus = "reserved" | "cancelled";

export type Reservation = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  quantity: number;
  /** 取り置き時の「どのバンド目当てか」(対バン時の集計用) */
  via: string;
  message: string;
  status: ReservationStatus;
  createdAt: string;
};

export type NewEventInput = Omit<LiveEvent, "id">;
export type NewReservationInput = Pick<Reservation, "eventId" | "name" | "email" | "quantity" | "via" | "message">;
