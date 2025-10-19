This is a [Next.js](https://nextjs.org) project bootstrapped with [
`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically
optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for
more details.

tree -I "node_modules"

[//]: # 'open studio'

npm run prisma:studio

[//]: # 'push data'

npm run prisma:push

[//]: # 'sed'

npm run prisma:seed

[//]: # 'install'

npm run postinstall

Strep
Основная тестовая карта (успешная оплата) Эта карта всегда проходит успешно.
Номер карты: 4242 4242 4242 4242  
Срок действия: любое будущее (например 12/34)  
CVC: любое (например 123)  
Имя: любое  
Страна: любая (например Italy)

🚫 Карта с ошибкой оплаты Платёж отклонится (симулирует «недостаточно средств»).
4000 0000 0000 9995

⚠️ 3D Secure (требует подтверждения)
4000 0027 6000 3184
Stripe покажет окно “Подтвердить платеж” (можно выбрать «Одобрить» или «Отклонить»).

Для возвратов / разных сценариев
• Отказ после авторизации: 4000 0000 0000 0341
• Требует дополнительной проверки (SCA): 4000 0082 6000 3178
• Платёж с валютой, отличной от EUR: можно просто сменить currency в коде на "usd" и использовать 4242...
