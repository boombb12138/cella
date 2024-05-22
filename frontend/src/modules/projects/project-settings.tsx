import { useParams } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMutateQueryData } from '~/hooks/use-mutate-query-data';
import { sheet } from '~/modules/common/sheeter/state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/modules/ui/card';
import type { Project } from '~/types';
import { dialog } from '../common/dialoger/state';
import { Button } from '../ui/button';
import DeleteProjects from './delete-project';
import UpdateProjectForm from './update-project';

export const ProjectSettings = ({ sheet: isSheet, project }: { sheet?: boolean; project: Project }) => {
  const { t } = useTranslation();

  const { idOrSlug }: { idOrSlug: string } = useParams({ strict: false });

  const callback = useMutateQueryData(['workspaces', project.workspaceId, 'projects']);

  const openDeleteDialog = () => {
    dialog(
      <DeleteProjects
        dialog
        projects={[project]}
        callback={(projects) => {
          callback(projects, 'delete');
          console.log('callback');
          toast.success(t('common:success.delete_project'));
          sheet.remove('edit-project');
        }}
      />,
      {
        className: 'md:max-w-xl',
        title: t('common:delete_project'),
        text: t('common:confirm.delete_project', { name: 'SETPROJECTNAME' }),
      },
    );
  };
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('common:general')}</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProjectForm
            project={project}
            callback={(project) => {
              if (idOrSlug !== project.slug) {
                // navigate({
                //   to: '/Project/$idOrSlug/board',
                //   params: { idOrSlug: project.slug },
                //   replace: true,
                // });
              }
            }}
            sheet={isSheet}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('common:delete_project')}</CardTitle>
          <CardDescription>
            <Trans i18nKey="common:delete_project_notice.text" values={{ name: 'SETPROJECTNAME' }} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full sm:w-auto" onClick={openDeleteDialog}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>{t('common:delete_project')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
