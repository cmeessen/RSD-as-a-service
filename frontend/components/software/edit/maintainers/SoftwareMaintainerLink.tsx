import {useState} from 'react'
import Button from '@mui/material/Button'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import EmailIcon from '@mui/icons-material/Email'
import CopyIcon from '@mui/icons-material/ContentCopy'

import {copyToClipboard,canCopyToClipboard} from '~/utils/copyToClipboard'
import useSnackbar from '~/components/snackbar/useSnackbar'
import {softwareMaintainerLink} from './useSoftwareMaintainer'

export default function SoftwareMaintainerLink({software,account,token}: { software: string,account:string,token: string }) {
  const {showErrorMessage,showInfoMessage} = useSnackbar()
  const [magicLink, setMagicLink] = useState(null)
  const canCopy = useState(canCopyToClipboard())

  async function createInviteLink() {
    const resp = await softwareMaintainerLink({
      software,
      account,
      token
    })
    if (resp.status === 201) {
      setMagicLink(resp.message)
    } else {
      showErrorMessage(`Failed to generate maintainer link. ${resp.message}`)
    }
  }

  async function toClipboard() {
    if (magicLink) {
      // copy doi to clipboard
      const copied = await copyToClipboard(magicLink)
      // notify user about copy action
      if (copied) {
        showInfoMessage('Copied to clipboard')
      } else {
        showErrorMessage(`Failed to copy link ${magicLink}`)
      }
    }
  }

  function renderLinkOptions() {
    if (magicLink) {
      return (
        <div>
          <p>{magicLink}</p>
          <div className="py-4 flex justify-between">
            <Button
              disabled={!canCopy}
              startIcon={<CopyIcon />}
              onClick={toClipboard}
              sx={{
                marginRight:'1rem'
              }}
            >
              Copy to clipboard
            </Button>

            <Button
              startIcon={<EmailIcon />}
              onClick={createInviteLink}
            >
            <a
              target="_blank"
              href={`mailto:?subject=Software maintainer invite&body=Please use the link to become software maintainer. \n ${magicLink}`} rel="noreferrer">
              Create invite
            </a>
            </Button>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
    <Button
      sx={{
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center'
      }}
      startIcon={<AutoFixHighIcon />}
      onClick={createInviteLink}
    >
      Generate invite link
    </Button>
    <div className="py-2"></div>
    {renderLinkOptions()}
    </>
  )
}
