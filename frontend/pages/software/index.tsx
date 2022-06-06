import {MouseEvent, ChangeEvent} from 'react'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {GetServerSidePropsContext} from 'next/types'
import TablePagination from '@mui/material/TablePagination'

import {app} from '../../config/app'
import DefaultLayout from '../../components/layout/DefaultLayout'
import PageTitle from '../../components/layout/PageTitle'
import Searchbox from '../../components/form/Searchbox'
import FilterTechnologies from '../../components/software/FilterTechnologies'
import SortSelection from '../../components/software/SortSelection'
import SoftwareGrid from '../../components/software/SoftwareGrid'
import {SoftwareListItem} from '../../types/SoftwareTypes'
import {rowsPerPageOptions} from '../../config/pagination'
import {getSoftwareList, getTagsWithCount, TagItem} from '../../utils/getSoftware'
import {ssrSoftwareParams} from '../../utils/extractQueryParam'
import {softwareListUrl,ssrSoftwareUrl} from '../../utils/postgrestUrl'
import logger from '../../utils/logger'


export default function SoftwareIndexPage({count,page,rows,tags,software=[]}:
  {count:number,page:number,rows:number,tags:TagItem[],software:SoftwareListItem[]
}){
  // use next router (hook is only for browser)
  const router = useRouter()

  // next/previous page button
  function handlePageChange(
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ){
    const url = ssrSoftwareUrl({
      query: router.query,
      page: newPage
    })
    router.push(url)
  }

  // change number of cards per page
  function handleItemsPerPage(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ){
    const url = ssrSoftwareUrl({
      query: router.query,
      // reset to first page
      page: 0,
      rows: parseInt(event.target.value),
    })
    router.push(url)
  }

  function handleSearch(searchFor:string){
    const url = ssrSoftwareUrl({
      query: router.query,
      search: searchFor,
      // start from first page
      page: 0
    })
    router.push(url)
  }

  function handleFilters(filters:string[]){
    let filterStr
    if (filters.length > 0){
      filterStr = JSON.stringify(filters)
    }else{
      filterStr = null
    }
    const url = ssrSoftwareUrl({
      query: router.query,
      // stringified filters
      filter: filterStr,
      // start from first page
      page: 0
    })
    router.push(url)
  }

  // TODO! handle sort options
  function handleSort(sortOn:string){
    logger(`software.index.handleSort: TODO! Sort on...${sortOn}`,'warn')
  }

  return (
    <DefaultLayout>
      <Head>
        <title>Software | {app.title}</title>
      </Head>
      <PageTitle title="Software">
        <div className="flex flex-wrap justify-end">
          <div className="flex items-center">
            <Searchbox
              placeholder="Search for software"
              onSearch={handleSearch}
            />
            {/*
            NOTE! tags are replaced with keywords
            Sort is not yet implemented
            <FilterTechnologies
              items={tags}
              onSelect={handleFilters}
            />
            <SortSelection
              items={[]}
              defaultValue='Last updated'
              onSort={handleSort}
            />
            */}
          </div>
          <TablePagination
            component="nav"
            count={count}
            page={page}
            labelRowsPerPage="Per page"
            onPageChange={handlePageChange}
            rowsPerPage={rows}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleItemsPerPage}
          />
        </div>
      </PageTitle>
      <SoftwareGrid
        grid={{
          height: '17rem',
          minWidth:'26rem',
          maxWidth:'1fr'
        }}
        software={software}
      />
    </DefaultLayout>
  )
}


// fetching data server side
// see documentation https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
export async function getServerSideProps(context:GetServerSidePropsContext) {
  // extract params from page-query
  const {search,filterStr,rows,page} = ssrSoftwareParams(context)

  // construct postgREST api url with query params
  const url = softwareListUrl({
    baseUrl: process.env.POSTGREST_URL || 'http://localhost:3500',
    search,
    filters: JSON.parse(filterStr),
    order:'mention_cnt.desc.nullslast,contributor_cnt.desc.nullslast,updated_at.desc.nullslast',
    limit: rows,
    offset: rows * page,
  })
  // console.log('Software.getServerSideProps...url...',url)

  // get software list
  const software = await getSoftwareList(url)

  // will be passed as props to page
  // see params of SoftwareIndexPage function
  return {
    props: {
      count: software.count,
      page,
      rows,
      software: software.data,
    },
  }
}
