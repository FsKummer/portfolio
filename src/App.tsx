import './App.css'
import { GameCanvas } from './components/game/GameCanvas'

function App() {
  return (
    <main className="app-shell">
      <section className="app-shell__stage" aria-label="Game stage">
        <GameCanvas />
      </section>
    </main>
  )
}

export default App
