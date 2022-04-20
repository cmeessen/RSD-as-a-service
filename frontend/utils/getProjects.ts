import {Contributor, TeamMemberProps} from '../types/Contributor'
import {MentionForProject} from '../types/Mention'
import {
  OrganisationsOfProject, Project,
  ProjectLink, ProjectTag, ProjectTopic, RawProject, RelatedProject
} from '../types/Project'
import {RelatedTools, Tag} from '../types/SoftwareTypes'
import {getUrlFromLogoId} from './editOrganisation'
import {extractCountFromHeader} from './extractCountFromHeader'
import {createJsonHeaders} from './fetchHelpers'
import {getPropsFromObject} from './getPropsFromObject'
import logger from './logger'
import {paginationUrlParams} from './postgrestUrl'
import {sortOnStrProp} from './sortFn'

export async function getProjectList({rows=12,page=0,baseUrl='/api/v1',searchFor,token}:
  {rows: number, page: number, baseUrl?: string, searchFor?: string,token?:string}
){
  try {
    const columns = 'id,slug,title,subtitle,date_start,date_end,updated_at,is_published,image_for_project(project)'
    let url = `${baseUrl}/project?select=${columns}`
    // search
    if (searchFor) {
      url += `&or=(title.ilike.*${searchFor}*,subtitle.ilike.*${searchFor}*))`
    }
    // order, by default on updated_at descending
    // use also id to prevent repeating records
    // see https://stackoverflow.com/questions/13580826/postgresql-repeating-rows-from-limit-offset
    url +='&order=updated_at.desc,title,id'
    // pagination
    url += paginationUrlParams({rows, page})

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token),
        // request record count to be returned
        // note: it's returned in the header
        'Prefer': 'count=exact'
      }
    })

    if ([200,206].includes(resp.status)){
      const json: RawProject[] = await resp.json()
      const data = prepareData(json)
      return {
        count: extractCountFromHeader(resp.headers),
        data
      }
    } else{
      logger(`getProjectList failed: ${resp.status} ${resp.statusText}`, 'warn')
      return {
        count:0,
        data:[]
      }
    }
  }catch(e:any){
    logger(`getProjectList: ${e?.message}`,'error')
    return {
      count:0,
      data:[]
    }
  }
}

export function prepareData(json:RawProject[]) {
  const data:Project[] = json.map(item => {
    const project = getPropsFromObject(item, [
      'id', 'slug',
      'title',
      'subtitle',
      'date_start',
      'date_end',
      'updated_at',
      'is_published'
    ])
    project['image_id'] = extractImageInfo(item)
    return project
  })
  return data
}

function extractImageInfo(item: RawProject) {
  if (item.image_for_project && item.image_for_project.length > 0) {
    return item.image_for_project[0].project
  } else {
    return null
  }
}

// TODO! update url to new db and setup variable endpoint based on environment
export async function getProjectItem(slug:string){
  try{
    // get project by slug
    const url = `${process.env.POSTGREST_URL}/project?select=*,image_for_project(project)&slug=eq.${slug}`
    const resp = await fetch(url, {
      method: 'GET'
    })
    if (resp.status===200){
      const rawData: RawProject[] = await resp.json()
      if (rawData && rawData.length === 1) {
        const data: Project = {
          ...rawData[0],
          image_id: extractImageInfo(rawData[0])
        }
        // delete data.image_for_project
        return data
      }
      return undefined
    }
  }catch(e:any){
    // console.log("getProject...failed:", e)
    logger(`getProjectItem: ${e?.message}`,'error')
    // return []
    return undefined
  }
}

export function getImageUrl(image_id:string|null) {
  if (image_id) return `/image/rpc/get_project_image?id=${image_id}`
  return null
}


export async function getOrganisationsOfProject({project, token, frontend = true}:
  { project: string, token: string, frontend?: boolean }) {
  // SSR request within docker network
  let url = `${process.env.POSTGREST_URL}/rpc/organisations_of_project?project=eq.${project}&order=name.asc`
  if (frontend) {
    url = `/api/v1/rpc/organisations_of_project?project=eq.${project}&order=name.asc`
  }
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token)
      },
    })
    if (resp.status === 200) {
      const json: OrganisationsOfProject[] = await resp.json()
      return json
    }
    return []
  } catch (e: any) {
    logger(`getOrganisationsOfProject: ${e?.message}`, 'error')
    return []
  }
}

