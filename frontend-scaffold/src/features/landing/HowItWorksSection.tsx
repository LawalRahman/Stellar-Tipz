import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, User, Link, Zap } from 'lucide-react';
import { useI18n } from '@/i18n';

interface Step {
  number: number;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Wallet className="w-6 h-6" />,
    titleKey: 'landing.how.step1.title',
    descriptionKey: 'landing.how.step1.description',
  },
  {
    number: 2,
    icon: <User className="w-6 h-6" />,
    titleKey: 'landing.how.step2.title',
    descriptionKey: 'landing.how.step2.description',
  },
  {
    number: 3,
    icon: <Link className="w-6 h-6" />,
    titleKey: 'landing.how.step3.title',
    descriptionKey: 'landing.how.step3.description',
  },
  {
    number: 4,
    icon: <Zap className="w-6 h-6" />,
    titleKey: 'landing.how.step4.title',
    descriptionKey: 'landing.how.step4.description',
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  }),
};

const HowItWorksSection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section aria-labelledby="how-it-works-heading" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          id="how-it-works-heading"
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t("landing.how.heading")}
        </motion.h2>
        <motion.p
          className="text-gray-800 dark:text-gray-200 text-center mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {t("landing.how.description")}
        </motion.p>

        {/* Desktop: horizontal layout */}
        <div className="hidden md:flex items-start justify-between gap-4">
          {steps.map((step, i) => (
            <React.Fragment key={step.number}>
              <motion.div
                className="flex flex-col items-center text-center flex-1"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stepVariants}
              >
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                    {step.number}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(step.titleKey)}</h3>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed max-w-[200px]">
                  {t(step.descriptionKey)}
                </p>
              </motion.div>

              {/* Connecting line between steps */}
              {i < steps.length - 1 && (
                <motion.div
                  className="flex-shrink-0 mt-7 w-12 h-0.5 bg-indigo-200"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.15, duration: 0.3 }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: vertical layout */}
        <div className="flex flex-col gap-8 md:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex items-start gap-4"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepVariants}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base font-bold">
                  {step.number}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  {step.icon}
                </div>
                {/* Vertical connecting line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-indigo-200" />
                )}
              </div>
              <div className="pt-1">
                <h3 className="font-semibold text-base mb-1">{t(step.titleKey)}</h3>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                  {t(step.descriptionKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
