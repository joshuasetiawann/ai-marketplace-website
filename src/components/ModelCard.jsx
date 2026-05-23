import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import ModelArtwork from './ModelArtwork.jsx'
import StarRating from './StarRating.jsx'
import { StatusBadge, TierBadge } from './Badge.jsx'
import { useApp } from '../context/AppContext.jsx'
import { toIDR, formatIDRShort } from '../data/payment.js'

export default function ModelCard({ model, onQuickView, className = '' }) {
  const { isWishlisted, toggleWishlist, addToCart } = useApp()
  const saved = isWishlisted(model.id)

  return (
    <div
      className={`glass-panel rounded-xl overflow-hidden group electric-glow-hover hover:border-primary-container/30 flex flex-col animate-fade-in ${className}`}
    >
      <Link to={`/model/${model.id}`} className="block relative h-44 overflow-hidden">
        <ModelArtwork
          seed={model.id}
          colors={model.art}
          icon={model.icon}
          className="w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest/70 pointer-events-none" />
        {model.badge && (
          <div className="absolute top-3 left-3">
            <StatusBadge type={model.badge} />
          </div>
        )}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onQuickView(model)
            }}
            className="absolute bottom-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 bg-surface-container-high/90 backdrop-blur-md border border-white/15 text-on-surface text-[12px] font-label px-3 py-1.5 rounded-full hover:border-primary-container/50"
            aria-label={`Quick view ${model.name}`}
          >
            <Icon name="visibility" size={15} /> Lihat cepat
          </button>
        )}
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/model/${model.id}`}>
              <h3 className="font-display text-[19px] leading-tight font-semibold text-on-surface group-hover:text-primary-container transition-colors truncate">
                {model.name}
              </h3>
            </Link>
          </div>
          <StarRating value={model.rating} size={14} showValue />
        </div>

        <p className="text-body-sm text-on-surface-variant line-clamp-2 flex-1">{model.tagline}</p>

        <div className="flex items-center gap-2">
          <TierBadge tier={model.tier} />
          <span className="text-[11px] font-mono text-outline uppercase tracking-wide">{model.category}</span>
        </div>

        <div className="flex items-center justify-between mt-1 pt-4 border-t hairline">
          <span className="font-label text-label-md text-on-surface">
            {model.price === 0 ? (
              <span className="text-success">Gratis</span>
            ) : (
              <>
                {formatIDRShort(toIDR(model.price))}
                <span className="text-on-surface-variant text-[12px] font-normal">/bln</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleWishlist(model.id, model.name)}
              className={`p-2 rounded-full transition-colors ${saved ? 'text-primary-container bg-primary-container/10' : 'text-on-surface-variant hover:text-primary-container hover:bg-white/5'}`}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={20} fill={saved} />
            </button>
            <button
              type="button"
              onClick={() => addToCart(model.id, 1, model.name)}
              className="p-2 rounded-full text-on-surface-variant hover:text-primary-container hover:bg-white/5 transition-colors"
              aria-label={`Add ${model.name} to cart`}
            >
              <Icon name="add_shopping_cart" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
