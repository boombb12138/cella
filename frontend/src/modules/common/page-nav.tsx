import { Link, type ToPathOption } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { cn, nanoid } from '~/lib/utils';
import { AvatarWrap } from '~/modules/common/avatar-wrap';

export type PageNavTab = {
  id: string;
  label: string;
  path: ToPathOption;
};

interface Props {
  title?: string;
  avatar?: {
    id: string;
    thumbnailUrl?: string | null;
    name: string;
  };
  tabs: PageNavTab[];
  className?: string;
}

export const PageNav = ({ title, avatar, tabs, className = '' }: Props) => {
  const { t } = useTranslation();
  const { ref: inViewRef, inView } = useInView({ triggerOnce: false, threshold: 0 });

  const tabsRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //remove hidden when tabs on top of page
    window.addEventListener('scroll', () => {
      if (!tabsRef.current || !nameRef.current) return;

      if (tabsRef.current.getBoundingClientRect().top === 0) {
        nameRef.current.classList.remove('hidden');
      } else {
        nameRef.current.classList.add('hidden');
      }
    });

    return () => {
      window.removeEventListener('scroll', () => {});
    };
  }, []);

  // Scroll to tabs when scrolled past header
  const updateScrollPosition = () => {
    const tabsWrapper = document.getElementById('tabs-position');
    if (inView || !tabsWrapper) return;

    window.scrollTo({
      top: tabsWrapper.offsetTop,
    });
  };

  return (
    <>
      <div id="tabs-position" ref={inViewRef} />
      <div className={cn('flex justify-center border-b sticky top-0 bg-background/75 backdrop-blur-sm z-[80]', className)} ref={tabsRef}>
        <div className="hidden" ref={nameRef}>
          <div className="absolute left-0 h-full flex items-center">
            {avatar && <AvatarWrap className="m-3 h-6 w-6 text-xs" type="organization" id={avatar.id} name={avatar.name} url={avatar.thumbnailUrl} />}
            <div className="truncate hidden leading-5 font-semibold text-sm max-w-42 sm:block">{title}</div>
          </div>
        </div>

        {tabs.map(({ id, path, label }) => (
          <Link
            key={id}
            resetScroll={false}
            className="relative p-2 lg:px-4"
            to={path}
            params={true}
            activeOptions={{ exact: true, includeSearch: false }}
            onClick={updateScrollPosition}
          >
            {({ isActive }) => (
              <>
                {t(label)}
                {isActive && (
                  <motion.div
                    key={nanoid()}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0, delay: 0.1 }}
                    className="h-1 bg-primary w-full absolute bottom-0 left-0"
                  />
                )}
              </>
            )}
          </Link>
        ))}
      </div>
    </>
  );
};
