import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderStatusEmail(params: {
  to: string;
  orderId: string;
  status: string;
}) {
  const { to, orderId, status } = params;

  const statusLabels: Record<string, string> = {
    PAID: "оплачен",
    SHIPPED: "отправлен",
    DELIVERED: "доставлен",
    CANCELLED: "отменён",
  };

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Marketplace <no-reply@example.com>",
    to,
    subject: `Заказ #${orderId.slice(-8)} — статус обновлён`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Статус вашего заказа изменён</h2>
        <p>Заказ <strong>#${orderId.slice(-8)}</strong> теперь: <strong>${statusLabels[status] ?? status}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}">Посмотреть заказ</a></p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Marketplace <no-reply@example.com>",
    to,
    subject: "Добро пожаловать в Marketplace",
    html: `<div style="font-family: sans-serif;"><h2>Привет${name ? `, ${name}` : ""}!</h2><p>Спасибо за регистрацию на нашем маркетплейсе.</p></div>`,
  });
}
