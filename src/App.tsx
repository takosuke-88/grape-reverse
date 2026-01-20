import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Breadcrumbs from './components/Breadcrumbs'
import HomePage from './pages/HomePage'
import AllMachinesPage from './pages/AllMachinesPage'
import AimEX6Page from './pages/AimEX6Page'
import MyJuggler5Page from './pages/MyJuggler5Page'
import FunkyJuggler2Page from './pages/FunkyJuggler2Page'
import GogoJuggler3Page from './pages/GogoJuggler3Page'
import JugglerGirlsSSPage from './pages/JugglerGirlsSSPage'
import UltraMiracleJugglerPage from './pages/UltraMiracleJugglerPage'
import MisterJugglerPage from './pages/MisterJugglerPage'
import HappyJugglerV3Page from './pages/HappyJugglerV3Page'
import MyJugglerColumn from './pages/columns/myjuggler5-setting6-behavior'

export default function App() {
  return (
    <BrowserRouter>
      {/* 全ページ共通のヘッダー */}
      <Header />
      
      {/* パンくずリスト */}
      <Breadcrumbs />
      
      <Routes>
        {/* トップページ（機種一覧） */}
        <Route path="/" element={<HomePage />} />

        {/* すべての機種を一覧で使用（従来版） */}
        <Route path="/all" element={<AllMachinesPage />} />

        {/* 機種別ページ（SEO対応） */}
        <Route path="/aimex" element={<AimEX6Page />} />
        <Route path="/myjuggler5" element={<MyJuggler5Page />} />
        <Route path="/funky2" element={<FunkyJuggler2Page />} />
        <Route path="/gogo3" element={<GogoJuggler3Page />} />
        <Route path="/girlsss" element={<JugglerGirlsSSPage />} />
        <Route path="/ultramiracle" element={<UltraMiracleJugglerPage />} />
        <Route path="/mister" element={<MisterJugglerPage />} />
        <Route path="/happyv3" element={<HappyJugglerV3Page />} />
        
        {/* コラム記事 */}
        <Route path="/columns/myjuggler5-setting6-behavior" element={<MyJugglerColumn />} />

        {/* 404 - トップページにリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
