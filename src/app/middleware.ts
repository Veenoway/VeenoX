// // middleware.js
// import { NextResponse } from "next/server";
// import subdomains from "./subdomain.json";

// export const config = {
//   matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
// };

// export default async function middleware(req) {
//   const url = req.nextUrl;
//   const hostname = req.headers.get("host");

//   const allowedDomains = ["localhost:3000", "veenox.xyz"];
//   const isAllowedDomain = allowedDomains.some((domain) =>
//     hostname.includes(domain)
//   );

//   const subdomain = hostname.split(".")[0];

//   if (isAllowedDomain && !subdomains.some((d) => d.subdomain === subdomain)) {
//     return NextResponse.next();
//   }

//   const subdomainData = subdomains.find((d) => d.subdomain === subdomain);

//   if (subdomainData) {
//     const path = url.pathname;
//     const matchedPath = subdomainData.paths.find((p) => path.startsWith(p));

//     if (matchedPath) {
//       return NextResponse.rewrite(
//         new URL(`${matchedPath}${path.slice(matchedPath.length)}`, req.url)
//       );
//     }
//   }

//   return new Response(null, { status: 404 });
// }
