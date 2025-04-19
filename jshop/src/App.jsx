import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Slider from "./component/Slider";
import Footer from "./component/Footer";
import Category from "./component/Category";
import Product from "./component/Product";
import Aboutus from "./component/Aboutus";
import Contactus from "./component/Contactus";
import Login from "./component/Login";
import Registor from "./component/Registor";
import ForgotPassword from "./component/ForgotPassword";
import OTPVerification from "./component/OTPVerification";
import ResetPassword from "./component/ResetPassword";
import Account from "./component/Account";
import Cart from "./component/Cart";
import Checkout from "./component/Checkout";
import Wishlist from "./component/Wishlist";
import Ct_product from "./component/Ct_product";
import OrderHistory from "./component/OrderHistory";
import SinglePro from "./component/SinglePro";
import Rating_Review from "./component/Rating_Review";
import OfferBanner from "./component/OfferBanner";
import AdCategory from "./component/Admin/AdCategory";
import AdPro from "./component/Admin/AdPro";
import AdUser from "./component/Admin/AdUser";
import AdOrder from "./component/Admin/AdOrder";
import AdOffers from "./component/Admin/AdOffers";
import AdContact from "./component/Admin/AdContact";
import AdAbout from "./component/Admin/AdAbout";
import AdReviews from "./component/Admin/AdReviews";
import AdBanner from "./component/Admin/AdBanner";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* User Panel */}
        <Route
          path="/"
          element={
            <>
              <Slider />
              <Category />
              <Product />
              <OfferBanner/>
            </>
          }
        />
        <Route path="/Navbar" element={<Navbar />} />
        <Route path="/aboutus" element={<Aboutus />} />
        <Route path="/contactus" element={<Contactus />} />
        <Route path="/Product" element={<Product />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registor" element={<Registor />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Checkout" element={<Checkout />} />
        <Route path="/Wishlist" element={<Wishlist />} />
        <Route path="/OrderHistory" element={<OrderHistory />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/OTPVerification" element={<OTPVerification />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/Rating_Review" element={<Rating_Review />} />
        <Route path="/Ct_product" element={<Ct_product />} />
        <Route path="/OfferBanner" element={<OfferBanner />} />
        <Route path="/SinglePro/:productId" element={<SinglePro />} />
        <Route path="/Admin/AdCategory" element={<AdCategory />} />
        <Route path="/Admin/AdPro" element={<AdPro />} />
        <Route path="/Admin/AdUser" element={<AdUser />} />
        <Route path="/Admin/AdOrder" element={<AdOrder />} />
        <Route path="/Admin/AdOffers" element={<AdOffers />} />
        <Route path="/Admin/AdContact" element={<AdContact />} />
        <Route path="/Admin/AdAbout" element={<AdAbout />} />
        <Route path="/Admin/AdReviews" element={<AdReviews />} />
        <Route path="/Admin/AdBanner" element={<AdBanner />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
