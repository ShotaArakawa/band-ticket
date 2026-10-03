import type { Band, LiveEvent, Reservation } from "./types";
import { formatDateTime, formatYen } from "./format";

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

/**
 * メール送信の差し替えポイント。
 * 雛形ではコンソール出力のモック。本実装では Resend の SDK を使う ResendMailer を作り、
 * getMailer() で環境変数 RESEND_API_KEY の有無に応じて切り替える。
 */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

class ConsoleMailer implements Mailer {
  async send(message: MailMessage) {
    console.log("[mock-mail]", JSON.stringify(message, null, 2));
  }
}

export function getMailer(): Mailer {
  return new ConsoleMailer();
}

export function buildReservationConfirmation(band: Band, event: LiveEvent, reservation: Reservation): MailMessage {
  return {
    to: reservation.email,
    subject: `【予約確認】${event.title}`,
    text: [
      `${reservation.name} 様`,
      "",
      "ご予約ありがとうございます。以下の内容で取り置きを受け付けました。",
      "",
      `公演: ${event.title}`,
      `日時: ${formatDateTime(event.startsAt)}`,
      `会場: ${event.venue}`,
      `枚数: ${reservation.quantity}枚(前売り ${formatYen(event.priceAdvance)} / 枚)`,
      `予約番号: ${reservation.id}`,
      "",
      "当日受付にてお名前をお伝えください。お支払いは当日精算です。",
      "",
      `主催: ${band.name}(${band.contactEmail})`,
    ].join("\n"),
  };
}
