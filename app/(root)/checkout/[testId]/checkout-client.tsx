"use client";

import { useState } from "react";
import { Image } from "@imagekit/next";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Lock, FileText, CheckCircle2 } from "lucide-react";
import { type Test } from "@/src/db/schema/tests";
import { formatPrice } from "@/utils/format-price";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

interface CheckoutClientProps {
  test: Test;
}

export default function CheckoutClient({ test }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test.id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SU Prep",
        description: `Purchase: ${test.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);
            // 3. Verify payment
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed",
              );
            }

            // Success
            setSuccess(true);
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          } catch (err: any) {
            setError(err.message || "Something went wrong during verification");
            setLoading(false);
          }
        },
        theme: {
          color: "#4f46e5", // brand primary color (adjust if needed)
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed");
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
        <h2 className="text-2xl font-bold font-heading">Payment Successful!</h2>
        <p className="text-brand-muted font-body">
          You have successfully purchased {test.title}. Redirecting you to your
          dashboard...
        </p>
      </div>
    );
  }

  const discountPercent = test.originalPrice
    ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
    : null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Summary Card */}
        <div className="md:col-span-3 flex flex-col gap-6 bg-white rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8">
          <h2 className="text-xl font-bold font-heading border-b border-slate-100 pb-4">
            Order Summary
          </h2>

          <div className="flex gap-4 items-center">
            <div className="relative w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
              {test.thumbnail ? (
                <Image
                  urlEndpoint={test.thumbnail}
                  src={test.thumbnail}
                  alt={test.title}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold font-sans text-black line-clamp-2 leading-tight">
                {test.title}
              </h3>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-6 flex flex-col font-heading gap-4">
            <div className="flex justify-between items-center text-brand-muted">
              <span>Original Price</span>
              <span className={test.originalPrice ? "line-through" : ""}>
                {test.originalPrice
                  ? formatPrice(test.originalPrice)
                  : formatPrice(test.price)}
              </span>
            </div>
            {test.originalPrice && (
              <div className="flex justify-between items-center text-green-600 font-medium">
                <span>Discount</span>
                <span>-{formatPrice(test.originalPrice - test.price)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl pt-4 font-bold font-heading text-black border-t border-slate-100 mt-2">
              <span>Total Amount</span>
              <span>{formatPrice(test.price)}</span>
            </div>
          </div>
        </div>

        {/* Payment Action Card */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-50 rounded-3xl border border-slate-200 p-6 md:p-8 h-fit">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-bold text-lg text-black">
              Payment details
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Complete your purchase securely via Razorpay. We support all major
              credit cards, UPI, and net banking.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-brand-button hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Pay ${formatPrice(test.price)}`
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-brand-muted/70 mt-2">
            <Lock size={14} />
            <span className="text-[10px] tracking-widest font-bold font-heading uppercase text-center">
              Secure Encrypted Payment
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