export async function getParticipatingOrganisations({project, token, frontend = true}:
  {project: string, token: string, frontend?: boolean }) {
  const resp = await getOrganisationsOfProject({project, token, frontend})
  // filter only approved organisations
  // extract only properties used
  const organisations = resp.filter(item => {
    return item.status === 'approved'
  })
    .map(item => {
      return {
        slug: item.slug,
        name: item.name,
        website: item.website ?? '',
        logo_url: getUrlFromLogoId(item.logo_id)
      }
    })
  return organisations
}

export function getProjectStatus({date_start, date_end}:
  {date_start: string, date_end: string}) {
  try {
    const start_date = new Date(date_start)
    const end_date = new Date(date_end)
    const today = new Date()

    let status:'Starting'|'Running'|'Finished' = 'Running'

    if (today < start_date) status = 'Starting'
    if (today > end_date) status = 'Finished'

    return status
  } catch (e:any) {
    logger(`getProjectStatus: ${e?.message}`, 'error')
    // error value return starting
    return 'Starting'
  }
}


export async function getTagsForProject({project, token, frontend=false}:
  {project: string, token: string, frontend?: boolean }
) {
  try {
    // this request is always perfomed from backend
    // the content is order by tag ascending
    let url = `${process.env.POSTGREST_URL}/tag_for_project?project=eq.${project}&order=tag.asc`
    if (frontend === true) {
      url = `/api/v1/tag_for_project?project=eq.${project}&order=tag.asc`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: ProjectTag[] = await resp.json()
      return data.map(item=>item.tag)
    }
    logger(`getTopicForProject: [${resp.status}] ${resp.statusText}`, 'warn')
    return []
  } catch (e: any) {
    logger(`getTagsForProject: ${e?.message}`, 'error')
    return []
  }
}


export async function getTopicsForProject({project, token, frontend = false}:
  { project: string, token: string, frontend?: boolean }
) {
  try {
    // this request is always perfomed from backend
    // the content is order by tag ascending
    let url = `${process.env.POSTGREST_URL}/topic_for_project?project=eq.${project}&order=topic.asc`
    if (frontend === true) {
      url = `/api/v1/topic_for_project?project=eq.${project}&order=topic.asc`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: ProjectTopic[] = await resp.json()
      return data.map(item => item.topic)
    }
    logger(`getTopicsForProject: [${resp.status}] ${resp.statusText}`, 'warn')
    return []
  } catch (e: any) {
    logger(`getTopicsForProject: ${e?.message}`, 'error')
    return []
  }
}


export async function getLinksForProject({project, token, frontend = false}:
  { project: string, token: string, frontend?: boolean }) {
  try {
    // this request is always perfomed from backend
    // the content is order by tag ascending
    let query = `url_for_project?project=eq.${project}&order=position.asc`
    let url = `${process.env.POSTGREST_URL}/${query}`
    if (frontend === true) {
      url = `/api/v1/${query}`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: ProjectLink[] = await resp.json()
      return data
    }
    logger(`getLinksForProject: [${resp.status}] ${resp.statusText}`, 'warn')
    return []
  } catch (e: any) {
    logger(`getLinksForProject: ${e?.message}`, 'error')
    return []
  }
}

export async function getOutputForProject({project, token, frontend}:
  {project: string, token?: string, frontend?: boolean}) {
  try {
    // the content is order by type ascending
    const cols = 'id,date,is_featured,title,type,url,image,author'
    let url = `${process.env.POSTGREST_URL}/mention?select=${cols},output_for_project!inner(project)&output_for_project.project=eq.${project}&order=type.asc`

    if (frontend) {
      url = `/api/v1/mention?select=${cols},output_for_project!inner(project)&output_for_project.project=eq.${project}&order=type.asc`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: MentionForProject[] = await resp.json()
      return data
    } else if (resp.status === 404) {
      logger(`getOutputForProject: 404 [${url}]`, 'error')
      // query not found
      return undefined
    }
  } catch (e: any) {
    logger(`getOutputForProject: ${e?.message}`, 'error')
    return undefined
  }
}

