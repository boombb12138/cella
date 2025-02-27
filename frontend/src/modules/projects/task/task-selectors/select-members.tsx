import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarWrap } from '~/modules/common/avatar-wrap';
import { dropdowner } from '~/modules/common/dropdowner/state';
import { Kbd } from '~/modules/common/kbd.tsx';
import type { Member } from '~/types/index.ts';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../ui/command.tsx';
import { inNumbersArray } from './helpers.ts';
import { toast } from 'sonner';
import { useUserStore } from '~/store/user.ts';
import { useWorkspaceStore } from '~/store/workspace.ts';
import { type Task, useElectric } from '~/modules/common/electric/electrify.ts';

interface AssignMembersProps {
  value: Member[];
  projectId: string;
  triggerWidth?: number;
  creationValueChange?: (users: Member[]) => void;
  taskUpdateCallback?: (task: Task) => void;
}

const AssignMembers = ({ projectId, value, taskUpdateCallback, creationValueChange, triggerWidth = 240 }: AssignMembersProps) => {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const { focusedTaskId, members } = useWorkspaceStore();
  const [selectedMembers, setSelectedMembers] = useState<Member[]>(value);
  const [searchValue, setSearchValue] = useState('');
  const [showAll, setShowAll] = useState(false);

  const sortedMembers = members
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => {
      const aSelected = selectedMembers.some((user) => user.id === a.id) ? 1 : 0;
      const bSelected = selectedMembers.some((user) => user.id === b.id) ? 1 : 0;
      return bSelected - aSelected;
    });

  const showedMembers = showAll ? sortedMembers : sortedMembers.slice(0, 8);
  const isSearching = searchValue.length > 0;
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const Electric = useElectric()!;

  const changeAssignedTo = (members: Member[]) => {
    if (!Electric) return toast.error(t('common:local_db_inoperable'));
    if (!focusedTaskId) return;
    const db = Electric.db;
    const assignedTo = members.map((user) => user.id);
    db.tasks
      .update({
        data: {
          assigned_to: assignedTo,
          modified_at: new Date(),
          modified_by: user.id,
        },
        where: {
          id: focusedTaskId,
        },
      })
      .then((updatedTask) => {
        if (taskUpdateCallback) taskUpdateCallback(updatedTask as Task);
      });
    return;
  };

  const handleSelectClick = (id: string) => {
    if (!id) return;
    setSearchValue('');
    dropdowner.remove();
    const existingUser = selectedMembers.find((user) => user.id === id);
    if (existingUser) {
      const updatedList = selectedMembers.filter((user) => user.id !== id);
      setSelectedMembers(updatedList);
      if (creationValueChange) return creationValueChange(updatedList);
      return changeAssignedTo(updatedList);
    }
    const newUser = members.find((m) => m.id === id);
    if (newUser) {
      const updatedList = [...selectedMembers, newUser];
      setSelectedMembers(updatedList);
      if (creationValueChange) return creationValueChange(updatedList);
      changeAssignedTo(updatedList);
      return;
    }
  };

  return (
    <Command className="relative rounded-lg" style={{ width: `${triggerWidth}px` }}>
      <CommandInput
        autoFocus={true}
        value={searchValue}
        onValueChange={(searchValue) => {
          // If the user types a number, select status like useHotkeys
          if (!showAll && inNumbersArray(8, searchValue)) return handleSelectClick(members[Number.parseInt(searchValue) - 1]?.id);
          setSearchValue(searchValue);
        }}
        clearValue={setSearchValue}
        wrapClassName="max-sm:hidden"
        className="leading-normal"
        placeholder={t('common:placeholder.assign')}
      />
      {!isSearching && <Kbd value="A" className="absolute top-3 right-2.5" />}
      <CommandList>
        {!!searchValue.length && (
          <CommandEmpty className="flex justify-center items-center p-2 text-sm">
            {t('common:no_resource_found', { resource: t('common:members').toLowerCase() })}
          </CommandEmpty>
        )}
        {members && (
          <CommandGroup>
            {showedMembers.map((user, index) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={(id) => {
                  handleSelectClick(id);
                  dropdowner.remove();
                  setSearchValue('');
                }}
                className="group rounded-md flex justify-between items-center w-full leading-normal"
              >
                <div className="flex items-center gap-3">
                  <AvatarWrap type="user" id={user.id} name={user.name} url={user.thumbnailUrl} className="h-6 w-6 text-xs" />
                  <span>{user.name}</span>
                </div>

                <div className="flex items-center">
                  {selectedMembers.some((u) => u.id === user.id) && <Check size={16} className="text-success" />}
                  {!isSearching && !showAll && <span className="max-xs:hidden text-xs opacity-50 ml-3 mr-1">{index + 1}</span>}
                </div>
              </CommandItem>
            ))}
            {members.length > 7 && (
              <CommandItem className="flex items-center justify-center " onSelect={() => setShowAll(!showAll)}>
                <span className="text-xs opacity-30">{`${showAll ? 'Hide' : 'Show all'}`}</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};

export default AssignMembers;
