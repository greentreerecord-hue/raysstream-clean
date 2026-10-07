export const metadata = {
  metadataBase: new URL("https://www.raysstream.com"),
  title: "Ray'sStream",
  description:
    "Watch original videos, discover creators, and enjoy music on Ray'sStream.",
  openGraph: {
    title: "Ray'sStream",
    description:
      "Watch original videos, discover creators, and enjoy music on Ray'sStream.",
    siteName: "Ray'sStream",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ray'sStream",
    description:
      "Watch original videos, discover creators, and enjoy music on Ray'sStream.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 
