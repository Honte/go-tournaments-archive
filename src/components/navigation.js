import Link from 'next/link';

export function Navigation({ locale }) {
  return (
    <nav>
      <ul>
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
