import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase'; // Adjust this import path if your firebase.js is located elsewhere

export async function GET(request, { params }) {
    const shortCode = params.code;
    
    try {
        // Look up the short link in your exact Firebase path
        const linkRef = doc(db, 'artifacts', appId, 'public', 'data', 'short_links', shortCode);
        const linkSnap = await getDoc(linkRef);
        
        if (linkSnap.exists()) {
            const data = linkSnap.data();
            const targetPath = data.target; // e.g., /product/123?color=01
            
            // Perform the server-side redirect to the real product page
            return NextResponse.redirect(new URL(targetPath, request.url), 302);
        } else {
            // Fallback if the short code doesn't exist
            return NextResponse.redirect(new URL('/', request.url), 302);
        }
    } catch (err) {
        console.error("Error fetching short link:", err);
        return NextResponse.redirect(new URL('/', request.url), 302);
    }
}