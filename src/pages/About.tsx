import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      <h1>About TicketRush</h1>
      <p>Learn more about us here</p>
      <nav>
        <Link to="/">Back to Home</Link>
      </nav>
    </div>
  )
}
