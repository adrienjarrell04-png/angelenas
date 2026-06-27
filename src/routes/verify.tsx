import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getUser } from "../lib/auth";
import { execute } from "../lib/db";

const verifyFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    // In a real app, integrate with Stripe Identity or Onfido
    // For MVP, we'll just mark them as verified when they "upload"
    await execute(`UPDATE users SET is_verified = 1 WHERE id = '${user.id}'`);
    
    return { success: true };
  });

export const Route = createFileRoute("/verify")({
  loader: async () => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    return { user };
  },
  component: Verify,
});

function Verify() {
  const { user } = Route.useLoaderData();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyFn();
      navigate({ to: "/discover" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🛡️</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Verify your Identity
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          To keep Angelena safe and local, we require all users to verify they are 18+ with a government-issued ID.
        </p>
        
        <div className="mt-8 space-y-4">
          <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              [Stub: Integration point for Stripe Identity]
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Clicking verify will simulate a successful ID check for this MVP.
            </p>
          </div>
          
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-4 px-4 text-lg font-bold rounded-full text-white bg-orange-600 hover:bg-orange-700 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Identity"}
          </button>
        </div>
      </div>
    </div>
  );
}