export async function getImpactForProject({project, token, frontend}:
  { project: string, token?: string, frontend?: boolean }) {
  try {
    // the content is order by type ascending
    const cols = 'id,date,is_featured,title,type,url,image,author'
    let url = `${process.env.POSTGREST_URL}/mention?select=${cols},impact_for_project!inner(project)&impact_for_project.project=eq.${project}&order=type.asc`

    if (frontend) {
      url = `/api/v1/mention?select=${cols},impact_for_project!inner(project)&impact_for_project.project=eq.${project}&order=type.asc`
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: MentionForProject[] = await resp.json()
      return data
    } else if (resp.status === 404) {
      logger(`getImpactForProject: 404 [${url}]`, 'error')
      // query not found
      return undefined
    }
  } catch (e: any) {
    logger(`getImpactForProject: ${e?.message}`, 'error')
    return undefined
  }
}

export function getAvatarUrl({id, avatar_mime_type}: { id?: string | null, avatar_mime_type?: string | null }) {
  if (avatar_mime_type) {
    // construct image path
    // currently we use posgrest + nginx approach image/rpc/get_contributor_image?id=15c8d47f-f8f0-45ff-861c-1e57640ebd56
    return `/image/rpc/get_team_member_image?id=${id}`
  }
  return null
}

export async function getTeamForProject({project, token, frontend}:
  {project: string, token?: string, frontend?: boolean}) {
  try {
    // use standardized list of columns - after team_member table is updated (as with contributors)
    const columns = TeamMemberProps.join(',')

    let url = `${process.env.POSTGREST_URL}/team_member?select=${columns}&project=eq.${project}&order=given_names.asc`
    if (frontend) {
      url = `/api/v1/team_member?select=${columns}&project=eq.${project}&order=given_names.asc`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...createJsonHeaders(token),
      }
    })

    if (resp.status === 200) {
      const data: Contributor[] = await resp.json()
      return data.map(item => ({
        ...item,
        // add avatar url based on uuid
        avatar_url: getAvatarUrl(item)
      })).sort((a, b) => sortOnStrProp(a, b, 'given_names'))
    }
    logger(`getTeamForProject: ${resp.status} ${resp.statusText} [${url}]`, 'warn')
    // / query not found
    return []
  } catch (e: any) {
    logger(`getTeamForProject: ${e?.message}`, 'error')
    return []
  }
}

export async function getRelatedProjects({project, token, frontend}:
  { project: string, token?: string, frontend?: boolean }) {
  try {
    // construct api url based on request source
    let query = `rpc/related_projects_for_project?origin=eq.${project}&order=title.asc`
    let url = `${process.env.POSTGREST_URL}/${query}`
    if (frontend) {
      url = `/api/v1/${query}`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: RelatedProject[] = await resp.json()
      return data
    }
    logger(`getRelatedProjects: ${resp.status} ${resp.statusText} [${url}]`, 'warn')
    // query not found
    return []
  } catch (e: any) {
    logger(`getRelatedProjects: ${e?.message}`, 'error')
    return []
  }
}


export async function getRelatedToolsForProject({project, token, frontend}:
  {project: string, token?: string, frontend?: boolean}) {
  try {
    // construct api url based on request source
    const select = 'project,status,software(id,slug,brand_name,short_statement,updated_at)'
    let query = `software_for_project?select=${select}&status=eq.approved&project=eq.${project}`
    let url = `${process.env.POSTGREST_URL}/${query}`
    if (frontend) {
      url = `/api/v1/${query}`
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: createJsonHeaders(token)
    })
    if (resp.status === 200) {
      const data: RelatedTools[] = await resp.json()
      return data
    }
    logger(`getRelatedToolsForProject: ${resp.status} ${resp.statusText} [${url}]`, 'warn')
    // query not found
    return []
  } catch (e: any) {
    logger(`getRelatedToolsForProject: ${e?.message}`, 'error')
    return []
  }
}
