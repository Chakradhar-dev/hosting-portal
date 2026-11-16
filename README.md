# CloudHost Portal — Next-Gen WHMCS Alternative

A modern, high-performance, fee-free Web Hosting Management CMS and Client Portal with **native WHM & cPanel API 1 automation**, built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🌟 Key Features

### 1. cPanel & WHM Automated Lifecycle
* **1-Click Single Sign-On (SSO):** Securely logs clients and admins directly into cPanel via WHM API 1 `create_user_session` without exposing raw passwords.
* **Instant Provisioning:** Automatic cPanel account creation (`createacct`) upon successful checkout or payment settlement.
* **Automated Suspension & Unsuspension:** Suspends accounts (`suspendacct`) when invoices are overdue; unsuspends instantly (`unsuspendacct`) upon receipt of payment.
* **Account Termination:** Cleanly terminates cPanel accounts (`removeacct`) from WHM.
* **Real-time Quota Gauges:** Pulls live disk usage and bandwidth consumption via cPanel UAPI.
* **cPanel UAPI Quick Actions:** Clients can create new domain email accounts (`user@domain.com`) directly from their portal without opening cPanel.

### 2. Full Client Portal
* **Dashboard:** Active hosting accounts, disk space usage, unpaid invoice alerts, support tickets.
* **Hosting Account Details:** Server IP, Nameservers (`ns1/ns2`), 1-click SSO button, inbox manager.
* **Billing & Invoices:** Settle invoices with 1-click simulation or payment gateway integration.
* **Support Desk:** Open tickets, department routing, thread-based messaging.
* **Storefront:** Browse packages, input custom domains, select monthly/yearly billing.

### 3. Comprehensive Admin Console
* **WHM Server Nodes:** Add WHM servers, live connection ping & version testing, automated package synchronization from WHM.
* **Client Accounts:** View all client cPanel accounts with administrative actions: 1-Click Admin SSO, Suspend, Unsuspend, Force Re-provision, Terminate.
* **Hosting Packages:** Define tiers, disk quotas, email inbox limits, and map to WHM packages.
* **Billing Ledger & Revenue:** Overview of settled and outstanding invoices.
* **Support Queue:** Help desk reply system.

---

## 🚀 Quick Start Guide

### 1. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:6060](http://localhost:6060) in your browser.

### 2. Demo Credentials
The portal includes pre-seeded demo accounts:

* **Client Demo:**
  * **Email:** `client@example.com`
  * **Password:** `client123`
  * *Features:* Active hosting service `myawesomeapp.com`, 1-click SSO button, invoice history, support ticket.

* **Admin Demo:**
  * **Email:** `admin@hostingportal.com`
  * **Password:** `admin123`
  * *Features:* Full WHM Server node manager, package sync, client cPanel suspension/unsuspension controls.

*(Both buttons are also available on the Login page for 1-click instant login)*

---

## ⚙️ Connecting Your Live WHM / cPanel Server

1. Log into your **WHM (Web Host Manager)** at `https://your-server-ip:2087`.
2. Go to **Development Tools** ➔ **Manage API Tokens**.
3. Click **Generate Token**, give it a name (e.g. `CloudHost Portal`), and grant the required permissions (`Account Creation`, `Basic WHM Functions`, `Account Suspension`).
4. In your CloudHost Portal Admin Console:
   * Navigate to **WHM Servers** (`/admin/servers`).
   * Click **Add WHM Server**.
   * Enter your Hostname, Server IP, and paste the API Token.
   * Click **Test Connection** to verify live communication with WHM!
   * Click **Sync WHM Packages** to import all your hosting packages in one click.

---

## 🗄️ Database

By default, the application runs on **SQLite** for immediate zero-config local testing. To switch to **PostgreSQL**:

1. In `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hosting_portal?schema=public"
   ```
3. Run:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
