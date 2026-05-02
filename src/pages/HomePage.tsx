import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Calendar, Users, Heart, ArrowRight, Cross } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function HomePage() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Cross size={48} className="mx-auto text-gold" />
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="font-serif text-5xl md:text-7xl font-bold mb-6"
          >
            Iglesia Ebenezer M.I.
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-stone-300 mb-10 max-w-2xl mx-auto"
          >
            Hasta aquí nos has ayudado el Señor. Una comunidad de fe dedicada a la 
            transformación de vidas a través del poder del evangelio.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/live" className="btn-primary flex items-center justify-center gap-2">
              <Play size={20} />
              Ver en Vivo
            </Link>
            <Link to="/sermons" className="btn-secondary flex items-center justify-center gap-2">
              Sermones
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Nuestra Misión</h2>
            <div className="gold-divider" />
            <p className="text-stone-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Hacer disciples de Cristo, formando comunidades de fe donde cada persona pueda 
              crecer espiritualmente y encontrar su propósito en Dios.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Comunidad',
                description: 'Un lugar donde cada persona es bienvenida y价值ada.'
              },
              {
                icon: Cross,
                title: 'Adoración',
                description: 'Celebramos a Dios con alegría y reverencia en cada servicio.'
              },
              {
                icon: Users,
                title: 'Discipulado',
                description: 'Crecemos juntos en la Palabra para transformar vidas.'
              }
            ].map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="card p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon size={32} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-4">{title}</h3>
                <p className="text-stone-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">Próximo Sermón</h2>
              <div className="gold-divider ml-0" />
              <h3 className="font-serif text-2xl text-stone-800 mb-4">La Fe que Trasciende</h3>
              <p className="text-stone-600 mb-6">
                Una reflexión profunda sobre cómo la fe nos ayuda a superar los momentos 
                difíciles de la vida. Pastor Roberto Mendoza nos guiará en esta inspiradora enseñanza.
              </p>
              <div className="flex items-center gap-4 text-stone-500 mb-6">
                <span>Domingo 27 de Abril</span>
                <span>•</span>
                <span>10:00 AM</span>
              </div>
              <Link to="/live" className="btn-primary inline-flex items-center gap-2">
                <Play size={18} />
                Ver en Vivo
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-primary to-primary-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play size={40} className="text-white ml-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">Horarios de Servicio</h2>
            <div className="gold-divider" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { day: 'Domingo', services: ['9:00 AM - Escuela Bíblica', '10:00 AM - Culto Principal'] },
              { day: 'Miércoles', services: ['7:00 PM - Estudio Bíblico', '8:00 PM - Oración'] },
              { day: 'Viernes', services: ['6:00 PM - Reunión de Jóvenes'] }
            ].map(({ day, services }) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card p-6 border-t-4 border-gold"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={24} className="text-gold" />
                  <h3 className="font-serif text-xl text-primary">{day}</h3>
                </div>
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li key={service} className="text-stone-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gold rounded-full" />
                      {service}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-6">¿Tienes preguntas?</h2>
            <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
              Nos encantaría saber de ti. Contáctanos para más información sobre nuestra 
              iglesia o cómo puedes involucrarte.
            </p>
            <Link to="/dashboard" className="btn-secondary">
              Contactar
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}