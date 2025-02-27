import { useParams, useSearch } from '@tanstack/react-router';
import { config } from 'config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { githubSignInUrl, googleSignInUrl, microsoftSignInUrl } from '~/api/auth';
import { acceptInvite } from '~/api/general';
import { Button } from '~/modules/ui/button';
import { SignInRoute } from '~/routes/authentication';
import { useThemeStore } from '~/store/theme';
import type { Step } from '.';
export type OauthProviderOptions = (typeof config.oauthProviderOptions)[number];

type OauthProvider = {
  id: OauthProviderOptions;
  name: string;
  url: string;
};

export const oauthProviders: OauthProvider[] = [
  { id: 'github', name: 'Github', url: githubSignInUrl },
  { id: 'google', name: 'Google', url: googleSignInUrl },
  { id: 'microsoft', name: 'Microsoft', url: microsoftSignInUrl },
];

interface OauthOptionsProps {
  actionType: Step;
}

const OauthOptions = ({ actionType = 'signIn' }: OauthOptionsProps) => {
  const { t } = useTranslation();
  const { mode } = useThemeStore();
  const { token }: { token: string } = useParams({ strict: false });

  const [loading, setLoading] = useState(false);
  const invertClass = mode === 'dark' ? 'invert' : '';
  let redirect = '';
  if (token) {
    const searchResult = useSearch({
      from: SignInRoute.id,
    });
    redirect = searchResult.redirect ?? '';
  }

  const redirectQuery = redirect ? `?redirect=${redirect}` : '';

  return (
    <>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="text-muted-foreground px-2">{t('common:or')}</span>
      </div>

      <div className="flex flex-col space-y-2">
        {config.enabledOauthProviders.map((id) => {
          const option = oauthProviders.find((provider) => provider.id === id);
          if (!option) return;

          return (
            <Button
              loading={loading}
              key={option.name}
              type="button"
              variant="outline"
              onClick={() => {
                setLoading(true);
                if (token) {
                  acceptInvite({ token, oauth: option.id }).then(() => {
                    window.location.href = config.defaultRedirectPath;
                  });
                } else {
                  window.location.href = option.url + redirectQuery;
                }
              }}
            >
              <img
                src={`/static/images/${option.name.toLowerCase()}-icon.svg`}
                alt={option.name}
                className={`w-4 h-4 mr-2 ${option.id === 'github' ? invertClass : ''}`}
                loading="lazy"
              />
              {token ? t('common:accept') : actionType === 'signUp' ? t('common:sign_up') : t('common:sign_in')} with {option.name}
            </Button>
          );
        })}
      </div>
    </>
  );
};

export default OauthOptions;
