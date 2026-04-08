import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { Link } from 'react-router-dom'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log('Login Success:', credentialResponse);
            // Send credential to backend
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
        <Link to="/about">Go to About</Link>
      </section>
    </>
  )
}

export default App
