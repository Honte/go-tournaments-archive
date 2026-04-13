export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="size-16 animate-spin rounded-full border-12 border-event-bg border-t-event-dark"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
