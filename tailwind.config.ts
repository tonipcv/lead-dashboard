import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		fontFamily: {
  			sans: ["var(--font-sans)"],
  		},
  		backgroundColor: {
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			primary: "hsl(var(--primary))",
  			secondary: "hsl(var(--secondary))",
  			muted: "hsl(var(--muted))",
  			accent: "hsl(var(--accent))",
  			popover: "hsl(var(--popover))",
  			card: "hsl(var(--card))",
  		},
  		textColor: {
  			foreground: "hsl(var(--foreground))",
  			primary: "hsl(var(--primary))",
  			secondary: "hsl(var(--secondary))",
  			muted: "hsl(var(--muted))",
  			accent: "hsl(var(--accent))",
  			popover: "hsl(var(--popover))",
  			card: "hsl(var(--card))",
  		},
  		borderColor: {
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
  		letterSpacing: {
  			tighter: "var(--letter-spacing)",
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
