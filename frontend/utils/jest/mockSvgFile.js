// SPDX-FileCopyrightText: 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2022 dv4all
//
// SPDX-License-Identifier: Apache-2.0

function mockSvgFile(...props) {
  return `__mockSvgFile__:${JSON.stringify(props)}`
}

module.exports=mockSvgFile
