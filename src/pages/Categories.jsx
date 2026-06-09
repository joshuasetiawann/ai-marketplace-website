import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { SectionHeading } from '../components/common.jsx'
import { CATEGORIES, USE_CASES, MODELS } from '../data/models.js'

export default function Categories() {
  const countFor = (id) => MODELS.filter((m) => m.category === id).length

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-display text-headline-md md:text-headline-lg text-on-surface mb-2">Browse Categories</h1>
        <p className="text-body-md text-on-surface-variant">Find the right intelligence for every task and industry.</p>
      </div>

      {/* Category tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
          <Link
            key={c.id}
            to={`/explore?cat=${c.id}`}
            className="group glass-panel rounded-2xl p-7 hover:border-primary-container/30 electric-glow-hover transition-all relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-container/[0.07] blur-2xl rounded-full group-hover:bg-primary-container/15 transition-all" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container mb-5 group-hover:scale-110 transition-transform">
                <Icon name={c.icon} size={28} />
              </div>
              <h3 className="font-display text-title-md text-on-surface mb-1 group-hover:text-primary-container transition-colors">{c.label}</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">{countFor(c.id)} model{countFor(c.id) !== 1 ? 's' : ''} available</p>
              <span className="inline-flex items-center gap-1 text-label-md font-label text-primary-container">
                Explore <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* By use case */}
      <SectionHeading eyebrow="Tailored" title="Shop by Use Case" className="mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {USE_CASES.map((u) => (
          <Link
            key={u.id}
            to={`/explore?use=${u.id}`}
            className="surface-card rounded-xl p-6 flex flex-col items-center text-center gap-3 hover:border-primary-container/30 transition-all group"
          >
            <span className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
              <Icon name={u.icon} size={24} />
            </span>
            <span className="text-body-md font-medium text-on-surface">{u.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
