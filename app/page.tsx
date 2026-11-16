import Link from "next/link";
import { Server, ShieldCheck, Zap, Globe, HardDrive, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const packages = await prisma.package.findMany({
    where: { active: true },
    orderBy: { priceMonthly: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">CloudHost</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">WHMCS Alternative</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Automated WHM / cPanel Provisioning & 1-Click SSO</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Your modern, self-hosted <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">WHMCS Alternative</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Empower your web hosting business with real-time cPanel automation, instant account activation, client self-service, and zero monthly WHMCS licensing fees.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition"
          >
            <span>Launch Demo Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <span>Admin Console</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1-Click cPanel SSO</h3>
            <p className="text-sm text-slate-400">
              Customers log in directly to cPanel with secure, single-use API session tokens. No passwords exposed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Lifecycle</h3>
            <p className="text-sm text-slate-400">
              Instant WHM `createacct` on payment, auto-suspension on overdue dates, and auto-unsuspension upon settlement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Real-time cPanel UAPI</h3>
            <p className="text-sm text-slate-400">
              Clients manage inboxes, MySQL databases, and check real-time disk & bandwidth usage directly in their portal.
            </p>
          </div>
        </div>
      </section>

      {/* Hosting Packages Showcase */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Hosting Packages</h2>
          <p className="text-slate-400 mt-2 text-sm">Packages automatically sync with your WHM server packages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all ${
                pkg.featured
                  ? "bg-slate-800 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 relative"
                  : "bg-slate-800/60 border border-slate-700 hover:border-slate-600"
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                <p className="text-xs text-indigo-400 font-mono mt-1">WHM: {pkg.whmPackageName}</p>
                <p className="text-sm text-slate-400 mt-3">{pkg.description}</p>

                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-white">${pkg.priceMonthly}</span>
                  <span className="text-slate-400 text-sm"> / month</span>
                </div>

                <div className="space-y-3 border-t border-slate-700/60 pt-6 text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{pkg.diskQuotaMb ? `${pkg.diskQuotaMb / 1024} GB NVMe SSD` : "Unlimited SSD"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{pkg.bandwidthQuotaMb ? `${pkg.bandwidthQuotaMb / 1024} GB Bandwidth` : "Unmetered Bandwidth"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{pkg.maxEmailAccounts} Professional Email Inboxes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{pkg.maxDatabases} MySQL Databases</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Free SSL & 1-Click cPanel Access</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`/login?redirect=/dashboard/order?packageId=${pkg.id}`}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition ${
                    pkg.featured
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-100"
                  }`}
                >
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 CloudHost Portal. Built as an open-source WHMCS alternative with Next.js, Prisma, and WHM/cPanel API.</p>
      </footer>
    </div>
  );
}
