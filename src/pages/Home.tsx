import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { IslamicAnimation } from '../components/UI/IslamicAnimation';
import { BackgroundPattern } from '../components/UI/BackgroundPattern';
import { RamadanCountdown } from '../components/UI/RamadanCountdown';
import CardTemplatesSection from '../components/Templates/CardsTemplateSection';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const handleRedirect = () => navigate('/editor');

  return (
    <div className='w-full min-h-screen relative'>
      <Navbar />
      {/* Background Pattern */}
      <BackgroundPattern />
      
      {/* Hero Section */}
      <section className='w-full py-12 md:py-20 px-4 md:px-8 lg:px-16 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
            {/* Text Column */}
            <div className={`order-2 lg:order-1 ${isRTL ? 'lg:order-2' : ''}`}>
              <div className='space-y-6'>
                {/* Badge */}
                <div className='inline-block'>
                  <span className='px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium'>
                    {t('ramadan.greeting')}
                  </span>
                </div>

                {/* Title */}
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                  <span className='bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent'>
                    {t('hero.title')}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className='text-xl md:text-2xl text-gray-300 font-medium'>
                  {t('hero.subtitle')}
                </p>

                {/* Description */}
                <p className='text-base md:text-lg text-gray-400 leading-relaxed'>
                  {t('hero.description')}
                </p>

                {/* CTA Button */}
                <div className='pt-4'>
                  <button onClick={() => handleRedirect()} className='px-8 py-4 bg-gradient-to-r from-gold to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-yellow-500 hover:to-gold'>
                    {t('hero.cta')}
                  </button>
                </div>
              </div>
            </div>

            {/* Animation Column */}
            <div className={`order-1 lg:order-2 ${isRTL ? 'lg:order-1' : ''}`}>
              <div className='w-full h-full'>
                <IslamicAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className='w-full py-16 md:py-24 px-4 md:px-8 lg:px-16 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-12 md:mb-16'>
            <div className='inline-block mb-4'>
              <span className='px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium'>
                {t('info.subtitle')}
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4'>
              <span className='bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent'>
                {t('info.title')}
              </span>
            </h2>
          </div>

          {/* Information Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
            {/* Islam Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>☪️</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.islam.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.islam.description')}
              </p>
            </div>

            {/* Ramadan Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>🌙</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.ramadan.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.ramadan.description')}
              </p>
            </div>

            {/* Fasting Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>⏰</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.fasting.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.fasting.description')}
              </p>
            </div>

            {/* Eid Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>🎉</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.eid.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.eid.description')}
              </p>
            </div>

            {/* Prayer Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>🤲</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.prayer.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.prayer.description')}
              </p>
            </div>

            {/* Charity Card */}
            <div className='group relative bg-gradient-to-br from-gray-100/50 to-gray-200/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/20 hover:-translate-y-2'>
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center`}>
                <span className='text-2xl'>💝</span>
              </div>
              <h3 className='text-xl md:text-2xl font-bold text-gold mb-4 mt-2'>
                {t('info.charity.title')}
              </h3>
              <p className='text-zinc-900 leading-relaxed'>
                {t('info.charity.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className='w-full py-16 md:py-24 px-4 md:px-8 lg:px-16 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          {/* Section Header */}
          <div className='text-center mb-12 md:mb-16'>
            <div className='inline-block mb-4'>
              <span className='px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium'>
                {t('countdown.subtitle')}
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4'>
              <span className='bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent'>
                {t('countdown.title')}
              </span>
            </h2>
          </div>

          {/* Countdown Timer */}
          <div className='flex justify-center'>
            <RamadanCountdown />
          </div>
        </div>
      </section>
      
      {/* Create Card Section */}
      <section className='w-full py-16 md:py-24 px-4 md:px-8 lg:px-16 relative z-10'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-start mb-12 md:mb-4'>
            <div className='inline-block mb-4'>
              <span className='px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-medium'>
                {t('cardTemplates.subTitle')}
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4'>
              <span className='bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent'>
                {t('cardTemplates.title')}
              </span>
            </h2>
          </div>
          <CardTemplatesSection handleRedirect={handleRedirect} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
