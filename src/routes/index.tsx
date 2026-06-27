import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { getUser } from "../lib/auth";

const getPageData = createServerFn({ method: "GET" }).handler(async () => {
  const businessName = await (async () => {
    try {
      const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
        businessName?: string;
      };
      return cfg.businessName?.trim() ?? "Angelena";
    } catch {
      return "Angelena";
    }
  })();

  const user = await getUser();

  return { businessName, user };
});

export const Route = createFileRoute("/")({
  loader: () => getPageData(),
  component: Home,
});

function Home() {
  const { businessName, user } = Route.useLoaderData();
  
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-orange-200 selection:text-orange-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 dark:bg-gray-950/70 dark:border-gray-800">
        <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
          {businessName.toUpperCase()}
        </div>
        <div className="flex gap-6 items-center">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-300">Hi, {user.full_name}</span>
              <Link
                to="/discover"
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-rose-600 rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all active:scale-95"
              >
                Launch App
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-500 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-full hover:bg-orange-700 transition-all active:scale-95 shadow-md shadow-orange-600/20"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 hero-gradient">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at 20% 30%, rgba(255,107,53,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(199,125,255,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(244,162,97,0.15) 0%, transparent 50%)'
            }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center px-6 max-w-5xl pt-20 pb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
              Verified LA Residents Only
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              Find Your <br/>
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent italic">Angelena</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              The first dating platform exclusive to Greater Los Angeles. 
              Real locals, 18+ ID verification, and no out-of-town tourists.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-10 py-5 text-xl font-black text-white bg-gradient-to-r from-orange-500 to-rose-600 rounded-2xl hover:shadow-2xl hover:shadow-orange-500/40 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Start Matching
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 text-xl font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
                Learn More
              </button>
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-2xl">⭐</span> 4.9/5 App Store
              </div>
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-2xl">🛡️</span> Identity Secured
              </div>
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-2xl">🌴</span> 100% LA Local
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="py-32 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black mb-6 dark:text-white tracking-tight font-heading">Built for the <span className="text-orange-600">310, 818, 213, and 562.</span></h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Tired of matching with people visiting for the weekend? Angelena ensures your matches actually live here.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-10 bg-orange-50/50 dark:bg-orange-900/10 rounded-[3rem] border border-orange-100/50 dark:border-orange-800/20 hover:bg-orange-50 transition-colors duration-500">
                <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-3xl text-white">📍</span>
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">Strictly Local</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  We use advanced geolocation and zip code verification. If they aren't a resident, they aren't on the app.
                </p>
              </div>
              
              <div className="group p-10 bg-rose-50/50 dark:bg-rose-900/10 rounded-[3rem] border border-rose-100/50 dark:border-rose-800/20 hover:bg-rose-50 transition-colors duration-500">
                <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-3xl text-white">🆔</span>
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">Verified Profiles</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Mandatory government ID verification means no catfish, no bots, and zero fakes. Everyone is who they say they are.
                </p>
              </div>
              
              <div className="group p-10 bg-purple-50/50 dark:bg-purple-900/10 rounded-[3rem] border border-purple-100/50 dark:border-purple-800/20 hover:bg-purple-50 transition-colors duration-500">
                <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                  <span className="text-3xl text-white">✨</span>
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">Real Connections</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Whether it's a sunset hike at Griffith or a late-night taco run, match with people who are actually around the corner.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-orange-500 via-rose-600 to-purple-700 mx-6 rounded-[3rem] mb-24 overflow-hidden relative shadow-2xl shadow-rose-500/20">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to meet your Angelena?</h2>
            <p className="text-xl text-orange-100 mb-12 max-w-xl mx-auto">Join thousands of verified LA locals finding real connections every day.</p>
            <Link
              to="/signup"
              className="inline-block px-12 py-6 text-2xl font-black text-rose-600 bg-white rounded-2xl hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              Join the Community
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 dark:border-gray-800 px-6 bg-white dark:bg-gray-950 text-center sm:text-left">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-4 gap-12 mb-16">
          <div className="sm:col-span-1">
            <div className="text-2xl font-black tracking-tighter text-orange-600 mb-6">
              {businessName.toUpperCase()}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">The premier dating experience built specifically for the residents of Los Angeles.</p>
          </div>
          <div>
            <h4 className="font-bold mb-6 dark:text-white uppercase tracking-widest text-xs">Platform</h4>
            <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/signup" className="hover:text-orange-600 transition-colors">Join Now</Link>
              <Link to="/login" className="hover:text-orange-600 transition-colors">Log In</Link>
              <Link to="/subscriptions" className="hover:text-orange-600 transition-colors">Premium</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 dark:text-white uppercase tracking-widest text-xs">Community</h4>
            <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-orange-600 transition-colors">Safety Guide</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Community Rules</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Success Stories</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 dark:text-white uppercase tracking-widest text-xs">Legal</h4>
            <div className="flex flex-col gap-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-orange-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400 text-sm">
          <p>© 2026 {businessName}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Instagram</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
