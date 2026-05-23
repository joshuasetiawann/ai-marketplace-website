import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelCard from '../components/ModelCard.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import { EmptyState } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Wishlist() {
  const { wishlistDetailed, addToCart } = useApp()
  const [quickView, setQuickView] = useState(null)

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">Wishlist Saya</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{wishlistDetailed.length} model disimpan.</p>
        </div>
        {wishlistDetailed.length > 0 && (
          <button
            onClick={() => wishlistDetailed.forEach((m) => addToCart(m.id, 1, m.name))}
            className="btn-ghost px-5 py-2.5"
          >
            <Icon name="shopping_cart_checkout" size={18} /> Tambah semua
          </button>
        )}
      </div>

      {wishlistDetailed.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {wishlistDetailed.map((m) => (
            <ModelCard key={m.id} model={m} onQuickView={setQuickView} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="favorite"
          title="Belum ada model disimpan"
          message="Ketuk ikon bookmark di model mana pun untuk menyimpannya di sini."
          action={
            <Link to="/explore" className="btn-primary px-6 py-3">
              <Icon name="explore" size={18} /> Jelajahi Model
            </Link>
          }
        />
      )}

      {quickView && <QuickViewModal model={quickView} onClose={() => setQuickView(null)} />}
    </div>
  )
}
