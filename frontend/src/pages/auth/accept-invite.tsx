import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { acceptInvitationToOrganizationJsonSchema } from 'backend/schemas/organizations';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Button } from '~/components/ui/button';
import AuthPage from '.';
import OauthOptions from './oauth-options';

import { ArrowRight } from 'lucide-react';
import { acceptOrganizationInvite } from '~/api/api';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useApiWrapper } from '~/hooks/useApiWrapper';

const formSchema = acceptInvitationToOrganizationJsonSchema;

const Accept = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams({ strict: false });

  const [apiWrapper, pending] = useApiWrapper();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    apiWrapper(
      () =>
        acceptOrganizationInvite({
          token,
          password: values.password,
        }),
      (url) => {
        navigate({
          to: url,
        });
      },
    );
  };

  return (
    <AuthPage>
      <Form {...form}>
        <h1 className="text-2xl text-center">
          Accept invitation <br /> <span className="font-light text-xl">for {'"email here"'}</span>
        </h1>
        <p className="font-light text-sm">Set a password to complete your account. By accepting you agree to the terms & privacy policy.</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    autoFocus
                    placeholder={t('label.new_password', { defaultValue: 'New password' })}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" loading={pending} className="w-full">
            {t('action.accept', {
              defaultValue: 'Accept',
            })}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>
      </Form>
      <OauthOptions isAccepting={true} />
    </AuthPage>
  );
};

export default Accept;
