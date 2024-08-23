// client/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          UnfoldMatch
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/profile" className="text-white mr-4">
                Profile
              </Link>
              <button onClick={logout} className="text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-white mr-4">
                Login
              </Link>
              <Link href="/auth/register" className="text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
