// SPDX-FileCopyrightText: 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2022 dv4all
//
// SPDX-License-Identifier: Apache-2.0

export default function EditSection({children,className=''}:{children:any,className?:string}) {
  return (
    <section className={`flex-1 md:pl-[3rem] ${className}`}>
      {children}
    </section>
  )
}
