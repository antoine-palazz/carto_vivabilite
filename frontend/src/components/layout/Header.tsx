'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        'relative z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-carte-border-subtle bg-carte-bg-secondary/80 px-4 backdrop-blur-xl lg:px-6',
        className
      )}
    >
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-carte-accent-primary to-carte-accent-secondary">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight text-carte-text-primary">
            Carte de Vivabilité
          </h1>
          <p className="hidden text-xs text-carte-text-muted sm:block">
            Trouvez votre lieu de vie idéal
          </p>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden items-center gap-1 md:flex">
        <NavLink href="#" active>
          Carte
        </NavLink>
        <NavLink href="#">À propos</NavLink>
        <NavLink href="#">Méthodologie</NavLink>
        <NavLink href="#">Contact</NavLink>
      </nav>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-carte-text-secondary transition-colors hover:bg-carte-bg-tertiary hover:text-carte-text-primary md:hidden"
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-carte-border-subtle bg-carte-bg-secondary/95 p-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            <MobileNavLink href="#" active onClick={() => setIsMenuOpen(false)}>
              Carte
            </MobileNavLink>
            <MobileNavLink href="#" onClick={() => setIsMenuOpen(false)}>
              À propos
            </MobileNavLink>
            <MobileNavLink href="#" onClick={() => setIsMenuOpen(false)}>
              Méthodologie
            </MobileNavLink>
            <MobileNavLink href="#" onClick={() => setIsMenuOpen(false)}>
              Contact
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-carte-accent-primary/10 text-carte-accent-primary'
          : 'text-carte-text-secondary hover:bg-carte-bg-tertiary hover:text-carte-text-primary'
      )}
    >
      {children}
    </a>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick?: () => void;
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
        active
          ? 'bg-carte-accent-primary/10 text-carte-accent-primary'
          : 'text-carte-text-secondary hover:bg-carte-bg-tertiary hover:text-carte-text-primary'
      )}
    >
      {children}
    </a>
  );
}
