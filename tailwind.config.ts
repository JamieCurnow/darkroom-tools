import type { Config } from 'tailwindcss'
import { black, white, transparent, current, red } from 'tailwindcss/colors'

export default <Partial<Config>>{
  theme: {
    container: {
      center: true,
      DEFAULT: '1rem',
      sm: '2rem',
      lg: '4rem',
      xl: '5rem',
      '2xl': '6rem'
    },
    fontFamily: {
      poppins: ['Poppins', 'sans-serif'],
      brown: ['Brown', 'sans-serif']
    },
    colors: {
      black,
      white,
      red,
      transparent,
      current,
      green: {
        DEFAULT: '#114B30',
        50: '#40D48F',
        100: '#2FD085',
        200: '#28AF70',
        300: '#208E5B',
        400: '#196C45',
        500: '#114B30',
        600: '#071D13',
        700: '#000000',
        800: '#000000',
        900: '#000000',
        950: '#000000'
      },
      lightGray: {
        // "Light Gray"
        DEFAULT: '#ECECEA',
        50: '#F9F9F9', // "Lightest Gray"
        100: '#F9F9F9', // "Lightest Gray"
        200: '#F9F9F9', // "Lightest Gray"
        300: '#F9F9F9', // "Lightest Gray"
        400: '#F9F9F9', // "Lightest Gray"
        500: '#ECECEA', // "Light Gray"
        600: '#D1D1CD',
        700: '#B7B7AF',
        800: '#9C9C92',
        900: '#818175',
        950: '#727267'
      },
      almostBlack: {
        // "Almost Black"
        DEFAULT: '#1E1E1E',
        50: '#7A7A7A',
        100: '#707070',
        200: '#5B5B5B',
        300: '#474747',
        400: '#323232',
        500: '#1E1E1E',
        600: '#020202',
        700: '#000000',
        800: '#000000',
        900: '#000000',
        950: '#000000'
      },
      gray: {
        DEFAULT: '#9da9b7',
        '50': '#f5f7f8',
        '100': '#edf0f2',
        '200': '#dee4e7',
        '300': '#c9d1d8',
        '400': '#b2bdc7',
        '500': '#9da9b7',
        '600': '#8a94a6',
        '700': '#747d8e',
        '800': '#5f6774',
        '900': '#50555f',
        '950': '#2f3237'
      }
    }
  }
}
