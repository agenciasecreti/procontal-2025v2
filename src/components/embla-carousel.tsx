import { NextButton, PrevButton, usePrevNextButtons } from '@/components/embla-carousel-arrows';
import { DotButton, useDotButton } from '@/components/embla-carousel-button';
import { trackClickWhatsapp } from '@/lib/tracking';
import { cn } from '@/lib/utils';
import { BannerPrincipalType } from '@/types/models';
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback } from 'react';
import { ImageOpt } from './image-optimize';

const EmblaCarousel = ({
  slides,
  options,
}: {
  slides: BannerPrincipalType[];
  options?: EmblaOptionsType;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const resetOrStop =
      autoplay.options.stopOnInteraction === false ? autoplay.reset : autoplay.stop;

    resetOrStop();
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi, onNavButtonClick);

  console.log('slides:', slides);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi, onNavButtonClick);

  return (
    <>
      {slides.length > 0 && (
        <section
          className="bg-card margin-auto w-full"
          style={{
            ['--slide-height' as string]: 'auto',
            ['--slide-size' as string]: '100%',
          }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((banner) => (
                <div
                  className="min-w-0 pl-[var(--slide-spacing)]"
                  style={{ flex: '0 0 var(--slide-size)' }}
                  key={banner.title}
                >
                  <div>
                    {banner.image && (
                      <>
                        {/* Desktop Image */}
                        <ImageOpt
                          className="hidden max-h-screen min-h-screen w-full object-cover lg:block"
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${banner.image}`}
                          alt={banner.title || 'Procontal Treinamentos'}
                          width={1920}
                          height={1080}
                          quality={85}
                          priority={true} // Para primeira imagem
                          sizes="100vw"
                          cacheKey="v1" // Versão para cache busting
                          lazy={false} // Imagem não é lazy load para garantir que carregue imediatamente
                        />

                        {/* Mobile Image */}
                        <ImageOpt
                          className="block max-h-screen min-h-screen w-full object-cover lg:hidden"
                          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${banner.image_mobile ?? banner.image}`}
                          alt={banner.title || 'Procontal Treinamentos'}
                          width={768}
                          height={1024}
                          quality={85}
                          priority={true}
                          sizes="100vw"
                          cacheKey="v1"
                          lazy={false} // Imagem não é lazy load para garantir que carregue imediatamente
                        />
                      </>
                    )}
                    <div className="absolute top-0 z-100 h-full w-full bg-gradient-to-b from-transparent to-black/100">
                      <div className="m-auto flex h-full max-w-full flex-col items-center justify-center px-5 py-20 text-center lg:max-w-7xl lg:items-start lg:justify-end lg:text-start">
                        <div className="w-full px-6 pt-45 lg:max-w-3xl lg:px-10 lg:pt-0">
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                            className="text-tertiary dark:text-secondary mb-10 text-4xl font-bold text-balance text-shadow-lg lg:mb-6 lg:text-5xl"
                          >
                            {banner.title}
                          </motion.p>
                          {banner.text && (
                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.3 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="mb-8 text-xl text-balance text-shadow-lg lg:block lg:text-2xl"
                            >
                              <span
                                dangerouslySetInnerHTML={{ __html: banner.text ? banner.text : '' }}
                              />
                            </motion.p>
                          )}
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="bg-tertiary dark:bg-secondary rounded-lg px-6 py-3 text-xl font-semibold text-balance lg:px-10"
                          >
                            <Link
                              href={banner.link ? banner.link : '#'}
                              onClick={() =>
                                trackClickWhatsapp('whatsapp-carousel', 'Contato via WhatsApp')
                              }
                            >
                              {banner.btn_text || 'Saiba Mais'}
                            </Link>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {slides.length > 1 && (
            <div className="pointer-events-none absolute top-0 flex h-full w-full items-center justify-between">
              <div className="absolute top-1/2 hidden w-full items-center justify-between px-10 lg:flex">
                <PrevButton
                  onClick={onPrevButtonClick}
                  disabled={prevBtnDisabled}
                  className="pointer-events-auto disabled:opacity-50"
                />
                <NextButton
                  onClick={onNextButtonClick}
                  disabled={nextBtnDisabled}
                  className="pointer-events-auto disabled:opacity-50"
                />
              </div>

              <div className="absolute right-0 bottom-0 flex w-full items-center justify-center gap-3 p-5 lg:justify-end lg:p-10 lg:pr-40">
                {scrollSnaps.map((_, index) => (
                  <DotButton
                    key={index}
                    onClick={() => onDotButtonClick(index)}
                    className={cn(
                      'embla__dot hover:bg-muted/80 focus:ring-primary dark:focus:ring-primary pointer-events-auto flex h-6 w-6 items-center justify-center bg-white/10 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none',
                      {
                        'bg-tertiary dark:bg-primary': index === selectedIndex,
                      }
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default EmblaCarousel;
