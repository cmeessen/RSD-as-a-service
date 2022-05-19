/**
 * Return a list of valid OpenID providers
 * based on provided env. RSD_AUTH_PROVIDERS string, semicolon separated values
 * Example! RSD_AUTH_PROVIDERS=surfconext;helmholtzaai
 */

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'

// import providers methods
import {surfconextInfo} from './surfconext'
import {helmholtzInfo} from './helmholtzaai'
import {localInfo} from './local'
import logger from '~/utils/logger'

export type ApiError = {
  status: number,
  message: string
}

export type Provider = {
  name: string,
  redirectUrl:string
}

type Data = Provider[] | ApiError

async function getRedirectInfo(provider: string) {
  // select provider
  switch (provider.toLocaleLowerCase()) {
    case 'surfconext':
      // get props needed
      return surfconextInfo()
    case 'helmholtzaai':
      return helmholtzInfo()
    case 'local':
      return localInfo()
    default:
      const message = `${provider} NOT SUPPORTED, check your spelling`
      logger(`api/fe/auth/providers: ${message}`, 'error')
      throw new Error(message)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // extract list of providers, default value surfconext
    const strProviders = process.env.RSD_AUTH_PROVIDERS || 'surfconext'
    // split providers to array on ;
    const providers = strProviders.split(';')

    // add all requests
    const promises: Promise<Provider|null>[] = []
    providers.forEach(provider => {
      promises.push(
        getRedirectInfo(provider)
      )
    })
    // return providers with redirectUrl
    const resp = await Promise.all(promises)
    // filter null responses (if any)
    const info = resp.filter(item => item !== null)
    // return only 'valid' providers
    res.status(200).json(info as Provider[])
  } catch (e: any) {
    logger(`api/fe/auth/index: ${e?.message}`, 'error')
    res.status(500).json({
      status: 500,
      message: e?.message
    })
  }
}
