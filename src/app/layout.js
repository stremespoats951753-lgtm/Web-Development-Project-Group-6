// root layout, wraps every page, includes the global stylesheet
import "./globals.css";

export const metadata = {
  title: "GamerFeed",
  description: "A social media platform for gamers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
