'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateSalt, deriveKeyFromPassword } from '@/lib/crypto-client';
import { useEncryption } from '../context/EncryptionContext';

export default function LoginPage() {
  const router = useRouter();
  const { setEncryptionKey } = useEncryption();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootText, setBootText] = useState('');

  useEffect(() => {
    // Boot sequence animation
    const bootSequence = [
      '> INITIALIZING SYSTEM...',
      '> LOADING SECURITY MODULES...',
      '> ENCRYPTING CHANNEL...',
      '> READY FOR ACCESS'
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setBootText(bootSequence[currentLine]);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      // For registration, generate salt first
      let salt = '';
      if (!isLogin) {
        salt = generateSalt();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(salt && { salt }) // Include salt only for registration
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '>>> ACCESS DENIED');
        return;
      }

      // Derive encryption key from password + salt
      const userSalt = data.salt; // Server returns salt
      const encryptionKey = await deriveKeyFromPassword(password, userSalt);
      setEncryptionKey(encryptionKey);

      // Navigate to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('>>> CONNECTION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
      <div className="cyber-panel w-full max-w-2xl p-8 relative">
        {/* ASCII Art Header */}
        <div className="mb-8 text-center">
          <pre className="neon-text terminal-text text-xs sm:text-sm mb-4 glitch overflow-x-auto">
{`
███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗
██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝
███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗
╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝
███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗
╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
`}
          </pre>
          <div className="neon-text-magenta terminal-text text-lg mb-2">
            [ NOTES SYSTEM v2.0 ]
          </div>
          <div className="neon-text-green terminal-text text-xs mb-4">
            {bootText || '> SYSTEM READY'}
          </div>
          <div className="text-xs neon-text opacity-70">
            &gt;&gt; ENCRYPTED STORAGE PROTOCOL ACTIVE
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex mb-6 gap-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-6 terminal-text transition-all ${
              isLogin
                ? 'neon-glow-btn'
                : 'border border-cyan-900 text-cyan-700'
            }`}
          >
            [ LOGIN ]
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-6 terminal-text transition-all ${
              !isLogin
                ? 'neon-glow-btn-magenta'
                : 'border border-fuchsia-900 text-fuchsia-700'
            }`}
          >
            [ REGISTER ]
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; EMAIL ADDRESS:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 cyber-input terminal-text"
              placeholder="user@cybernet.io"
              required
            />
          </div>

          <div>
            <label className="block text-sm terminal-text neon-text mb-2">
              &gt; PASSWORD:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 cyber-input terminal-text"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && (
            <div className="neon-border-magenta p-4 scan-line">
              <div className="neon-text-magenta terminal-text text-sm">
                ⚠ ERROR: {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full neon-glow-btn-green py-4 terminal-text text-lg disabled:opacity-50"
          >
            {loading ? '[ PROCESSING... ]' : isLogin ? '[ ACCESS SYSTEM ]' : '[ CREATE ACCESS ]'}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-2">
          <div className="text-xs neon-text terminal-text opacity-70">
            &gt;&gt; END-TO-END ENCRYPTION (E2E)
          </div>
          <div className="text-xs neon-text-green terminal-text">
            &gt; AES-256-GCM + PBKDF2 (100k iterations)
          </div>
          {!isLogin && (
            <div className="text-xs neon-text-yellow terminal-text mt-3 p-3 border border-yellow-900 rounded">
              ⚠ WARNING: If you forget your password, your notes cannot be recovered!
            </div>
          )}
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 neon-text text-2xl">╔</div>
        <div className="absolute top-2 right-2 neon-text text-2xl">╗</div>
        <div className="absolute bottom-2 left-2 neon-text text-2xl">╚</div>
        <div className="absolute bottom-2 right-2 neon-text text-2xl">╝</div>
      </div>
    </div>
  );
}
