import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getUser } from "../lib/auth";
import { query, execute } from "../lib/db";

const getMessagesData = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) throw redirect({ to: "/login" });

  // Get accepted matches
  const matches = await query<any>(`
    SELECT m.id, u.id as user_id, u.full_name
    FROM matches m
    JOIN users u ON (m.user_id_1 = u.id OR m.user_id_2 = u.id)
    WHERE (m.user_id_1 = '${user.id}' OR m.user_id_2 = '${user.id}')
    AND m.status = 'accepted'
    AND u.id != '${user.id}'
  `);

  return { matches, user };
});

const getChatFn = createServerFn({ method: "GET" })
  .validator((matchId: string) => matchId)
  .handler(async (matchId) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const messages = await query<any>(`
      SELECT * FROM messages 
      WHERE match_id = '${matchId}' 
      ORDER BY created_at ASC
    `);

    return messages;
  });

const sendMessageFn = createServerFn({ method: "POST" })
  .validator((data: { matchId: string; content: string }) => data)
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    await execute(`
      INSERT INTO messages (id, match_id, sender_id, content) 
      VALUES ('${crypto.randomUUID()}', '${data.matchId}', '${user.id}', '${data.content.replace(/'/g, "''")}')
    `);

    return { success: true };
  });

export const Route = createFileRoute("/messages")({
  loader: () => getMessagesData(),
  component: Messages,
});

function Messages() {
  const { matches, user } = Route.useLoaderData();
  const [selectedMatch, setSelectedMatch] = useState<any>(matches[0] || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id);
    }
  }, [selectedMatch]);

  const loadMessages = async (matchId: string) => {
    const msgs = await getChatFn(matchId);
    setMessages(msgs);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedMatch) return;

    const content = input;
    setInput("");
    
    try {
      await sendMessageFn({ data: { matchId: selectedMatch.id, content } });
      loadMessages(selectedMatch.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <Link to="/discover" className="text-xl font-bold text-orange-600">Angelena</Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No matches yet. Keep discovering!
            </div>
          ) : (
            matches.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className={`w-full p-6 text-left flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedMatch?.id === m.id ? 'bg-orange-50 dark:bg-orange-900/10 border-r-4 border-orange-600' : ''}`}
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {m.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold dark:text-white">{m.full_name}</div>
                  <div className="text-xs text-gray-500 truncate w-32">Click to chat</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                {selectedMatch.full_name.charAt(0)}
              </div>
              <h2 className="font-bold text-lg dark:text-white">{selectedMatch.full_name}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Send a message to start the conversation!
                </div>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${msg.sender_id === user.id ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-950">
            Select a match to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
