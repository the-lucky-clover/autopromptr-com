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
				// Cyberpunk Neon System
				neon: {
					cyan: 'hsl(var(--neon-cyan))',
					magenta: 'hsl(var(--neon-magenta))',
					yellow: 'hsl(var(--neon-yellow))',
					orange: 'hsl(var(--neon-orange))',
					pink: 'hsl(var(--neon-pink))',
					purple: 'hsl(var(--neon-purple))',
					blue: 'hsl(var(--neon-blue))',
					green: 'hsl(var(--neon-green))'
				},
				'blade-runner': {
					gold: 'hsl(var(--blade-runner-gold))',
					rose: 'hsl(var(--blade-runner-rose))',
					teal: 'hsl(var(--blade-runner-teal))',
					violet: 'hsl(var(--blade-runner-violet))'
				},
				glow: {
					cyan: 'hsl(var(--glow-cyan))',
					magenta: 'hsl(var(--glow-magenta))',
					yellow: 'hsl(var(--glow-yellow))',
					pink: 'hsl(var(--glow-pink))',
					purple: 'hsl(var(--glow-purple))',
					blue: 'hsl(var(--glow-blue))',
					orange: 'hsl(var(--glow-orange))'
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
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'fly-in': {
					'0%': { opacity: '0', transform: 'translateX(-50px) translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0) translateY(0)' }
				},
				'materialize': {
					'0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(100%)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'cyber-rain': {
					'0%': { transform: 'translateY(-100vh)', opacity: '0' },
					'10%': { opacity: '0.8' },
					'90%': { opacity: '0.8' },
					'100%': { transform: 'translateY(100vh)', opacity: '0' }
				},
				'neon-pulse': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 10px hsl(var(--neon-cyan) / 0.6)) drop-shadow(0 0 20px hsl(var(--neon-cyan) / 0.4))'
					},
					'50%': { 
						filter: 'drop-shadow(0 0 20px hsl(var(--neon-magenta) / 0.8)) drop-shadow(0 0 40px hsl(var(--neon-magenta) / 0.6))'
					}
				},
				'holographic-shift': {
					'0%': { transform: 'translateX(-100%) translateY(-100%) rotate(0deg)' },
					'100%': { transform: 'translateX(100%) translateY(100%) rotate(360deg)' }
				},
				'addictive-pulse': {
					'0%, 100%': { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
					'25%': { transform: 'scale(1.02)', filter: 'brightness(1.1) saturate(1.2)' },
					'50%': { transform: 'scale(1.04)', filter: 'brightness(1.15) saturate(1.3)' },
					'75%': { transform: 'scale(1.02)', filter: 'brightness(1.1) saturate(1.2)' }
				},
				'optical-rotation': {
					'0%': { transform: 'rotate(0deg) scale(1.5)' },
					'100%': { transform: 'rotate(360deg) scale(1.5)' }
				},
				'3d-float': {
					'0%, 100%': { transform: 'translateY(0px) translateZ(0px) rotateX(0deg)' },
					'50%': { transform: 'translateY(-10px) translateZ(20px) rotateX(5deg)' }
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
				},
				'shimmer-45': {
					'0%': { 
						backgroundPosition: '-200% -200%',
						opacity: '0' 
					},
					'50%': { opacity: '1' },
					'100%': { 
						backgroundPosition: '200% 200%',
						opacity: '0' 
					}
				},
				'shimmer-stagger': {
					'0%, 70%': { 
						backgroundPosition: '-200% center',
						opacity: '0' 
					},
					'80%, 90%': { opacity: '1' },
					'100%': { 
						backgroundPosition: '200% center',
						opacity: '0' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'fade-out': 'fade-out 0.6s ease-out forwards',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'fly-in': 'fly-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'materialize': 'materialize 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'cyber-rain': 'cyber-rain 3s linear infinite',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'holographic-shift': 'holographic-shift 6s linear infinite',
				'addictive-pulse': 'addictive-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'optical-rotation': 'optical-rotation 8s linear infinite',
				'3d-float': '3d-float 6s ease-in-out infinite',
				'psychedelic-flow': 'psychedelic-flow 8s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'rainbow-shift': 'rainbow-shift 12s linear infinite',
				'subtle-breathe': 'subtle-breathe 4s ease-in-out infinite',
				'float-gentle': 'float-gentle 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'shimmer-45': 'shimmer-45 4s infinite',
				'shimmer-45-rare': 'shimmer-45 8s infinite 2s',
				'shimmer-stagger': 'shimmer-stagger 6s infinite',
				'shimmer-stagger-delay': 'shimmer-stagger 6s infinite 2s',
				'shimmer-persistent': 'shimmer-45 3s infinite',
				'shimmer-rare': 'shimmer-stagger 12s infinite 3s'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-blade-runner': 'var(--gradient-blade-runner)',
				'gradient-cyberpunk-rain': 'var(--gradient-cyberpunk-rain)',
				'gradient-depth': 'var(--gradient-depth)',
				'bg-radial-vignette': 'var(--bg-radial-vignette)',
				'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.4) 50%, transparent 100%)'
			},
			boxShadow: {
				'neon-sm': 'var(--shadow-neon-sm)',
				'neon-md': 'var(--shadow-neon-md)',
				'neon-lg': 'var(--shadow-neon-lg)',
				'neon-xl': 'var(--shadow-neon-xl)',
				'3d-raised': 'var(--shadow-3d-raised)',
				'3d-inset': 'var(--shadow-3d-inset)',
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