export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-[1400px] mx-auto">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AlphaX. All rights reserved.</p>
      </div>
    </footer>
  )
}

