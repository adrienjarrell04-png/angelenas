import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getUser, logout } from "../lib/auth";
import { execute } from "../lib/db";

const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data: { bio: string; zipCode: string }) => data)
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    await execute(`UPDATE users SET bio = '${data.bio.replace(/'/g, "''")}', zip_code = '${data.zipCode.replace(/'/g, "''")}' WHERE id = '${user.id}'`);
    
    return { success: true };
  });

const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await logout();
  return { success: true };
});

export const Route = createFileRoute("/profile")({
  loader: async () => {
    const user = await getUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: Profile,
});

function Profile() {
  const { user } = Route.useLoaderData();
  const [bio, setBio] = useState(user.bio || "");
  const [zipCode, setZipCode] = useState(user.zip_code || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateProfileFn({ data: { bio, zipCode } });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutFn();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/discover" className="text-2xl font-bold text-orange-600">Angelena</Link>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">Log out</button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Your Profile</h1>
          
          <div className="mb-8 flex items-center gap-6">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-3xl text-orange-600 font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">{user.full_name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-2">
                {user.is_verified ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Verified</span>
                ) : (
                  <Link to="/verify" className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Get Verified</Link>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                {message}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                placeholder="Tell others about yourself..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LA Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                pattern="[0-9]{5}"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                placeholder="90001"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
