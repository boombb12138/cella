import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { signUpJsonSchema } from 'backend/schemas/user';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { signUp } from '~/api/api';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useApiWrapper } from '~/hooks/useApiWrapper';

const formSchema = signUpJsonSchema;

export const SignUpForm = ({ email, setStep }: { email: string; setStep: (step: string) => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [apiWrapper, pending] = useApiWrapper();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    apiWrapper(
      () => signUp(values.email, values.password),
      () => {
        navigate({
          to: '/auth/verify-email',
        });
      },
    );
  };

  return (
    <Form {...form}>
      <h1 className="text-2xl text-center">
        Create account? <br />
        <Button variant="ghost" onClick={() => setStep('check')} className="font-light mt-2 text-xl">
          {email}
          <ChevronDown size={16} className="ml-2" />
        </Button>
      </h1>

      <p className="font-light text-sm">By signing up you agree to the terms & privacy policy.</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} type="email" disabled={true} readOnly={true} placeholder={t('label.email', { defaultValue: 'Email' })} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  autoFocus
                  placeholder={t('label.new_password', { defaultValue: 'New Password' })}
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={pending} className="w-full">
          {t('action.sign_up', {
            defaultValue: 'Sign up',
          })}
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </form>
    </Form>
  );
};
