export function Footer() {
  return (
    <footer className="w-full bg-white shadow-md py-6 px-6 flex justify-center items-center border-t border-gray-100 mt-8">
      <div className="max-w-5xl w-full text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} My English Learning Challenge. All rights reserved.
      </div>
    </footer>
  )
}
export default Footer;