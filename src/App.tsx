import './App.css'
import { GameCanvas } from './components/game/GameCanvas'

function App() {
  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <p className="app-shell__eyebrow">Felipe Kummer Portfolio RPG</p>
        <h1 className="app-shell__title">Phaser Foundation Online</h1>
        <p className="app-shell__copy">
          Boot, intro, character select, and world scenes are wired. The next
          step is replacing placeholders with the actual game flow.
        </p>
      </header>

      <section className="app-shell__stage" aria-label="Game stage">
        <GameCanvas />
      </section>
    </main>
  )
}

export default App
