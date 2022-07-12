// SPDX-FileCopyrightText: 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2022 Jesús García Gonzalez (Netherlands eScience Center) <j.g.gonzalez@esciencecenter.nl>
// SPDX-FileCopyrightText: 2022 Netherlands eScience Center
// SPDX-FileCopyrightText: 2022 dv4all
// SPDX-FileCopyrightText: 2022 Marc Hanisch (GFZ) <marc.hanisch@gfz-potsdam.de>
// SPDX-FileCopyrightText: 2022 Helmholtz Centre Potsdam - GFZ German Research Centre for Geosciences
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Colors for both themes
 * Tailwind and MUI-5 based on MUI-5 definitions
 */

const colors = {
  base: {
    // background color for the body - mui: paper and background
    100: '#0a0a0a',
    // background color variation
    200: '#151515',
    // background color variation
    300: '#cdeefb', /* Secondary Highlight Blue */
  },
  // mui - text.primary
  'base-content':'rgba(255,255,255,0.87)',
  // mui - text.disabled
  'base-content-disabled':'rgba(255,255,255,0.45)',
  // mui - primary.main
  primary:'#14c8ff', /* Primary Light Blue */
  // mui - primary.contrastText
  'primary-content':'white',
  // mui - secondary.main
  secondary:'#002864', /* Primary Blue */
  // mui - secondary.contrastText
  'secondary-content':'white',
  // mui - not existing in mui
  accent:'#73095d',
  'accent-content':'white',
  // snackbar colors by type
  error:'#e53935',
  'error-content':'black',
  warning:'#ed6c02',
  'warning-content':'black',
  info:'#0288d1',
  'info-content':'black',
  success:'#2e7d32',
  'success-content': 'white',
  // actions for buttons, comboxes etc.
  action: {
    active: 'rgba(255, 255, 255, 0.54)',
    hover: 'rgba(255, 255, 255, 0.4)',
    hoverOpacity: 0.1,
    selected: 'rgba(255, 255, 255, 0.08)',
    selectedOpacity: 0.16,
    disabled: 'rgba(255, 255, 255, 0.26)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(255, 255, 255, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12
  },
  // mui - divider is on base-300
  // divider:'#ddd',
  // contrastText:'#fff',
  // black:'#000',
  // white: '#fff',
  // background: '#fff',
  // paper: '#fff',
  // grey: {
  //   50: '#fafafa',
  //   100: '#f5f5f5',
  //   200: '#eeeeee',
  //   300: '#e0e0e0',
  //   400: '#bdbdbd',
  //   500: '#9e9e9e',
  //   600: '#757575',
  //   700: '#616161',
  //   800: '#424242',
  //   900: '#212121',
  //   A100: '#f5f5f5',
  //   A200: '#eeeeee',
  //   // tailwind neutral is A400 in MUI
  //   A400: '#909090',
  //   A700: '#616161',
  // }
}

/**
 * Breakpoints to use in both themes
 * Note! Tailwind uses string and MUI-5 numeric values
 */
// const breakpoints = {
//   xs: 640,
//   sm: 768,
//   md: 1024,
//   lg: 1280,
//   xl: 1920
// }

module.exports={
  colors
}
