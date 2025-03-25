"use client";
import { availablePlans } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { FaCheck } from "react-icons/fa6";
import { toast, Toaster } from "react-hot-toast";
type SubscribeResponse = {
  //  like we defined in  the route, inf successful we return a url:
  url: string;
};
type SubscribeError = {
  error: string;
};

async function subscribeToPlan(
  planType: string,
  userId: string,
  email: string
): Promise<SubscribeResponse> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planType,
      userId,
      email,
    }),
  });

  if (!response.ok) {
    const errorData: SubscribeError = await response.json();
    throw new Error(errorData.error || "something went wrong");
  }

  const data: SubscribeResponse = await response.json();
  return data;
}

const Subscribe = () => {
  const { user } = useUser();
  const router = useRouter();
  const userId = user?.id;
  const email = user?.emailAddresses[0].emailAddress || "";

  const { mutate, isPending } = useMutation<
    SubscribeResponse,
    SubscribeError,
    { planType: string }
  >({
    mutationFn: async ({ planType }) => {
      if (!userId) {
        throw new Error("user not signed in");
      }
      return subscribeToPlan(planType, userId, email);
    },
    onMutate: () => {
      toast.loading("Procssing your subscription...");
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error("Something went wrong");
    },
  });

  function handleSubscribe(planType: string) {
    if (!userId) {
      router.push("/sign-up");
      return;
    }
    mutate({ planType });
  }

  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16">
      <div>
        <h2 className="text-3xl font-bold text-center mt-12 sm:text-5xl tracking light">
          Pricing
        </h2>
        <p className="max-w-3xl mx-auto mt-4 text-xl text-center">
          Get Started On Our Weekly Plan or upgrade to monthly or yearly when
          you are ready
        </p>
        {/* card container */}
        <div className="mt-12 container mx-auto space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {availablePlans.map((plan, key) => (
            <div
              key={key}
              className="
            relative p-8 
            border border-gray-200 rounded-2xl shadow-sm 
            flex flex-col
            hover:shadow-md hover:scale-[1.02] 
            transition-transform duration-200 ease-out
          "
            >
              <div className="flex-1">
                {plan.isPopular && (
                  <p className="absolute top-0 py-1.5 px-4 bg-emerald-500 text-white rounded-full text-xs font-semibold uppercase tracking-wide transform -translate-y-1/2">
                    Most Popualar
                  </p>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {plan.amount}
                  </span>
                  <span className="ml-1 text-xl font-semibold">
                    /{plan.interval}
                  </span>
                </p>
                <p className="mt-6">{plan.description}</p>
                <ul role="list" className="mt-6 space-y-4">
                  {plan.features.map((feature, key) => (
                    <li key={key} className="flex">
                      <FaCheck />
                      <span className="ml-3">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`${
                  plan.interval === "month"
                    ? "bg-emerald-500 text-white  hover:bg-emerald-600 "
                    : "bg-emerald-100 text-emerald-700  hover:bg-emerald-200 "
                }  mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium disabled:bg-gray-400 disabled:cursor-not-allowed`}
                onClick={() => handleSubscribe(plan.interval)}
                disabled={isPending}
              >
                {isPending ? "please wait..." : `Subsribe ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
