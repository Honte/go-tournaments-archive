import { notFound } from 'next/navigation';

export default function Edition({ params: { year }}) {
  if (!year.match(/^\d{4}$/)) {
    return notFound();
  }

  return (
    <article className="container mx-auto px-2 bg-red-50">
      <p>{year}</p>
    </article>
  )
}
