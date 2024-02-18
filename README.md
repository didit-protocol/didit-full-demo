## Getting started

1. Clone repo

```bash
git clone ...
```

2. Install dependencies

```bash
npm install
```

3. Get `CLIENT_ID`, `CLIENT_SECRET` and `SHARED_SECRET_KEY` (for webhooks), in https://business.staging.didit.me. And also set up correctly the `REDIRECT_URIS`, `WEBHOOK_URL` and `WEBSITE_URL` on the appliction advanced settings. For example you can use `REDIRECT_URIS` = http://localhost:3000/callback , `WEBHOOK_URL` = https://yourapp.com/api/webhook and WEBSITE_URL=http://localhost:3000/

4. Duplicate `.env.example` file and rename to `.env`, add the correct env variables obtained from the business portal.

5. Generate the prisma client (in this demo for simplicity we use sqlite locally)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Run development server and open localhost:3000 on the browser

```bash
npm run dev
```
