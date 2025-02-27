import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Minimize2, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { TooltipButton } from '~/modules/common/tooltip-button';
import { Button } from '~/modules/ui/button';
import { useWorkspaceStore } from '~/store/workspace';
import { useWorkspaceUIStore } from '~/store/workspace-ui';

interface BoardColumnHeaderProps {
  id: string;
  name: string;
  color: string;
  createFormOpen: boolean;
  openSettings: () => void;
  createFormClick: () => void;
}

export function BoardColumnHeader({ id, name, color, createFormOpen, openSettings, createFormClick }: BoardColumnHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changeColumn } = useWorkspaceUIStore();
  const { workspace, projects } = useWorkspaceStore();
  const [minimize, setMinimize] = useState(false);
  const currentIndex = projects.findIndex((p) => p.id === id);

  const params = useParams({
    strict: false,
  });

  const ArrowClick = (side: 'left' | 'right') => {
    const targetIndex = currentIndex + (side === 'left' ? -1 : 1);
    const slug = projects[targetIndex].slug;
    navigate({
      params,
      replace: true,
      search: (prev) => ({
        ...prev,
        ...{ project: slug },
      }),
    });
  };

  const MinimizeClick = () => {
    setMinimize(!minimize);
    changeColumn(workspace.id, id, {
      minimized: !minimize,
    });
  };

  const stickyStyles = 'sticky sm:relative top-2 sm:top-0 bg-background z-50';

  return (
    <div className={`border p-3 rounded-lg rounded-b-none text-normal leading-4 flex flex-row gap-2 space-between items-center ${stickyStyles}`}>
      {/* Omit style background if projects will be without a color preference. */}
      <AvatarWrap className="h-8 w-8 text-xs" name={name} backgroundColor={color} />
      <div className="truncate leading-6">{name}</div>
      <div className="grow" />
      <TooltipButton toolTipContent={t('common:project_settings')} side="bottom" sideOffset={13} className="max-sm:hidden">
        <Button variant="ghost" size="sm" className="text-sm p-2 h-8" onClick={openSettings}>
          <Settings size={16} />
        </Button>
      </TooltipButton>
      <TooltipButton toolTipContent={t('common:minimize')} side="bottom" sideOffset={13} className="hidden">
        <Button variant="ghost" size="sm" className="text-sm p-2 h-8" onClick={MinimizeClick}>
          <Minimize2 size={16} />
        </Button>
      </TooltipButton>
      <Button disabled={currentIndex === 0} variant="plain" size="xs" className="rounded sm:hidden" onClick={() => ArrowClick('left')}>
        <ArrowLeft size={14} />
      </Button>
      <Button
        disabled={currentIndex === projects.length - 1}
        variant="plain"
        size="xs"
        className="rounded sm:hidden"
        onClick={() => ArrowClick('right')}
      >
        <ArrowRight size={14} />
      </Button>
      <Button variant="plain" size="xs" className="rounded" onClick={createFormClick}>
        <Plus size={16} className={`transition-transform ${createFormOpen ? 'rotate-45 scale-125' : 'rotate-0'}`} />
        <span className="ml-1">{t('common:task')}</span>
      </Button>
    </div>
  );
}
