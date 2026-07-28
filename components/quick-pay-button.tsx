"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface QuickPayButtonProps {
  testId?: string;
  testTitle?: string;
  price?: number;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "link" | "secondary";
  showIcon?: boolean;
}

export default function QuickPayButton({
  testId,
  testTitle = "Mock Test Series",
  price,
  label = "Buy Now",
  className = "",
  size = "sm",
  variant = "default",
  showIcon = true,
}: QuickPayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Dynamically load Razorpay SDK script if testId is provided
  useEffect(() => {
    if (!testId) return;

    if ((window as any).Razorpay) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK script");
      setScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      // script cleanup if needed
    };
  }, [testId]);

  // Handle direct Razorpay checkout
  const handleQuickCheckout = async (e: React.MouseEvent) => {
    if (!testId) {
      // If no specific testId is given, navigate to catalog checkout
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      // 1. Create Razorpay order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      if (orderRes.status === 401) {
        router.push(`/sign-in?redirect_url=/checkout/${testId}`);
        return;
      }

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // 2. Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SU Mock Test | By Shipping Updates",
        description: `Unlock: ${testTitle}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);

            // 3. Verify payment signature
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

            toast.success("Payment successful! Access granted.");
            router.refresh();
            router.push("/dashboard");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: "#4f46e5",
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);

        rzp.on("payment.failed", function (response: any) {
          toast.error(response.error.description || "Payment failed");
          setLoading(false);
        });

        rzp.open();
      } else {
        // Fallback: Redirect to checkout page if SDK script didn't load in time
        router.push(`/checkout/${testId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong initiating payment");
    } finally {
      setLoading(false);
    }
  };

  // If no specific testId is given, acts as a high-converting link to catalog / checkout
  if (!testId) {
    return (
      <Button
        asChild
        size={size}
        variant={variant}
        className={`rounded-xl font-bold font-heading bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      >
        <Link href="/mock-tests">
          {showIcon && <CreditCard className="size-4 mr-1.5" />}
          <span>{label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleQuickCheckout}
      disabled={loading}
      size={size}
      variant={variant}
      className={`rounded-xl font-bold font-heading bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {loading ? (
        <Loader2 className="size-4 mr-1.5 animate-spin" />
      ) : showIcon ? (
        <Zap className="size-4 mr-1.5 fill-current" />
      ) : null}
      <span>{loading ? "Processing..." : label}</span>
    </Button>
  );
}
