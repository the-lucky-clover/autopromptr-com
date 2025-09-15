
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Pastel Psychedelic Color System
				pastel: {
					pink: 'hsl(var(--pastel-pink))',
					purple: 'hsl(var(--pastel-purple))',
					blue: 'hsl(var(--pastel-blue))',
					cyan: 'hsl(var(--pastel-cyan))',
					mint: 'hsl(var(--pastel-mint))',
					peach: 'hsl(var(--pastel-peach))',
					lavender: 'hsl(var(--pastel-lavender))',
					rose: 'hsl(var(--pastel-rose))'
				},
				glow: {
					pink: 'hsl(var(--glow-pink))',
					purple: 'hsl(var(--glow-purple))',
					blue: 'hsl(var(--glow-blue))',
					cyan: 'hsl(var(--glow-cyan))',
					mint: 'hsl(var(--glow-mint))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'psychedelic-flow': {
					'0%, 100%': { 
						backgroundPosition: '0% 50%',
						filter: 'hue-rotate(0deg) brightness(1) saturate(1)'
					},
					'25%': { 
						backgroundPosition: '100% 50%',
						filter: 'hue-rotate(45deg) brightness(1.1) saturate(1.2)'
					},
					'50%': { 
						backgroundPosition: '100% 100%',
						filter: 'hue-rotate(90deg) brightness(1.2) saturate(1.4)'
					},
					'75%': { 
						backgroundPosition: '0% 100%',
						filter: 'hue-rotate(135deg) brightness(1.1) saturate(1.2)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						filter: 'drop-shadow(0 0 20px hsl(var(--glow-purple) / 0.6)) drop-shadow(0 0 40px hsl(var(--glow-blue) / 0.4))'
					},
					'50%': {
						filter: 'drop-shadow(0 0 30px hsl(var(--glow-pink) / 0.8)) drop-shadow(0 0 60px hsl(var(--glow-cyan) / 0.6))'
					}
				},
				'rainbow-shift': {
					'0%': { backgroundPosition: '0% 0%', transform: 'translateX(0)' },
					'25%': { backgroundPosition: '25% 25%', transform: 'translateX(2px)' },
					'50%': { backgroundPosition: '50% 50%', transform: 'translateX(0)' },
					'75%': { backgroundPosition: '75% 75%', transform: 'translateX(-2px)' },
					'100%': { backgroundPosition: '100% 100%', transform: 'translateX(0)' }
				},
				'subtle-breathe': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.9' },
					'50%': { transform: 'scale(1.02) rotate(0.5deg)', opacity: '1' }
				},
				'float-gentle': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-up': 'slide-up 0.6s ease-out',
				'psychedelic-flow': 'psychedelic-flow 8s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'rainbow-shift': 'rainbow-shift 12s linear infinite',
				'subtle-breathe': 'subtle-breathe 4s ease-in-out infinite',
				'float-gentle': 'float-gentle 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-psychedelic': 'var(--gradient-psychedelic)',
				'gradient-glow': 'var(--gradient-glow)',
				'gradient-rainbow-flow': 'var(--gradient-rainbow-flow)',
				'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)'
			},
			boxShadow: {
				'glow-sm': 'var(--shadow-glow-sm)',
				'glow-md': 'var(--shadow-glow-md)',
				'glow-lg': 'var(--shadow-glow-lg)',
				'glow-xl': 'var(--shadow-glow-xl)',
				'pastel-glow': 'var(--shadow-pastel-glow)'
			},
			fontFamily: {
				'orbitron': ['Orbitron', 'monospace'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
