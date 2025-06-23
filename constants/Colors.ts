// constants/Colors.ts
const primaryColor = '#4A90E2';
const secondaryColor = '#50E3C2';
const white = '#F5F5F5';
const black = '#121212';

export const Colors = {
  // Hanya 'light' mode yang akan kita gunakan untuk tema glassmorphism ini
  light: {
    text: white,
    white: white,
    gray: 'rgb(209, 209, 209)',
    black: black,
    background: '#F0F2F5', // Warna fallback jika gradien tidak tampil
    tint: primaryColor,
    secondary: secondaryColor,
    icon: 'rgba(0, 0, 0, 0.5)',
    tabIconDefault: 'rgba(0, 0, 0, 0.5)',
    tabIconSelected: primaryColor,
    card: 'rgba(255, 255, 255, 0.3)', // Warna dasar untuk efek kaca
    cardBorder: 'rgba(255, 255, 255, 0.3)',
    danger: '#FF2929',
    success: '#6BFFB8'
  },

};