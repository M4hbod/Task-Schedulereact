/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			screens: {
				desktop: "1650px",
			},
		},
	},
	plugins: [require("tailwindcss-debug-screens")],
}
