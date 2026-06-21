import React from 'react';

interface GoogleSignInButtonProps {
  onClick: () => void;
  loading?: boolean;
  text?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  loading = false,
  text = 'Continue with Google',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-brand-pink/60 rounded-full bg-white text-xs font-semibold text-brand-dark hover:bg-brand-pink/10 hover:border-brand-terracotta/40 transition-all duration-300 shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-brand-terracotta"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          width="24px"
          height="24px"
        >
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              fill="#EA4335"
              d="M20.64,12.2c0-0.63-0.06-1.25-0.16-1.84H12v3.49h4.84c-0.21,1.12-0.84,2.07-1.79,2.7l2.77,2.15 C19.44,17.21,20.64,14.92,20.64,12.2z"
            />
            <path
              fill="#4285F4"
              d="M12,21c2.43,0,4.47-0.81,5.96-2.19l-2.77-2.15c-0.77,0.52-1.75,0.83-2.8,0.83c-2.37,0-4.38-1.6-5.1-3.76L4.47,15.7 C6,18.73,9.15,21,12,21z"
            />
            <path
              fill="#FBBC05"
              d="M6.9,13.73C6.72,13.19,6.62,12.61,6.62,12s0.1-1.19,0.28-1.73L4.85,8.08C4.24,9.29,3.9,10.61,3.9,12 s0.34,2.71,0.95,3.92L6.9,13.73z"
            />
            <path
              fill="#34A853"
              d="M12,6.38c1.32,0,2.5,0.45,3.43,1.35l2.58-2.58C16.47,3.69,14.43,3,12,3C9.15,3,6,5.27,4.47,8.3 L6.9,10.27C7.62,8.11,9.63,6.38,12,6.38z"
            />
          </g>
        </svg>
      )}
      <span>{loading ? 'Connecting...' : text}</span>
    </button>
  );
};
