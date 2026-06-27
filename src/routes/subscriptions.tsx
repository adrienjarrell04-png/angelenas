import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getUser } from "../lib/auth";

export const Route = createFileRoute("/subscriptions")({
  loader: async () => {
    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: Subscriptions,
});

const tiers = [
  {
    name: "Daily Pass",
    price: "$4.99",
    duration: "24 hours",
    features: ["Unlimited matches", "See who likes you", "No ads"],
    color: "bg-orange-50 text-orange-700",
    button: "bg-orange-600",
  },
  {
    name: "Weekly",
    price: "$19.99",
    duration: "7 days",
    features: ["Everything in Daily", "Boost your profile", "Priority messaging"],
    color: "bg-indigo-50 text-indigo-700",
    button: "bg-indigo-600",
    popular: true,
  },
  {
    name: "Monthly",
    price: "$49.99",
    duration: "30 days",
    features: ["Everything in Weekly", "Lowest daily rate", "Angelena Badge"],
    color: "bg-pink-50 text-pink-700",
    button: "bg-pink-600",
  },
];

function Subscriptions() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/discover" className="text-2xl font-bold text-orange-600">Angelena</Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4 dark:text-white">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Unlock premium features and meet LA locals faster.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border ${tier.popular ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
              {tier.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">Most Popular</span>
              )}
              <div className={`w-fit px-3 py-1 rounded-lg ${tier.color} text-xs font-bold uppercase tracking-wider mb-6`}>
                {tier.name}
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold dark:text-white">{tier.price}</span>
                <span className="text-gray-500">/ {tier.duration}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 text-white font-bold rounded-full ${tier.button} hover:opacity-90 transition-all`}>
                Select {tier.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-orange-100 dark:bg-orange-900/20 rounded-3xl text-center">
          <p className="text-orange-800 dark:text-orange-300 font-medium">Safe & Secure Payments via Stripe</p>
          <div className="flex justify-center gap-4 mt-4 text-2xl grayscale opacity-50">
            <span>💳</span>
            <span>🍎</span>
            <span>📱</span>
            <span>🅿️</span>
          </div>
        </div>
      </main>
    </div>
  );
}
