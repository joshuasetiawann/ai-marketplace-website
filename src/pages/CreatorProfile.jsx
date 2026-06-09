import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import ModelArtwork from '../components/ModelArtwork.jsx'
import ModelCard from '../components/ModelCard.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import { useApp } from '../context/AppContext.jsx'
import { getCreator, getModelsByCreator } from '../data/models.js'

export default function CreatorProfile() {
  const { id } = useParams()
  const creator = getCreator(id)
  const { toast } = useApp()
  const [following, setFollowing] = useState(false)
  const [quickView, setQuickView] = useState(null)

  if (!creator) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <Icon name="person_off" size={48} className="text-outline mb-4" />
        <h1 className="font-display text-headline-md mb-4">Creator not found</h1>
        <Link to="/creators" className="btn-primary px-6 py-3">All Creators</Link>
      </div>
    )
  }

  const models = getModelsByCreator(creator.id)

  const toggleFollow = () => {
    setFollowing((f) => !f)
    toast(following ? `Unfollowed ${creator.name}` : `Following ${creator.name}`, { icon: following ? 'person_remove' : 'person_add' })
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-56 md:h-72">
        <ModelArtwork seed={`${creator.id}-banner`} colors={creator.art} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
      </div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Profile header */}
        <div className="-mt-20 relative flex flex-col md:flex-row md:items-end gap-6 mb-10">
          <span className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-surface ring-1 ring-white/10 shrink-0">
            <ModelArtwork seed={creator.id} colors={creator.art} className="w-full h-full" />
          </span>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-headline-md text-on-surface">{creator.name}</h1>
              {creator.verified && <Icon name="verified" size={24} className="text-primary-container" fill />}
            </div>
            <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-2">{creator.title}</p>
            <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><Icon name="location_on" size={16} /> {creator.location}</span>
              <span className="flex items-center gap-1.5"><Icon name="calendar_today" size={16} /> {creator.joined}</span>
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            <button onClick={toggleFollow} className={following ? 'btn-soft px-6 py-3' : 'btn-primary px-6 py-3'}>
              <Icon name={following ? 'check' : 'add'} size={18} /> {following ? 'Following' : 'Follow'}
            </button>
            <button onClick={() => toast('Message sent!', { icon: 'send' })} className="btn-ghost px-5 py-3"><Icon name="mail" size={18} /> Contact</button>
          </div>
        </div>

        {/* Stats + bio */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 mb-12">
          <div className="surface-card rounded-xl p-6 h-fit">
            <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
              {[
                { label: 'Followers', value: creator.stats.followers },
                { label: 'Rating', value: creator.stats.rating },
                { label: 'Models', value: models.length },
              ].map((s) => (
                <div key={s.label} className="px-2">
                  <p className="font-display text-title-md text-on-surface">{s.value}</p>
                  <p className="text-[12px] text-on-surface-variant">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card rounded-xl p-6">
            <h2 className="font-display text-body-lg font-semibold text-on-surface mb-3">About</h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">{creator.bio}</p>
          </div>
        </div>

        {/* Models */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-title-md text-on-surface">Models by {creator.name}</h2>
          <span className="text-body-sm text-on-surface-variant">{models.length} published</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter pb-8">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} onQuickView={setQuickView} />
          ))}
        </div>
      </div>

      {quickView && <QuickViewModal model={quickView} onClose={() => setQuickView(null)} />}
    </div>
  )
}
