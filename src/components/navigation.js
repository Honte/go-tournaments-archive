import Link from 'next/link';

export function Navigation({ locale }) {
  return (
    <nav className="absolute top-0 flex h-screen flex-col justify-between border-e bg-pgc-light w-20">
      <ul className="mt-6 space-y-1">
        <li><Link href={`/${locale}`}>Home</Link></li>
        <li><Link href={`/${locale}/stats`}>Stats</Link></li>
        <li>2023</li>
        <li>2022</li>
        <li>2021</li>
        <li>2020</li>
      </ul>
    </nav>
  )
}
