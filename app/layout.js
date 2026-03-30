import './globals.css'

export const metadata = {
  title: 'CPTED Mastery Program',
  description: 'ICA ICCP Certification Learning Path — CPTED 精通學習計畫',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fira+Code:wght@400&family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
