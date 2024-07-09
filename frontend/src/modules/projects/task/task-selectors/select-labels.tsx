import { CommandEmpty } from 'cmdk';
import { Check, Dot, History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { nanoid } from '~/lib/utils.ts';
import type { Label } from '../../../common/electric/electrify.ts';
import { Kbd } from '../../../common/kbd.tsx';
import { Badge } from '../../../ui/badge.tsx';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../ui/command.tsx';
import { inNumbersArray } from './helpers.ts';

export const badgeStyle = (color?: string | null) => {
  if (!color) return {};
  return { background: color };
};

interface SetLabelsProps {
  labels: Label[];
  value: Label[];
  organizationId: string;
  projectId: string;
  changeLabels: (labels: Label[]) => void;
  createLabel: (label: Label) => void;
  triggerWidth?: number;
  updateLabel?: (labelId: string, useCount: number) => void;
}

const SetLabels = ({ value, changeLabels, createLabel, updateLabel, projectId, organizationId, labels, triggerWidth = 280 }: SetLabelsProps) => {
  const { t } = useTranslation();
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(value);
  const [searchValue, setSearchValue] = useState('');

  const isSearching = searchValue.length > 0;
  const searchedLabels: Label[] = useMemo(() => {
    if (isSearching) return labels.filter((l) => l.name.includes(searchValue));
    return [];
  }, [searchValue, labels]);

  const handleSelectClick = (value?: string) => {
    if (!value) return;
    setSearchValue('');
    const existingLabel = selectedLabels.find((label) => label.name === value);
    if (existingLabel) {
      const updatedLabels = selectedLabels.filter((label) => label.name !== value);
      setSelectedLabels(updatedLabels);
      changeLabels(updatedLabels);
      return;
    }
    const newLabel = labels.find((label) => label.name === value);
    if (newLabel) {
      const updatedLabels = [...selectedLabels, newLabel];
      setSelectedLabels(updatedLabels);
      changeLabels(updatedLabels);
      updateLabel?.(newLabel.id, newLabel.use_count + 1);
      return;
    }
  };

  const handleCreateClick = (value: string) => {
    setSearchValue('');
    if (labels.find((l) => l.name === value)) return handleSelectClick(value);

    const newLabel: Label = {
      id: nanoid(),
      name: value,
      color: '#FFA9BA',
      organization_id: organizationId,
      project_id: projectId,
      last_used: new Date(),
      use_count: 0,
    };

    createLabel(newLabel);
    const updatedLabels = [...selectedLabels, newLabel];
    setSelectedLabels(updatedLabels);
    changeLabels(updatedLabels);
  };

  const renderLabels = (labels: Label[]) => {
    return (
      <>
        {labels.slice(0, 8).map((label, index) => (
          <CommandItem
            key={label.id}
            value={label.name}
            onSelect={(value) => {
              handleSelectClick(value);
            }}
            className="group rounded-md flex justify-between items-center w-full leading-normal"
          >
            <div className="flex items-center gap-2">
              {isSearching ? <Dot className="rounded-md" size={16} style={badgeStyle(label.color)} strokeWidth={8} /> : <History size={16} />}
              <span>{label.name}</span>
            </div>
            <div className="flex items-center">
              {selectedLabels.some((l) => l.id === label.id) && <Check size={16} className="text-success" />}
              {!isSearching && <span className="max-xs:hidden text-xs opacity-50 ml-3 mr-1">{index + 1}</span>}
            </div>
          </CommandItem>
        ))}
      </>
    );
  };

  useEffect(() => {
    setSelectedLabels(value);
  }, [value]);

  return (
    <Command className="relative rounded-lg" style={{ width: `${triggerWidth}px` }}>
      <CommandInput
        autoFocus={true}
        value={searchValue}
        onValueChange={(searchValue) => {
          // If the label types a number, select the label like useHotkeys
          if (inNumbersArray(8, searchValue)) return handleSelectClick(labels[Number.parseInt(searchValue) - 1]?.name);

          setSearchValue(searchValue.toLowerCase());
        }}
        clearValue={setSearchValue}
        wrapClassName="max-sm:hidden"
        className="leading-normal"
        placeholder={t('common:placeholder.search_labels')}
      />
      {!isSearching && <Kbd value="L" className="absolute top-3 right-2.5" />}
      <CommandList>
        <CommandGroup>
          {!isSearching ? (
            <>
              {labels.length === 0 && (
                <CommandEmpty className="text-muted-foreground text-sm flex items-center justify-center px-3 py-2">
                  {t('common:no_resource_yet', { resource: t('common:labels').toLowerCase() })}
                </CommandEmpty>
              )}
              {renderLabels(labels)}
            </>
          ) : searchedLabels.length > 0 ? (
            renderLabels(searchedLabels)
          ) : (
            <CommandItemCreate onSelect={() => handleCreateClick(searchValue)} {...{ searchValue, labels }} />
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default SetLabels;

interface CommandItemCreateProps {
  searchValue: string;
  labels: Label[];
  onSelect: () => void;
}

const CommandItemCreate = ({ searchValue, labels, onSelect }: CommandItemCreateProps) => {
  const { t } = useTranslation();
  const hasNoLabel = !labels.map(({ id }) => id).includes(`${searchValue}`);

  const render = searchValue !== '' && hasNoLabel;

  if (!render) return null;

  // BUG: whenever a space is appended, the Create-Button will not be shown.
  return (
    <CommandItem key={`${searchValue}`} value={`${searchValue}`} className="text-sm m-1 flex justify-center items-center" onSelect={onSelect}>
      {t('common:create_resource', { resource: t('common:label').toLowerCase() })}
      <Badge className="ml-2 px-2 py-0 font-light" variant="plain">
        {searchValue}
      </Badge>
    </CommandItem>
  );
};
