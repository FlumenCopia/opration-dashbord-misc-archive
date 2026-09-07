import './globals.css';

export const metadata = {
  title: 'Operating Console — Misc Archive Private Limited',
  description: 'Dynamic financial operating dashboard with real-time Supabase cloud database sync.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
