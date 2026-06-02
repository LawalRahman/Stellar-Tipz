import React from 'react';
import { Sparkles, Zap, Globe, Trophy, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const features = [
  {
    icon: <Zap size={40} />,
    titleKey: 'landing.features.fast.title',
    descriptionKey: 'landing.features.fast.description',
  },
  {
    icon: <Sparkles size={40} />,
    titleKey: 'landing.features.fees.title',
    descriptionKey: 'landing.features.fees.description',
  },
  {
    icon: <Globe size={40} />,
    titleKey: 'landing.features.global.title',
    descriptionKey: 'landing.features.global.description',
  },
  {
    icon: <Trophy size={40} />,
    titleKey: 'landing.features.credit.title',
    descriptionKey: 'landing.features.credit.description',
  },
  {
    icon: <Shield size={40} />,
    titleKey: 'landing.features.onchain.title',
    descriptionKey: 'landing.features.onchain.description',
  },
  {
    icon: <Sparkles size={40} />,
    titleKey: 'landing.features.urls.title',
    descriptionKey: 'landing.features.urls.description',
  },
];

const FeaturesSection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section
      id="features"
      role="region"
      aria-labelledby="features-heading"
      className="py-20 px-4 bg-off-white border-t-3 border-b-3 border-black"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          id="features-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-black text-center mb-16"
        >
          {t("landing.features.heading")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-brutalist hover:-translate-x-1 hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 uppercase">{t(feature.titleKey)}</h3>
              <p className="text-gray-700">{t(feature.descriptionKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
