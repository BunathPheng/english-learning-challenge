import Link from "next/link"

export function Header() {
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-center items-center border-b border-gray-100 z-10 relative">
      <div className="max-w-5xl w-full flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-blue-600 transition-colors duration-200"
        >
          English Challenge
        </Link>
        <nav>
          {/* You can add navigation links here if needed */}
          {/* <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link> */}
        </nav>
      </div>
    </header>
  )
}
