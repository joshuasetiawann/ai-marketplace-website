import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import MobileNav from './components/MobileNav.jsx'
import Toaster from './components/Toaster.jsx'
import { ScrollToTop } from './components/common.jsx'

import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Categories from './pages/Categories.jsx'
import Creators from './pages/Creators.jsx'
import CreatorProfile from './pages/CreatorProfile.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Pricing from './pages/Pricing.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Wishlist from './pages/Wishlist.jsx'
import BuyerDashboard from './pages/BuyerDashboard.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import UploadProduct from './pages/UploadProduct.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import AccountSettings from './pages/AccountSettings.jsx'
import HelpCenter from './pages/HelpCenter.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-[72px] pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}

function AuthLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/creators" element={<Creators />} />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/model/:id" element={<ProductDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/upload" element={<UploadProduct />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
