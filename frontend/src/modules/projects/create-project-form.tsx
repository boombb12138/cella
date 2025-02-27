import { zodResolver } from '@hookform/resolvers/zod';
import type React from 'react';
import { type UseFormProps, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { createProjectBodySchema } from 'backend/modules/projects/schema';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { createProject } from '~/api/projects';
import { useFormWithDraft } from '~/hooks/use-draft-form';
import { useMutateQueryData } from '~/hooks/use-mutate-query-data';
import { useMutation } from '~/hooks/use-mutations';
import { addMenuItem } from '~/lib/utils';
import { isDialog as checkDialog, dialog } from '~/modules/common/dialoger/state';
import InputFormField from '~/modules/common/form-fields/input';
import SelectParentFormField from '~/modules/common/form-fields/select-parent';
import { SlugFormField } from '~/modules/common/form-fields/slug';
import UnsavedBadge from '~/modules/common/unsaved-badge';
import { Button } from '~/modules/ui/button';
import { useNavigationStore } from '~/store/navigation';
import type { UserMenuItem, Workspace } from '~/types';
import { Form } from '../ui/form';

interface CreateProjectFormProps {
  workspace: Workspace;
  callback?: () => void;
  dialog?: boolean;
}

const formSchema = createProjectBodySchema;

type FormValues = z.infer<typeof formSchema>;

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ workspace, dialog: isDialog }) => {
  const { t } = useTranslation();
  const type = 'project';
  const formOptions: UseFormProps<FormValues> = useMemo(
    () => ({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: '',
        slug: '',
        color: '#000000',
        workspaceId: workspace.id,
        organizationId: workspace.organizationId,
      },
    }),
    [],
  );

  // Form with draft in local storage
  const form = useFormWithDraft<FormValues>('create-project', formOptions);
  // Watch to update slug field
  const name = useWatch({ control: form.control, name: 'name' });

  const callback = useMutateQueryData(['projects', workspace.id]);

  const { mutate: create, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      return createProject(workspace.id, values);
    },
    onSuccess: (createdProject) => {
      form.reset();
      toast.success(t('common:success.create_resource', { resource: t(`common:${type}`) }));
      callback([createdProject], 'create');
      useNavigationStore.setState({
        menu: addMenuItem({ ...createdProject, ...({ parentId: createdProject.workspaceId } as UserMenuItem) }, 'workspaces'),
      });
      if (isDialog) dialog.remove();
    },
  });

  const onSubmit = (values: FormValues) => {
    create(values);
  };

  // Update dialog title with unsaved changes
  useEffect(() => {
    if (form.unsavedChanges) {
      const targetDialog = dialog.get('create-project');
      if (targetDialog && checkDialog(targetDialog)) {
        dialog.update('create-project', {
          title: <UnsavedBadge title={targetDialog?.title} />,
        });
      }
      return;
    }
    dialog.reset('create-project');
  }, [form.unsavedChanges]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <InputFormField control={form.control} name="name" label={t('common:name')} required />
        <SlugFormField
          control={form.control}
          type="project"
          label={t('common:project_handle')}
          description={t('common:project_handle.text')}
          nameValue={name}
        />
        <SelectParentFormField collection="workspaces" type={type} control={form.control} label={t('common:workspace')} name="workspaceId" disabled />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" disabled={!form.formState.isDirty} loading={isPending}>
            {t('common:create')}
          </Button>
          <Button
            type="reset"
            variant="secondary"
            className={form.formState.isDirty ? '' : 'invisible'}
            aria-label="Cancel"
            onClick={() => form.reset()}
          >
            {t('common:cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
