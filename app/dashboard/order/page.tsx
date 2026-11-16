"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Server, Globe, CheckCircle2, Zap, ArrowRight, Loader2 } from "lucide-react";

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPkg = searchParams.get("packageId");

  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string>("");
  const [domain, setDomain] = useState("");
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [autoProvision, setAutoProvision] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => {
        const pkgs = data.packages || [];
        setPackages(pkgs);
        if (preselectedPkg && pkgs.some((p: any) => p.id === preselectedPkg)) {
          setSelectedPkgId(preselectedPkg);
        } else if (pkgs.length > 0) {
          setSelectedPkgId(pkgs[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [preselectedPkg]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setError(null);
    setOrdering(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPkgId,
          domain,
          billingCycle,
          autoProvision,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order placement failed");

      router.push(`/dashboard/services/${data.service.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Order Web Hosting Plan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select your plan, link your domain, and auto-provision your cPanel account immediately.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleOrder} className="space-y-8">
        {/* Step 1: Choose Package */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Step 1: Choose Hosting Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10"
                      : "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-base">{pkg.name}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">{pkg.whmPackageName}</p>
                  <p className="text-2xl font-extrabold text-white mt-4">
                    ${billingCycle === "YEARLY" ? pkg.priceYearly : pkg.priceMonthly}
                    <span className="text-xs text-slate-400 font-normal">
                      /{billingCycle === "YEARLY" ? "year" : "month"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Domain Input & Billing Cycle */}
        <div className="space-y-4 bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Step 2: Domain & Billing Cycle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Domain Name
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. clientstartup.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A cPanel username will be automatically generated from this domain.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    billingCycle === "MONTHLY"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    billingCycle === "YEARLY"
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  Yearly (Save 15%)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoProvision}
                onChange={(e) => setAutoProvision(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Instant Auto-Provisioning on WHM / cPanel node upon order
              </span>
            </label>
          </div>
        </div>

        {/* Order Summary & Submit Button */}
        {selectedPkg && (
          <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-indigo-300 uppercase font-semibold">Total Due Today</p>
              <p className="text-3xl font-extrabold text-white">
                ${billingCycle === "YEARLY" ? selectedPkg.priceYearly : selectedPkg.priceMonthly}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedPkg.name} • {billingCycle}
              </p>
            </div>

            <button
              type="submit"
              disabled={ordering}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 transition text-sm"
            >
              {ordering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Account on WHM...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Place Order & Activate</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <OrderForm />
    </Suspense>
  );
}
