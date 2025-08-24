import { useState, useEffect } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (email && password) {
        console.log("Logging in...");
      } else {
        setError("Please fill in all fields");
      }
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic background with mouse tracking */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(229, 9, 20, 0.15), transparent 40%)`
        }}
      ></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Replace X with Ω */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-9xl text-red-500/20 font-bold opacity-30 flex items-center justify-center">
          Ω
        </div>
        
        {/* Grid pattern with Netflix red smoke effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(229, 9, 20, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(229, 9, 20, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            animation: 'gridMove 20s linear infinite'
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent animate-pulse">
                Login
              </span>
            </h1>
          </div>

          {/* Form container */}
          <div className="relative group">
            {/* Animated border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              {/* Form */}
              <div className="space-y-8">
                {/* Email field */}
                <div className="relative group/input">
                  <label className="block text-sm font-semibold text-gray-300 mb-3 group-hover/input:text-red-400 transition-colors duration-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-black/50 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 hover:border-gray-600 hover:bg-black/70 group-hover/input:border-red-400"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password field */}
                <div className="relative group/input">
                  <label className="block text-sm font-semibold text-gray-300 mb-3 group-hover/input:text-red-400 transition-colors duration-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-black/50 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-300 hover:border-gray-600 hover:bg-black/70 group-hover/input:border-red-400"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="relative overflow-hidden p-4 bg-red-900/30 border border-red-500/50 rounded-2xl animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"></div>
                    <p className="relative text-red-300 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="relative w-full group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-2xl transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <div className="relative px-6 py-4 font-bold text-lg text-white rounded-2xl transform group-hover/btn:scale-105 transition-all duration-200 group-active/btn:scale-95 flex items-center justify-center">
                    {loading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="animate-pulse">Authenticating...</span>
                      </div>
                    ) : (
                      <span className="group-hover/btn:tracking-wider transition-all duration-300">
                        SIGN IN
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  );
}