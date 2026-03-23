import { useParams } from 'react-router-dom'

export default function ProjectDetail() {
  const { id } = useParams()
  return <p>Project {id} — em breve</p>
}
