// /client/components/Dashboard/SideNav.tsx
import Link from 'next/link';

const SideNav = () => {
  return (
    <nav className="w-64 bg-background border-r h-[calc(100vh-4rem)] fixed top-16 left-0 overflow-y-auto">
      <ul className="p-4">
        <li className="mb-2">
          <Link href="/dashboard/profile" className="block p-2 hover:bg-accent rounded">
            Profile
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/dashboard/matches" className="block p-2 hover:bg-accent rounded">
            Matches
          </Link>
        </li>
        <li className="mb-2">
          <Link href="/dashboard/friends" className="block p-2 hover:bg-accent rounded">
            Friends
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;