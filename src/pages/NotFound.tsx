import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link to="/">Back to Home</Link>
    </div>
  )
}
