import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="px-3 pb-6 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-bento-lg bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-8 text-white shadow-bento sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              Shop<span className="text-accent">Sphere</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-300">
              Where great sound meets great shopping. Premium audio and tech,
              curated for people who love what they hear.
            </p>
            <p className="mt-6 inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-medium tracking-wide uppercase">
              Sound. Style. Sphere.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/products" className="text-gray-200 transition hover:text-accent">All products</Link></li>
              <li><Link to="/cart" className="text-gray-200 transition hover:text-accent">Your cart</Link></li>
              <li><Link to="/profile" className="text-gray-200 transition hover:text-accent">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-200">
              <li>Free shipping over $50</li>
              <li>30-day easy returns</li>
              <li>support@shopsphere.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <p>Made with care for music lovers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
