import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getUser } from "../lib/auth";
import { query, execute } from "../lib/db";

const connectFn = createServerFn({ method: "POST" })
  .validator((data: { targetUserId: string }) => data)
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const { targetUserId } = data;

    // Check if target user has already connected with us
    const existing = await query<any>(`SELECT id, status FROM matches WHERE (user_id_1 = '${targetUserId}' AND user_id_2 = '${user.id}')`);
    
    if (existing.length > 0) {
      if (existing[0].status === "pending") {
        await execute(`UPDATE matches SET status = 'accepted' WHERE id = '${existing[0].id}'`);
        return { success: true, matched: true };
      }
      return { success: true, matched: existing[0].status === "accepted" };
    }

    // Otherwise create a new pending match if not already exists
    const alreadySent = await query<any>(`SELECT id FROM matches WHERE (user_id_1 = '${user.id}' AND user_id_2 = '${targetUserId}')`);
    if (alreadySent.length === 0) {
      await execute(`INSERT INTO matches (id, user_id_1, user_id_2, status) VALUES ('${crypto.randomUUID()}', '${user.id}', '${targetUserId}', 'pending')`);
    }

    return { success: true, matched: false };
  });

const getDiscoveryData = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (!user.is_verified) {
    throw redirect({ to: "/verify" });
  }

  // Get other users who haven't been matched yet (roughly for MVP)
  const others = await query<any>(`
    SELECT id, full_name, bio, zip_code 
    FROM users 
    WHERE id != '${user.id}' 
    AND id NOT IN (SELECT user_id_2 FROM matches WHERE user_id_1 = '${user.id}')
    LIMIT 20
  `);
  
  return { others, user };
});

export const Route = createFileRoute("/discover")({
  loader: () => getDiscoveryData(),
  component: Discover,
});

function Discover() {
  const { others, user } = Route.useLoaderData();
  const [localOthers, setOthers] = useState(others);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);

  const handleConnect = async (targetUserId: string, targetName: string) => {
    try {
      const res = await connectFn({ data: { targetUserId } });
      if (res.matched) {
        setMatchMessage(`It's a Match with ${targetName}! 🎉`);
      }
      // Remove from list
      setOthers(localOthers.filter((o: any) => o.id !== targetUserId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkip = (targetUserId: string) => {
    setOthers(localOthers.filter((o: any) => o.id !== targetUserId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-orange-600">Angelena</Link>
        <div className="flex gap-4 items-center">
          <Link to="/messages" className="text-gray-600 dark:text-gray-400">Messages</Link>
          <Link to="/profile" className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
            {user.full_name.charAt(0)}
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {matchMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl text-center shadow-2xl max-w-sm w-full animate-in zoom-in duration-300">
              <div className="text-6xl mb-6">💖</div>
              <h2 className="text-3xl font-extrabold mb-4 dark:text-white">It's a Match!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{matchMessage}</p>
              <div className="flex flex-col gap-3">
                <Link to="/messages" className="py-4 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700">Send a Message</Link>
                <button onClick={() => setMatchMessage(null)} className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">Keep Discovering</button>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8 dark:text-white">Discover LA Locals</h1>
        
        {localOthers.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500">No more users to discover right now. Check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {localOthers.map((other: any) => (
              <div key={other.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-transform hover:scale-[1.02]">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 relative">
                  {/* Placeholder for user photo */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
                    {other.full_name}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold dark:text-white">{other.full_name}</h2>
                    <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-lg">
                      {other.zip_code}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 min-h-[3rem]">
                    {other.bio || "No bio yet."}
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleConnect(other.id, other.full_name)}
                      className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                    >
                      Connect
                    </button>
                    <button 
                      onClick={() => handleSkip(other.id)}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
