import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import ModelArtwork from './ModelArtwork.jsx'
import StarRating from './StarRating.jsx'
import { TierBadge } from './Badge.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getCreator } from '../data/models.js'
import { toIDR, formatIDR } from '../data/payment.js'

export default function QuickViewModal({ model, onClose }) {
  const { addToCart, isWishlisted, toggleWishlist } = useApp()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!model) return null
  const creator = getCreator(model.creatorId)
  const saved = isWishlisted(model.id)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in-fast" onClick={onClose} />
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Close"
        >
          <Icon name="close" size={20} />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative h-64 md:h-full min-h-[280px]">
            <ModelArtwork seed={model.id} colors={model.art} icon={model.icon} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-container/90 via-transparent to-transparent" />
          </div>

          <div className="p-7 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <TierBadge tier={model.tier} />
              <span className="text-[11px] font-mono text-outline uppercase tracking-wide">{model.category}</span>
            </div>
            <h2 className="font-display text-headline-md text-on-surface mb-2">{model.name}</h2>
            <Link to={`/creator/${creator.id}`} className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-primary-container transition-colors mb-3 w-fit">
              <span className="w-5 h-5 rounded-full overflow-hidden">
                <ModelArtwork seed={creator.id} colors={creator.art} className="w-full h-full" />
              </span>
              {creator.name}
              {creator.verified && <Icon name="verified" size={14} className="text-primary-container" fill />}
            </Link>
            <StarRating value={model.rating} count={model.reviews} showValue className="mb-4" />
            <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-4 mb-5">{model.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {model.useCaseTags.slice(0, 4).map((t) => (
                <span key={t} className="chip text-[11px] py-1">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 pt-5 border-t hairline">
              <div>
                <p className="text-[12px] text-on-surface-variant">Harga</p>
                <p className="font-display text-title-md text-on-surface">
                  {model.price === 0 ? <span className="text-success">Gratis</span> : formatIDR(toIDR(model.price))}
                  {model.price !== 0 && <span className="text-body-sm text-on-surface-variant font-normal">/bln</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(model.id, model.name)}
                  className={`btn-soft p-3 ${saved ? 'text-primary-container border-primary-container/40' : ''}`}
                  aria-label="Save"
                >
                  <Icon name={saved ? 'bookmark' : 'bookmark_border'} size={20} fill={saved} />
                </button>
                <button type="button" onClick={() => addToCart(model.id, 1, model.name)} className="btn-primary px-5 py-3">
                  <Icon name="add_shopping_cart" size={18} /> Tambah ke Keranjang
                </button>
              </div>
            </div>
            <Link to={`/model/${model.id}`} className="text-center mt-4 text-label-md font-label text-primary-container hover:text-primary transition-colors">
              Lihat detail lengkap →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
