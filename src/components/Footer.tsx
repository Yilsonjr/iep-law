import { Link } from 'react-router-dom';
import { Church, MapPin, Phone, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center">
                <Church className="w-8 h-8 text-primary" />
              </div>
              <div>
                <span className="font-serif text-3xl text-white font-semibold">Ebenezer</span>
                <span className="block text-lg text-gold font-medium tracking-wider">M.I.</span>
              </div>
            </div>
            <p className="text-stone-300 leading-relaxed max-w-md">
             Hasta aquí nos has ayudado el Señor. Una iglesia comprometida con la Palabra de Dios 
              y la edificación de Sus hijos en fe, amor y servicio.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-stone-300">
                <MapPin size={18} className="text-gold" />
                <span>123 Calle Fe, Ciudad Esperanza</span>
              </li>
              <li className="flex items-center gap-3 text-stone-300">
                <Phone size={18} className="text-gold" />
                <span>+1 555-0123</span>
              </li>
              <li className="flex items-center gap-3 text-stone-300">
                <Mail size={18} className="text-gold" />
                <span>contacto@ebenezer-mi.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-gold">Enlaces</h4>
            <ul className="space-y-3">
              {['Inicio', 'Sermones', 'Eventos', 'En Vivo', 'Dashboard'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase() === 'inicio' ? '' : item.toLowerCase()}`}
                    className="text-stone-300 hover:text-gold transition-colors duration-200"
                  >
                    {item}
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
            © 2026 Iglesia Ebenezer M.I. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}