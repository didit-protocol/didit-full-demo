# Getting Started Guide

Welcome! Follow these steps to set up the project environment and start developing.

This demo is a vanilla implementation of Didit Identity Verification

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

### Step 3: Configure Environment Variables

Before running the application, you'll need to get some environment variables:

1. Visit [https://business.didit.me](https://business.didit.me) to obtain your `CLIENT_ID`, `CLIENT_SECRET`, and `SHARED_SECRET_KEY` (for handling webhooks).
2. In the application's advanced settings, correctly configure `WEBHOOK_URL` to point to your server. For development purposes, you might use:
   - `WEBHOOK_URL` = `https://yourapp.com/api/webhook`

### Step 4: Set Up `.env` File

Duplicate the `.env.example` file, rename the duplicate to `.env`, and fill in the environment variables you obtained from the step above. Your `.env` file will look something like this:

```plaintext
CLIENT_ID=<YourClientId>
CLIENT_SECRET=<YourClientSecret>
SHARED_SECRET_KEY=<YourSharedSecretKey>
# Add any other environment variables as needed.
```

### Step 5: Generate Prisma Client and Understand the User Model

This demo uses SQLite locally for simplicity. The `User` model in `schema.prisma` reflects a real-world application with verification features. Let's break down the key components:

1. **User Model:**

   ```prisma
   model User {
     id                  String                @id @default(cuid())
     name                String?
     email               String                @unique
     emailVerified       DateTime?
     image               String?
     password            String
     isVerified          Boolean               @default(false)
     dateOfBirth         DateTime?
     documentExpiresAt   DateTime?
     createdAt           DateTime              @default(now())
     updatedAt           DateTime              @updatedAt

     // Relations
     sessions            Session[]
     accounts            Account[]
     verificationSessions VerificationSession[]

     @@map("users")
   }
   ```

   - `isVerified`: This Boolean field indicates whether the user has completed the verification process. It defaults to `false` for new users.
   - `dateOfBirth` and `documentExpiresAt`: These fields can store information collected during the verification process.
   - `verificationSessions`: This is a one-to-many relation with the `VerificationSession` model, allowing a user to have multiple verification attempts.

2. **VerificationSession Model:**

   ```prisma
   model VerificationSession {
     id            String   @id @default(cuid())
     userId        String
     sessionId     String   @unique
     status        String   @default("NOT_STARTED")
     createdAt     DateTime @default(now())
     updatedAt     DateTime @updatedAt

     // Relations
     user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@map("verification_sessions")
   }
   ```

   - This model represents individual verification attempts.
   - `status`: Tracks the progress of each verification session (e.g., "Not Started", "In Progress", "Approved", "Declined", "In Review", "Expired", "Abandoned", "KYC Expired").
   - `sessionId`: A unique identifier for each verification session, which can be used to link with external verification service data.

3. **Typical Verification Flow:**

   - When a user initiates verification, a new `VerificationSession` is created with status "NOT_STARTED".
   - As the user progresses through verification, the status is updated (e.g., to "In Progress"). This update is generally done by the webhook received from Didit.
   - Upon successful completion, the status is set to "Approved", and the `User.isVerified` is set to `true`.
   - Additional user information (like `dateOfBirth` and `documentExpiresAt`) can be updated based on the verification results.

4. **Generate Prisma Client and Run Migrations:**
   After understanding the model, generate the Prisma client and run migrations to set up your database schema:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   These commands will create your database schema based on the Prisma models and generate the Prisma Client, which you'll use to interact with your database in your application code.

5. **Using the Models in Your Application:**
   - When a user signs up, create a `User` record with `isVerified` set to `false`.
   - Implement a verification flow where you create a `VerificationSession` when the user starts the process.
   - Update the `VerificationSession` status as the user progresses.
   - Once verification is complete, update both the `VerificationSession` status and the `User.isVerified` field.
   - Use the `isVerified` field to control access to certain parts of your application that require verified users.

This setup allows for a flexible and trackable verification process, enabling you to manage multiple verification attempts per user and maintain a clear record of each user's verification status.

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

Copy the public URL into the webhook url in app settings of Didit business console adding the path `/api/verification/webhook` (for this demo)

---

You're now ready to start developing with the project setup! For more detailed documentation or troubleshooting tips, refer to the official documentation or the `README.md` file within the project repository.
