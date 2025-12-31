import { RouterProvider, router } from './router'
import { Toaster } from '@/components/ui/sonner'
import './App.css'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App
