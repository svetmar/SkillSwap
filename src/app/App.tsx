import { StoreProvider } from './providers/StoreProvider'
import { AppRouter } from './providers/RouterProvider'
import { BrowserRouter } from 'react-router-dom'
import './styles/global.css'
import '../assets/styles/fonts.css'

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRouter />
      </BrowserRouter>
    </StoreProvider>
  )
}