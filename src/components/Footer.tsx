import { Link } from 'react-router-dom';
import { Church, MapPin, Phone, Mail, Heart, ExternalLink } from 'lucide-react';
import { useSiteConfigContext } from '../contexts/SiteConfigContext';

export function Footer() {
  const { config } = useSiteConfigContext();
  const branding = config.branding;
  const footer = config.footer;

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center overflow-hidden">
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt={branding.site_name} className="w-full h-full object-cover" />
                ) : (
                  <Church className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <span className="font-serif text-3xl text-white font-semibold">{branding.site_name}</span>
                {branding.tagline && (
                  <span className="block text-lg text-gold font-medium tracking-wider">{branding.tagline}</span>
                )}
              </div>
            </div>
            <p className="text-stone-300 leading-relaxed max-w-md">
              {footer.text}
            </p>
            {(footer.social.facebook || footer.social.youtube || footer.social.instagram) && (
              <div className="flex items-center gap-4 mt-6">
                {footer.social.facebook && (
                  <a href={footer.social.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-gold/30 rounded-full flex items-center justify-center transition-colors text-white text-xs font-bold">
                    f
                  </a>
                )}
                {footer.social.youtube && (
                  <a href={footer.social.youtube} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-gold/30 rounded-full flex items-center justify-center transition-colors">
                    <ExternalLink size={16} className="text-white" />
                  </a>
                )}
                {footer.social.instagram && (
                  <a href={footer.social.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-gold/30 rounded-full flex items-center justify-center transition-colors text-white text-xs font-bold">
                    ig
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Contacto</h4>
            <ul className="space-y-4">
              {footer.contact.address && (
                <li className="flex items-start gap-3 text-stone-300">
                  <MapPin size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <span>{footer.contact.address}</span>
                </li>
              )}
              {footer.contact.phone && (
                <li className="flex items-center gap-3 text-stone-300">
                  <Phone size={18} className="text-gold flex-shrink-0" />
                  <span>{footer.contact.phone}</span>
                </li>
              )}
              {footer.contact.email && (
                <li className="flex items-center gap-3 text-stone-300">
                  <Mail size={18} className="text-gold flex-shrink-0" />
                  <span>{footer.contact.email}</span>
                </li>
              )}
              {!footer.contact.address && !footer.contact.phone && !footer.contact.email && (
                <li className="text-stone-400 text-sm italic">Sin información de contacto</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Enlaces</h4>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Prédicas', to: '/sermons' },
                { label: 'Eventos', to: '/events' },
                { label: 'En Vivo', to: '/live' },
                { label: 'Comunidad', to: '/posts' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-stone-300 hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-12 pt-8 text-center">
          <p className="text-stone-400 text-sm flex items-center justify-center gap-2">
            Hecho con <Heart size={14} className="text-gold fill-gold" /> para la Gloria de Dios
          </p>
          <p className="text-stone-500 text-xs mt-2">
            {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
