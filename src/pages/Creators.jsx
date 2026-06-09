import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import { CREATORS, getModelsByCreator } from '../data/models.js'

export default function Creators() {
  const creators = Object.values(CREATORS)

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Featured Creators</h1>
        <p className="text-body-md text-on-surface-variant">The elite studios and researchers building the future of intelligence.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((c) => {
          const models = getModelsByCreator(c.id)
          return (
            <Link
              key={c.id}
              to={`/creator/${c.id}`}
              className="group glass-panel rounded-2xl overflow-hidden hover:border-primary-container/30 electric-glow-hover transition-all"
            >
              <div className="relative h-32">
                <ModelArtwork seed={`${c.id}-banner`} colors={c.art} className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
              </div>
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="flex items-end justify-between mb-4">
                  <span className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-surface-container ring-1 ring-white/10">
                    <ModelArtwork seed={c.id} colors={c.art} className="w-full h-full" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-secondary text-body-sm mb-1">
                    <Icon name="star" size={16} fill /> {c.stats.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-display text-title-md text-on-surface group-hover:text-primary-container transition-colors">{c.name}</h3>
                  {c.verified && <Icon name="verified" size={18} className="text-primary-container" fill />}
                </div>
                <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">{c.title}</p>
                <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-5">{c.bio}</p>
                <div className="flex items-center gap-5 text-body-sm text-on-surface-variant pt-4 border-t hairline">
                  <span className="flex items-center gap-1.5"><Icon name="group" size={16} /> {c.stats.followers}</span>
                  <span className="flex items-center gap-1.5"><Icon name="inventory_2" size={16} /> {models.length} models</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
