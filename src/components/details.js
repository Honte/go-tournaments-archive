export function Details({ details }) {
  return (
    <dl className={`sm:grid md:grid-cols-[min-content_1fr] sm:gap-x-4`}>
      {Object.entries(details).map(([label, detail]) => (
        <>
          <dt className="font-bold after:content-[':'] sm:text-nowrap">{label}</dt>
          <dd className="sm:text-nowrap max-md:mb-2 truncate">{detail}</dd>
        </>
      ))}
    </dl>
  )
}
