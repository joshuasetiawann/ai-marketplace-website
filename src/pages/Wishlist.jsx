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
          <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface">My Wishlist</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {wishlistDetailed.length} saved model{wishlistDetailed.length !== 1 ? 's' : ''}.
          </p>
        </div>
        {wishlistDetailed.length > 0 && (
          <button
            onClick={() => wishlistDetailed.forEach((m) => addToCart(m.id, 1, m.name))}
            className="btn-ghost px-5 py-2.5"
          >
            <Icon name="shopping_cart_checkout" size={18} /> Add all to cart
          </button>
        )}
      </div>

      {wishlistDetailed.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {wishlistDetailed.map((m) => (
            <ModelCard key={m.id} model={m} onQuickView={setQuickView} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="favorite"
          title="No saved models yet"
          message="Tap the bookmark icon on any model to save it here for later."
          action={
            <Link to="/explore" className="btn-primary px-6 py-3">
              <Icon name="explore" size={18} /> Discover Models
            </Link>
          }
        />
      )}

      {quickView && <QuickViewModal model={quickView} onClose={() => setQuickView(null)} />}
    </div>
  )
}
