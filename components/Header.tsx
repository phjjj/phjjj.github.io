import Link from "next/link";

export default function Header() {
  return (
    <nav className="w-full border-b border-border px-8 py-5 bg-cream/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex justify-center items-center">
        <ul className="flex gap-8 text-xs font-semibold tracking-widest text-subtle">
          <li>
            <Link href="/" className="hover:text-crimson transition-colors uppercase">
              POST
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
