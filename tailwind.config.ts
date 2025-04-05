import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#152A43',
        'mid-blue': '#273B54',
        'dark-purple': '#534E66',
        'light-purple': '#876A79',
        'dark-orange': '#C58560',
        'light-orange': '#F3AE6',
        'dark-cream': '#F8D6A9',
        'light-cream': '#FCEDD8',
      },
    }
  }
}
export default config
