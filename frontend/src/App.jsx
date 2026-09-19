import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Products from './pages/Products'
import Checkout from './pages/Checkout'
import AdminListing from './pages/AdminListing'
import RequireAdmin from './components/RequireAdmin'
import Delivery from './pages/Delivery'
import Support from './pages/Support'
import About from './pages/About'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<Products />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/support" element={<Support />} />
      <Route path="/about" element={<About />} />
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
