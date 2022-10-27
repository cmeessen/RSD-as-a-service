import Chip from '@mui/material/Chip'
import SearchIcon from '@mui/icons-material/Search'
import Link from 'next/link'

export default function TagChipFilter({url,label, title}:
  { label: string, url:string ,title?: string }) {

  if (!label) return null

  return (
    <Link
      href={url}
      passHref
    >
    <Chip
      title={`Click to filter for ${title ? title.toLowerCase() : label.toLowerCase()}`}
      label={label}
      icon={<SearchIcon />}
      clickable
      sx={{
        marginBottom: '1rem',
        marginRight: '0.5rem',
        maxWidth: '21rem',
        borderRadius: '0.125rem',
        textTransform: 'capitalize',
        '& .MuiChip-icon': {
          order: 1,
          margin:'0rem 0.5rem 0rem 0rem',
          height: '1.125rem',
          width: '1.125rem'
        }
      }}
    />
    </Link>
  )
}
