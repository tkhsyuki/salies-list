import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if maintenance mode is enabled via Environment Variable
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    // If maintenance mode is active
    if (isMaintenanceMode) {
        // Allow access to the maintenance page itself
        if (request.nextUrl.pathname === '/maintenance') {
            return NextResponse.next();
        }

        // Allow access to static files and assets (images, css, js)
        if (
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.startsWith('/static') ||
            request.nextUrl.pathname.includes('.') // file extension check
        ) {
            return NextResponse.next();
        }

        // Redirect ALL other requests to /maintenance
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // If NOT in maintenance mode, redirect /maintenance back to home (optional but good UX)
    if (request.nextUrl.pathname === '/maintenance') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure paths that trigger the middleware
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
