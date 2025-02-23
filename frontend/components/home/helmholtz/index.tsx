// SPDX-FileCopyrightText: 2021 - 2022 Dusan Mijatovic (dv4all)
// SPDX-FileCopyrightText: 2021 - 2022 dv4all
// SPDX-FileCopyrightText: 2022 Christian Meeßen (GFZ) <christian.meessen@gfz-potsdam.de>
// SPDX-FileCopyrightText: 2022 Helmholtz Centre Potsdam - GFZ German Research Centre for Geosciences
// SPDX-FileCopyrightText: 2022 Jesús García Gonzalez (Netherlands eScience Center) <j.g.gonzalez@esciencecenter.nl>
// SPDX-FileCopyrightText: 2022 Marc Hanisch (GFZ) <marc.hanisch@gfz-potsdam.de>
// SPDX-FileCopyrightText: 2022 Netherlands eScience Center
//
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: EUPL-1.2

/* eslint-disable @next/next/no-img-element */
import React, {useEffect, useState, useRef} from 'react'
import AOS from 'aos'
import AppHeader from '~/components/AppHeader'
import AppFooter from '~/components/AppFooter'
import Link from 'next/link'
import 'simplebar/dist/simplebar.min.css'

import LogoHelmholtz from '~/assets/logos/LogoHelmholtz.svg'
import {OrganisationForOverview} from '~/types/Organisation'

/*! purgecss start ignore */
import 'aos/dist/aos.css'
import {createJsonHeaders} from '~/utils/fetchHelpers'
import logger from '~/utils/logger'
import Image from 'next/image'
import ParticipatingOrganisations from '~/components/home/helmholtz/ParticipatingOrganisations'
import ResearchFieldCollection from './ResearchFieldCollection'
import SpotlightSection from './SpotlightSection'
/*! purgecss end ignore */

const SPOTLIGHTS= [
  {
    name: 'CrystFEL',
    description: 'CrystFEL is a suite of programs to process data from "serial crystallography" experiments.',
    image: '/images/crystfel.png',
    link: '/software/crystfel'
  },
  {
    name: 'MassBank',
    description: 'MassBank is an open source mass spectral library for the identification of small chemical molecules of metabolomics, exposomics and environmental relevance.',
    image: 'https://hifis.net/assets/img/spotlights/massbank/Atrazine_Mass_Spectrum.png',
    link: '/software/massbank'
  },
  {
    name: 'FishInspector',
    description: 'The software FishInspector provides automatic feature detections in images of zebrafish embryos (body size, eye size, pigmentation). It is Matlab-based and provided as a Windows executable (no matlab installation needed).',
    image: 'https://hifis.net/assets/img/spotlights/fishinspector/FishInspector.jpg',
    link: '/software'
  },
  {
    name: 'Golem',
    description: 'Golem is a modelling platform for thermal-hydraulic-mechanical and non-reactive chemical processes in fractured and faulted porous media.',
    image: 'https://hifis.net/assets/img/spotlights/golem/golem_preview.png',
    link: '/software/golem-a-moose-based-application'
  },
  {
    name: 'Lynx',
    description: 'LYNX (Lithosphere dYnamics Numerical toolboX) is a novel numerical simulator for modelling thermo-poromechanical coupled processes driving the deformation dynamics of the lithosphere.',
    image: 'https://hifis.net/assets/img/spotlights/lynx/lynx_logo.png',
    link: '/software/lynx-modelling-lithosperic-dynamics'
  },
  {
    name: 'MeshIt',
    description: 'The tool MeshIT generates quality tetrahedral meshes based on structural geological information. It has been developed at the GFZ Potsdam and some extensions were later added by PERFACCT. All procedures are fully automatized and require at least scattered data points as input.',
    image: 'https://hifis.net/assets/img/spotlights/meshit/meshit_logo.png',
    link: '/software/meshit'
  },
  {
    name: 'Palladio',
    description: 'Palladio is a software architecture simulation approach which analyses software at the model level for performance bottlenecks, scalability issues, reliability threats, and allows for subsequent optimisation.',
    image: 'https://hifis.net/assets/img/spotlights/palladio/palladio_preview.png',
    link: '/software/palladio'
  }
]

