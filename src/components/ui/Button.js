export function Button({ children }) {
  return (
    <button className="bg-gray-300 hover:bg-gray-400 text-pgc-dark font-bold py-0.5 px-2 rounded inline-flex items-center cursor-pointer">
      {children}
    </button>
  );
}
