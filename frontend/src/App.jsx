import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Products from './pages/Products'
import Checkout from './pages/Checkout'
import AdminListing from './pages/AdminListing'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<Products />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/admin/listing"
        element={
          <RequireAdmin>
            <AdminListing />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
