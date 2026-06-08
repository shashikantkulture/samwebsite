import type { Metadata } from "next";
import { Archivo_Narrow, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { CartProvider } from "../context/CartContext";

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAMM Renaissance | Designer Clothing, Premium Gowns & Accessories",
  description: "Discover SAMM Renaissance, a luxury fashion boutique offering premium velvet jumpsuits, toddler fairy gowns, co-ords, waistcoat tops, and custom accessories. Shop custom couture fashion online.",
  keywords: "samm renaissance, designer gowns, velvet jumpsuits, co-ords, luxury clothing, luxury fashion accessories, custom kids dresses",
  authors: [{ name: "SAMM Renaissance Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivoNarrow.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var mutation = mutations[i];
                    if (mutation.type === 'attributes' && mutation.attributeName === 'fdprocessedid') {
                      mutation.target.removeAttribute('fdprocessedid');
                    }
                    if (mutation.addedNodes) {
                      for (var j = 0; j < mutation.addedNodes.length; j++) {
                        var node = mutation.addedNodes[j];
                        if (node.nodeType === 1) {
                          if (node.hasAttribute('fdprocessedid')) {
                            node.removeAttribute('fdprocessedid');
                          }
                          var children = node.querySelectorAll('[fdprocessedid]');
                          for (var k = 0; k < children.length; k++) {
                            children[k].removeAttribute('fdprocessedid');
                          }
                        }
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['fdprocessedid']
                });
              })();
            `
          }}
        />
      </head>
      <body className="bg-white text-zinc-900 font-sans min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <AppProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AppProvider>
      </body>
    </html>
  );
}