export default function Home() {
  const [organisations, setOrganisations] = useState<OrganisationForOverview[]>([])
  const simplebarRef = useRef()

  useEffect(() => {
    // Initialize AOS library
    AOS.init()

    // create ref for simplebar and recalculate
    // https://github.com/Grsmto/simplebar/tree/master/packages/simplebar#notifying-the-plugin-of-content-changes
    const sb: any = simplebarRef.current
    if (sb && 'recalculate' in sb) {
      sb.recalculate()
      // The following lines are a workaround to set the width of the scrollbar
      // to 33% of the container width. The resizing works when building the
      // page the first time. This method does not correct the size of the
      // scrollbar after resizing the window.
      const trackWidth = sb.axis['x'].track.el[sb.axis['x'].offsetSizeAttr]
      const scrollbarWidth = Math.round(trackWidth*0.33)
      sb.axis.x.scrollbar.el.style.width = scrollbarWidth + 'px'
    }
  }, [])

  useEffect(() => {
    async function getData () {
      const url = '/api/v1/rpc/organisations_overview?parent=is.null&software_cnt=gt.0'
      const data = await getOrganisationsList({url})
      setOrganisations(data)
    }
    getData()
  }, [])

  const resetBackgroundImage = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLDivElement)) return
    if (!(event.target.id === 'backgroundContainer')) return
    event.target.style.backgroundImage = 'url("/images/pexels-olena-bohovyk-3646172.jpg")'
  }

  // Only required if we have the "Add your software button"
  // const handleClickOpen = () => {
  //   const loginButton = document.querySelector('.rsd-login-button')
  //   if (loginButton) {
  //     const evt = new MouseEvent('click', {
  //       bubbles: true
  //     })
  //     loginButton.dispatchEvent(evt)
  //   }
  // }

  const backgroundTransitionStyle = {
    'transition': 'background 0.3s ease 0.1s',
  }

  return (
     <div className="bg-white" data-testid="rsd-helmholtz-home">

        <AppHeader/>

        {/* Head and claim */}
        <div className="bg-secondary bg-landing-page mb-10">
          <div className="flex flex-col sm:flex-row flex-wrap container mx-auto px-6 md:px-10 xl:px-0 pt-16 pb-12 max-w-screen-xl text-white">
            <div className="min-w-min flex flex-col">
              <LogoHelmholtz width="220" />
              {/* <a onClick={handleClickOpen}>
              <div className="w-[250px] bg-[#05e5ba] hover:bg-primary text-secondary hover:text-white text-center font-medium text-2xl py-4 px-6 rounded-sm">
              Add your software
              </div>
              </a> */}
            </div>
            <div className="my-auto pt-4 md:pt-0 ml-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl md:max-w-md lg:max-w-xl">Promote and Discover Research Software</h1>
              <div className="text-xl lg:text-2xl">Because software matters</div>
              <div className="flex pt-8">
                <Link href="/software" passHref>
                  <a>
                    <div className="w-[250px] bg-[#05e5ba] hover:bg-primary text-secondary text-center font-medium text-2xl py-4 px-6 rounded-full">
                      Browse software
                    </div>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Teaser */}
        {/* <div className="container mx-auto p-6 md:p-10 xl:py-10 xl:px-0 max-w-screen-xl text-secondary">
          <h2 className='text-5xl'>Making Research Software Sustainable</h2>
          <div className='text-2xl mt-2'>
            This service is a <span className='hgf-text-highlight'>teaser</span> for the upcoming Helmholtz Research
            Software Directory, a <span className='hgf-text-highlight'>showcase for research software</span> developed
            within the <a href="https://helmholtz.de" target="_blank" className='underline' rel="noreferrer">Helmholtz
              federation</a>. Our goals are to
            <div className='flex flex-row pt-4'>
              <ul className="mx-auto px-6 my-4 list-disc">
                <li className='py-4'>collect and improve the visibility of research software developed in Helmholtz</li>
                <li className='py-4'>promote FAIR principles in research software development</li>
                <li className='py-4'>monitor the impact of your software</li>
              </ul>
            </div>
            We are in <span className='hgf-text-highlight'>active development</span> and login for all Helmholtz members will be activated soon.
            Please stay tuned for future updates, explore the current state of the directory, and have a look at our <a
              href="#Upcoming" className='underline'>upcoming features</a>.
          </div>
        </div> */}

        {/* Software spotlights */}
        <div className="container mx-auto p-6 md:p-10 xl:py-10 max-w-screen-xl text-secondary">
          <h2 className='text-5xl'>Software Spotlights</h2>
          <div className='text-2xl mt-2'>The latest outstanding software product developed in Helmholtz.</div>
          <div className="w-full">
            <SpotlightSection spotlights={SPOTLIGHTS} />
          </div>
        </div>

        {/* Software meta repository */}
        <div className="conainer mx-auto my-10 max-w-screen-xl text-white bg-secondary">
          <div
            id="backgroundContainer"
            className="w-full h-full p-12 bg-blend-multiply bg-center bg-cover bg-[#002864] bg-opacity-75 bg-[url(/images/pexels-olena-bohovyk-3646172.jpg)]"
            style={backgroundTransitionStyle}
            onMouseLeave={resetBackgroundImage}>
            <h2 className='text-5xl'>Discover software by research topic</h2>
            {/* <div className="text-xl my-4">Browse Software by Research Topic</div> */}
            <ResearchFieldCollection />
          </div>
        </div>

        {/* Teaser */}
        <div className="conainer mx-auto p-6 md:p-10 xl:py-10 max-w-screen-xl text-secondary">
          <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-20'>
            <div className='text-2xl'>
              <h2 id="Upcoming" className='text-5xl pb-10'>Upcoming</h2>
              <div>We are continuously updating this service. Upcoming features include:</div>
              <ul className="px-6 my-4 list-disc">
                <li className="py-4">Login with your Helmholtz Institution&apos;s account</li>
                <li className="py-4">Add your own software products</li>
                <li className="py-4">Add related projects, funding and institutions</li>
                <li className="py-4">Obtain license consultation from HIFIS</li>
              </ul>
              <div className="py-2">Do you have <span className="hgf-text-highlight">suggestions for improvements or new features</span>?</div>
              <div className="py-2">Please let us know! Send us an <a href="mailto:support@hifis.net?subject=Comments about RSD" className="hgf-text-highlight underline">e-mail</a>, or open an <a href="https://github.com/hifis-net/RSD-as-a-service/issues" target="_blank" className="bg-[#cdeefb] underline" rel="noreferrer">issue</a> in our GitHub repository.</div>
            </div>
            <div className="hidden md:block overflow-clip relative h-full">
              <Image
                layout='fill'
                objectFit='cover'
                alt="Someone typing on a laptop"
                src="/images/pexels-cottonbro-5483075.jpg"
              />
            </div>
          </div>
        </div>

        {/* Participating organsiations */}
        {
          organisations.length > 0 &&
          <div className="container mx-auto p-6 md:p-10 xl:py-10 max-w-screen-xl text-secondary">
            <div className="py-6">
              <h2 className="text-5xl pb-2">Contributions</h2>
              <div className='text-2xl'>We present software contributions by</div>
                <ParticipatingOrganisations organisations={organisations} sbRef={simplebarRef}/>
              <div className='text-xl pt-2'>Your organisation is not in the list? We will open the RSD for self service soon. Stay tuned.</div>
            </div>
          </div>
        }

        {/* For RSEs and Researchers */}
        {/* <div className="conainer mx-auto p-6 md:p-10 max-w-screen-xl text-secondary">
          <div className='py-6'>
            <h2 className='text-5xl'>For RSEs and Researchers</h2>
            <div className="text-2xl my-4">A place for Research Software that is being developed in the Helmholtz Association.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">

              <div className='text-center text-2xl py-4'>
                <div className="pb-4">For Research Software Engineers</div>
                <div className="grid gridl-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="aspect-video grid place-items-center bg-center bg-cover group text-white bg-promote">
                    <div className="group-hover:hidden text-4xl">Promote</div>
                    <div className="hidden group-hover:block justify-center m-2">Increase the impact of your software by reaching a broader audience</div>
                  </div>
                  <div className="aspect-video grid place-items-center bg-center bg-cover group text-white bg-reference">
                    <div className="group-hover:hidden text-4xl">Impact</div>
                    <div className="hidden group-hover:block justify-center m-2">Gain acknowledgement by proper citation of your code</div>
                  </div>
                </div>
              </div>

              <div className='text-center text-2xl my-4'>
                <div className="mb-4">For Researchers</div>
                <div className="grid gridl-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="aspect-video grid place-items-center bg-center bg-cover group text-white bg-discover">
                    <div className="group-hover:hidden text-4xl">Discover</div>
                    <div className="hidden group-hover:block justify-center m-2">Discover software relevant to your research interest</div>
                  </div>
                  <div className="aspect-video grid place-items-center bg-center bg-cover group text-white bg-cite">
                    <div className="group-hover:hidden text-4xl">Cite</div>
                    <div className="hidden group-hover:block justify-center m-2">Version specific bibliography supports correct software citation</div>
                  </div>
                </div>
              </div>
              <div className="">
                <a onClick={handleClickOpen}>
                  <div className="w-[250px] bg-[#05e5ba] hover:bg-primary text-secondary hover:text-white text-center font-medium text-2xl py-4 px-6 rounded-sm">
                    Add your software
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div> */}
        <AppFooter/>
      </div>
  )
}

async function getOrganisationsList({url, token}: {url: string, token?: string}) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token),
      },
    })

    if ([200, 206].includes(resp.status)) {
      const organisationList: OrganisationForOverview[] = await resp.json()

      const shuffled_data = []
      while (organisationList.length > 0) {
        let rnd = Math.floor(Math.random() * (organisationList.length))
        shuffled_data.push(organisationList.splice(rnd, 1)[0])
      }

      return shuffled_data
    }
    // otherwise request failed
    logger(`getOrganisationsList failed: ${resp.status} ${resp.statusText}`, 'warn')
    // we log and return zero
    return []
  } catch (e: any) {
    logger(`getOrganisationsList: ${e?.message}`, 'error')
    return []
  }
}
