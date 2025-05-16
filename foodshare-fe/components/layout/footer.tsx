import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-6">
      <div className="container max-w-full px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">F</span>
              </div>
              <span className="text-lg font-bold tracking-tight">FoodShare</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Connecting communities to reduce food waste and fight hunger through simple food sharing.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-base font-semibold mb-2">Quick Links</h3>
            <div className="grid grid-cols-1 gap-1">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/posts?type=donation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Find Food
              </Link>
              <Link href="/posts?type=request" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Food Requests
              </Link>
              <Link href="/post/new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create a Post
              </Link>
            </div>
          </div>
          
          {/* Contact info - simplified */}
          <div>
            <h3 className="text-base font-semibold mb-2">Contact</h3>
            <div className="text-sm text-muted-foreground">
              <p>contact@foodshare.org</p>
              <p>+1 (123) 456-7890</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} FoodShare. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Facebook">
              <div className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
            </Link>
            <Link href="#" aria-label="Twitter">
              <div className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </div>
            </Link>
            <Link href="#" aria-label="Instagram">
              <div className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 