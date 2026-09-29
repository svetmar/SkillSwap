import { StoreProvider } from './providers/StoreProvider'
import { AppRouter } from './providers/RouterProvider'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import '../assets/styles/fonts.css'

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename="/SkillSwap">
        <AppRouter />
      </BrowserRouter>
    </StoreProvider>
  )
}
