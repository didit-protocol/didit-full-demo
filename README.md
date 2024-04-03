# Getting Started Guide

Welcome! Follow these steps to set up the project environment and start developing.

This demo is a vanilla implementation of Didit Authentication, Data and Identity Verification. Didit Payments will be implemented soon.

### Step 1: Clone the Repository

Begin by cloning the repository to your local machine. Open a terminal and run:

```bash
git clone https://github.com/didit-protocol/didit-full-demo.git
```

### Step 2: Install Dependencies

Navigate into the project directory and install its dependencies:

```bash
cd didit-full-demo
npm install
```

Replace `<REPOSITORY_NAME>` with the name of the directory that was created when you cloned the repository.

### Step 3: Configure Environment Variables

Before running the application, you'll need to set up some environment variables:

1. Visit [https://business.staging.didit.me](https://business.staging.didit.me) to obtain your `CLIENT_ID`, `CLIENT_SECRET`, and `SHARED_SECRET_KEY` (for handling webhooks).
2. In the application's advanced settings, correctly configure `REDIRECT_URIS`, `WEBHOOK_URL`, and `WEBSITE_URL`. For development purposes, you might use:
   - `REDIRECT_URIS` = `http://localhost:3000/callback`
   - `WEBHOOK_URL` = `https://yourapp.com/api/webhook`
   - `WEBSITE_URL` = `http://localhost:3000/`

### Step 4: Set Up `.env` File

Duplicate the `.env.example` file, rename the duplicate to `.env`, and fill in the environment variables you obtained from the step above. Your `.env` file will look something like this:

```plaintext
CLIENT_ID=<YourClientId>
CLIENT_SECRET=<YourClientSecret>
SHARED_SECRET_KEY=<YourSharedSecretKey>
# Add any other environment variables as needed.
```

### Step 5: Generate Prisma Client

This demo uses SQLite locally for simplicity. Generate the Prisma client and run migrations to set up your database schema:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

These commands create your database schema based on your Prisma models.

### Step 6: Start the Development Server

Finally, launch the development server. Open your browser and navigate to `http://localhost:3000` to view the application:

```bash
npm run dev
```

### Step 7: Use webhooks locally

Install ngrok or othher webhook tunnel package.

```bash
sudo snap install ngrok
```

Authenticate using ngrok token

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

Expose your local server using ngrok

```bash
ngrok http 3000
```

Copy the public URL into the webhook url in app settings of Didit business console

---

You're now ready to start developing with the project setup! For more detailed documentation or troubleshooting tips, refer to the official documentation or the `README.md` file within the project repository.
