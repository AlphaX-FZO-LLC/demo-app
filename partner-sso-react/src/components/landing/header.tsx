import Link from "next/link"
import { Github } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "../common/language-switcher"
import { ThemeModeToggle } from "../common/theme-switcher"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0  max-w-[1400px] mx-auto">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">AlphaX</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="https://github.com" target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <ThemeModeToggle />
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  )
}

const navItems = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#docs",
    label: "Documentation",
  },
]
